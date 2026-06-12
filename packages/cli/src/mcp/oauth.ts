import { createServer } from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import type {
  OAuthClientInformation,
  OAuthClientInformationFull,
  OAuthClientMetadata,
  OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import type { OAuthClientProvider } from "@modelcontextprotocol/sdk/client/auth.js";
import { MCP_DIR, ensureDirs } from "../config.js";

const CALLBACK_PORT = 8976;
const CALLBACK_PATH = "/callback";
const REDIRECT_URL = `http://localhost:${CALLBACK_PORT}${CALLBACK_PATH}`;

interface PersistedAuth {
  clientInformation?: OAuthClientInformationFull;
  tokens?: OAuthTokens;
  codeVerifier?: string;
}

function openBrowser(url: string): void {
  const platform = process.platform;
  const cmd =
    platform === "darwin" ? "open" : platform === "win32" ? "cmd" : "xdg-open";
  const args = platform === "win32" ? ["/c", "start", "", url] : [url];
  try {
    spawn(cmd, args, { stdio: "ignore", detached: true }).unref();
  } catch {
    // Browser launch is best-effort; the URL is also printed for the user.
  }
}

/**
 * File-backed OAuth provider for a single MCP server. Persists client
 * registration, PKCE verifier, and tokens under ~/.onfable/mcp/<server>.json,
 * and completes the browser authorization via a one-shot loopback server.
 */
export class NodeOAuthProvider implements OAuthClientProvider {
  private readonly file: string;
  private persisted: PersistedAuth;

  constructor(private readonly serverName: string) {
    ensureDirs();
    this.file = path.join(MCP_DIR, `${serverName}.json`);
    this.persisted = this.read();
  }

  private read(): PersistedAuth {
    try {
      return JSON.parse(fs.readFileSync(this.file, "utf8")) as PersistedAuth;
    } catch {
      return {};
    }
  }

  private write(): void {
    fs.writeFileSync(this.file, JSON.stringify(this.persisted, null, 2), {
      mode: 0o600,
    });
  }

  get redirectUrl(): string {
    return REDIRECT_URL;
  }

  get clientMetadata(): OAuthClientMetadata {
    return {
      client_name: "onfable",
      redirect_uris: [REDIRECT_URL],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
      client_uri: "https://onfable.xyz",
    };
  }

  clientInformation(): OAuthClientInformation | undefined {
    return this.persisted.clientInformation;
  }

  saveClientInformation(info: OAuthClientInformationFull): void {
    this.persisted.clientInformation = info;
    this.write();
  }

  tokens(): OAuthTokens | undefined {
    return this.persisted.tokens;
  }

  saveTokens(tokens: OAuthTokens): void {
    this.persisted.tokens = tokens;
    this.write();
  }

  saveCodeVerifier(verifier: string): void {
    this.persisted.codeVerifier = verifier;
    this.write();
  }

  codeVerifier(): string {
    if (!this.persisted.codeVerifier) {
      throw new Error("No PKCE code verifier saved");
    }
    return this.persisted.codeVerifier;
  }

  /** True if we already hold tokens (so connecting won't trigger a browser flow). */
  hasTokens(): boolean {
    return !!this.persisted.tokens;
  }

  clear(): void {
    try {
      fs.rmSync(this.file, { force: true });
    } catch {
      /* ignore */
    }
    this.persisted = {};
  }

  // The transport calls this when it needs the user to authorize. We open the
  // browser and wait (via waitForCallback) for the redirect to land.
  redirectToAuthorization(authorizationUrl: URL): void {
    process.stdout.write(
      `\nAuthorize onfable to use the ${this.serverName} MCP server:\n  ${authorizationUrl.toString()}\n\n` +
        "Opening your browser… (if it doesn't open, paste the URL above)\n",
    );
    openBrowser(authorizationUrl.toString());
  }

  /**
   * Run a one-shot loopback server and resolve with the authorization code
   * once the provider redirects back. Caller invokes transport.finishAuth(code).
   */
  waitForCallback(timeoutMs = 300_000): Promise<string> {
    return new Promise((resolve, reject) => {
      const server = createServer((req, res) => {
        if (!req.url || !req.url.startsWith(CALLBACK_PATH)) {
          res.writeHead(404).end();
          return;
        }
        const url = new URL(req.url, REDIRECT_URL);
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");
        res.writeHead(200, { "Content-Type": "text/html" }).end(
          `<!doctype html><html><body style="background:#000;color:#fff;font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0">` +
            `<div style="text-align:center"><div style="font-size:40px">✳</div>` +
            `<h2>${error ? "Authorization failed" : "onfable is connected"}</h2>` +
            `<p style="color:#a1a1aa">You can close this tab and return to your terminal.</p></div></body></html>`,
        );
        server.close();
        clearTimeout(timer);
        if (error) reject(new Error(`Authorization failed: ${error}`));
        else if (code) resolve(code);
        else reject(new Error("No authorization code returned"));
      });
      const timer = setTimeout(() => {
        server.close();
        reject(new Error("Timed out waiting for authorization"));
      }, timeoutMs);
      server.on("error", reject);
      server.listen(CALLBACK_PORT);
    });
  }
}
