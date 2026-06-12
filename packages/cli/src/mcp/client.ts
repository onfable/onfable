import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { UnauthorizedError } from "@modelcontextprotocol/sdk/client/auth.js";
import type { McpServerConfig } from "../config.js";
import type { Tool } from "../tools/types.js";
import { NodeOAuthProvider } from "./oauth.js";

const VERSION = "0.1.0";

export interface McpConnection {
  name: string;
  client: Client;
  tools: Tool[];
}

/** Wrap a remote MCP tool as an onfable Tool. MCP tools always need approval —
 *  they can move funds and touch external systems. */
function wrapTool(
  serverName: string,
  client: Client,
  def: { name: string; description?: string; inputSchema: unknown },
): Tool {
  return {
    // Namespaced so two servers can't collide and the user sees the source.
    name: `${serverName}__${def.name}`,
    description: `[${serverName}] ${def.description ?? def.name}`,
    inputSchema: (def.inputSchema as Record<string, unknown>) ?? {
      type: "object",
      properties: {},
    },
    needsApproval: true,
    summarize(args) {
      const json = JSON.stringify(args);
      return `${def.name} ${json.length > 120 ? json.slice(0, 120) + "…" : json}`;
    },
    async execute(args) {
      const result = await client.callTool({ name: def.name, arguments: args });
      const content = (result.content ?? []) as Array<{
        type: string;
        text?: string;
      }>;
      const text = content
        .map((c) => (c.type === "text" ? c.text : `[${c.type}]`))
        .join("\n");
      return result.isError ? `Error: ${text}` : text || "[no output]";
    },
  };
}

/**
 * Connect to one MCP server. If `interactive`, run the OAuth browser flow when
 * the server demands it; otherwise (e.g. at chat startup) skip servers that
 * aren't already authorized and surface a hint.
 */
export async function connectMcpServer(
  config: McpServerConfig,
  opts: { interactive: boolean } = { interactive: false },
): Promise<McpConnection> {
  const authProvider = new NodeOAuthProvider(config.name);

  if (!authProvider.hasTokens() && !opts.interactive) {
    throw new Error(
      `${config.name} is not authorized yet — run \`onfable mcp login ${config.name}\``,
    );
  }

  const client = new Client({ name: "onfable", version: VERSION });

  const connect = async () => {
    const transport = new StreamableHTTPClientTransport(new URL(config.url), {
      authProvider,
    });
    await client.connect(transport);
    return transport;
  };

  try {
    await connect();
  } catch (err) {
    if (err instanceof UnauthorizedError && opts.interactive) {
      // The provider already opened the browser; wait for the redirect, finish
      // the handshake, then connect again now that we hold tokens.
      const code = await authProvider.waitForCallback();
      const transport = new StreamableHTTPClientTransport(new URL(config.url), {
        authProvider,
      });
      await transport.finishAuth(code);
      await client.connect(transport);
    } else {
      throw err;
    }
  }

  const { tools } = await client.listTools();
  return {
    name: config.name,
    client,
    tools: tools.map((t) => wrapTool(config.name, client, t)),
  };
}

/** Connect to all configured servers that are ready. Returns connections plus
 *  non-fatal notes for servers that were skipped (e.g. not logged in). */
export async function connectConfiguredServers(
  servers: McpServerConfig[],
): Promise<{ connections: McpConnection[]; notes: string[] }> {
  const connections: McpConnection[] = [];
  const notes: string[] = [];
  for (const server of servers) {
    try {
      connections.push(await connectMcpServer(server, { interactive: false }));
    } catch (err) {
      notes.push(err instanceof Error ? err.message : String(err));
    }
  }
  return { connections, notes };
}
