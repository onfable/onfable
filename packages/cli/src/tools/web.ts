import type { Tool } from "./types.js";

const FETCH_TIMEOUT_MS = 15_000;
const MAX_CONTENT = 20_000;

/** Crude but dependency-free HTML → readable text conversion. */
export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "onfable/0.1 (+https://onfable.xyz)" },
      redirect: "follow",
    });
  } finally {
    clearTimeout(timer);
  }
}

export const webFetchTool: Tool = {
  name: "web_fetch",
  description:
    "Fetch a URL and return its content as readable text (HTML is stripped). " +
    "Use this to read documentation, articles, or APIs.",
  inputSchema: {
    type: "object",
    properties: {
      url: { type: "string", description: "The URL to fetch (http/https)" },
    },
    required: ["url"],
  },
  needsApproval: false,
  summarize: (args) => String(args.url ?? ""),
  async execute(args) {
    const url = String(args.url ?? "");
    if (!/^https?:\/\//i.test(url)) return "Error: URL must start with http:// or https://";
    const res = await fetchWithTimeout(url);
    if (!res.ok) return `Error: HTTP ${res.status} ${res.statusText}`;
    const contentType = res.headers.get("content-type") ?? "";
    const body = await res.text();
    const text = contentType.includes("html") ? htmlToText(body) : body;
    return text.length > MAX_CONTENT
      ? text.slice(0, MAX_CONTENT) + "\n…[truncated]"
      : text || "[empty response]";
  },
};

export const webSearchTool: Tool = {
  name: "web_search",
  description:
    "Search the web and return the top results as {title, url, snippet}. " +
    "Best-effort — if search is unavailable, fall back to web_fetch with a known URL.",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "The search query" },
    },
    required: ["query"],
  },
  needsApproval: false,
  summarize: (args) => String(args.query ?? ""),
  async execute(args) {
    const query = String(args.query ?? "");
    try {
      const res = await fetchWithTimeout(
        `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();

      const results: { title: string; url: string; snippet: string }[] = [];
      const linkRe =
        /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
      const snippetRe =
        /<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
      const snippets: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = snippetRe.exec(html)) !== null) snippets.push(htmlToText(m[1]));
      let i = 0;
      while ((m = linkRe.exec(html)) !== null && results.length < 5) {
        let url = m[1];
        // DDG wraps result URLs in a redirect — unwrap uddg param when present
        const uddg = /[?&]uddg=([^&]+)/.exec(url);
        if (uddg) url = decodeURIComponent(uddg[1]);
        results.push({
          title: htmlToText(m[2]),
          url,
          snippet: snippets[i++] ?? "",
        });
      }

      if (results.length === 0) {
        return "Search returned no parseable results. Try web_fetch with a specific URL instead.";
      }
      return results
        .map((r, idx) => `${idx + 1}. ${r.title}\n   ${r.url}\n   ${r.snippet}`)
        .join("\n\n");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return `Search unavailable (${message}). Try web_fetch with a specific URL instead.`;
    }
  },
};
