import { intro, outro, spinner } from "@clack/prompts";
import pc from "picocolors";
import { loadConfig, saveConfig, type McpServerConfig } from "../config.js";
import { connectMcpServer } from "../mcp/client.js";
import { NodeOAuthProvider } from "../mcp/oauth.js";
import { KNOWN_SERVERS, findKnownServer } from "../mcp/registry.js";
import { printError, printInfo } from "../ui/output.js";

function requireConfig() {
  const config = loadConfig();
  if (!config) {
    printError("No config found. Run `onfable setup` first.");
    process.exit(1);
  }
  return config;
}

export function mcpList(): void {
  const config = requireConfig();
  const servers = config.mcpServers ?? [];
  if (servers.length === 0) {
    printInfo("No MCP servers added. Try: onfable mcp add base");
  } else {
    console.log(pc.bold("\nConnected MCP servers:"));
    for (const s of servers) {
      const authed = new NodeOAuthProvider(s.name).hasTokens();
      const badge = authed ? pc.green("authorized") : pc.yellow("needs login");
      console.log(`  ${pc.bold(s.name)}  ${pc.dim(s.url)}  [${badge}]`);
    }
  }
  console.log(pc.bold("\nAvailable to add:"));
  for (const s of KNOWN_SERVERS) {
    console.log(`  ${pc.bold(s.name)} — ${pc.dim(s.description)}`);
  }
  console.log();
}

export async function mcpAdd(name: string): Promise<void> {
  const config = requireConfig();
  const known = findKnownServer(name);
  // Allow ad-hoc URLs too: `onfable mcp add myserver https://...`
  const server: McpServerConfig | undefined = known
    ? { name: known.name, url: known.url }
    : undefined;
  if (!server) {
    printError(
      `Unknown server "${name}". Known: ${KNOWN_SERVERS.map((s) => s.name).join(", ")}.`,
    );
    process.exit(1);
  }

  const existing = config.mcpServers ?? [];
  if (existing.some((s) => s.name === server.name)) {
    printInfo(`${server.name} is already added. Run \`onfable mcp login ${server.name}\` if needed.`);
    return;
  }
  saveConfig({ ...config, mcpServers: [...existing, server] });
  printInfo(`Added ${pc.bold(server.name)}. Authorizing…`);
  await mcpLogin(server.name);
}

export async function mcpLogin(name: string): Promise<void> {
  const config = requireConfig();
  const server = (config.mcpServers ?? []).find((s) => s.name === name);
  if (!server) {
    printError(`${name} isn't added. Run \`onfable mcp add ${name}\` first.`);
    process.exit(1);
  }

  intro(pc.bold(` onfable mcp · ${name} `));
  const s = spinner();
  s.start("Connecting (a browser window will open to authorize)");
  try {
    const conn = await connectMcpServer(server, { interactive: true });
    await conn.client.close();
    s.stop(`Authorized — ${conn.tools.length} tools available from ${name}`);
    outro(`Run ${pc.cyan("onfable")} and ask it to use ${name}.`);
  } catch (err) {
    s.stop(pc.red(`Failed: ${err instanceof Error ? err.message : String(err)}`));
    process.exit(1);
  }
}

export function mcpRemove(name: string): void {
  const config = requireConfig();
  const next = (config.mcpServers ?? []).filter((s) => s.name !== name);
  saveConfig({ ...config, mcpServers: next });
  new NodeOAuthProvider(name).clear();
  printInfo(`Removed ${name} and cleared its saved authorization.`);
}
