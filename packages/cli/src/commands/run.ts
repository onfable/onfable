import { runAgentTurn } from "../agent/loop.js";
import { loadConfig } from "../config.js";
import { connectConfiguredServers } from "../mcp/client.js";
import { saveSession } from "../memory/history.js";
import { createProvider } from "../providers/index.js";
import type { ChatMessage } from "../providers/types.js";
import type { Tool } from "../tools/types.js";
import { printError, printInfo } from "../ui/output.js";
import type { ChatFlags } from "./chat.js";

export async function runCommand(task: string, flags: ChatFlags): Promise<void> {
  let config = loadConfig();
  if (!config) {
    printError("No config found. Run `onfable setup` first.");
    process.exit(1);
  }
  if (flags.model) config = { ...config, model: flags.model };

  let extraTools: Tool[] = [];
  if (config.mcpServers && config.mcpServers.length > 0) {
    const { connections, notes } = await connectConfiguredServers(config.mcpServers);
    extraTools = connections.flatMap((c) => c.tools);
    for (const note of notes) printInfo(`! MCP: ${note}`);
  }

  const provider = createProvider(config);
  const messages: ChatMessage[] = [];
  await runAgentTurn(provider, messages, task, {
    yolo: flags.yolo ?? config.yolo ?? false,
    extraTools,
  });
  saveSession(messages);
}
