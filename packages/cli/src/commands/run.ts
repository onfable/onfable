import { runAgentTurn } from "../agent/loop.js";
import { loadConfig } from "../config.js";
import { saveSession } from "../memory/history.js";
import { createProvider } from "../providers/index.js";
import type { ChatMessage } from "../providers/types.js";
import { printError } from "../ui/output.js";
import type { ChatFlags } from "./chat.js";

export async function runCommand(task: string, flags: ChatFlags): Promise<void> {
  let config = loadConfig();
  if (!config) {
    printError("No config found. Run `onfable setup` first.");
    process.exit(1);
  }
  if (flags.model) config = { ...config, model: flags.model };

  const provider = createProvider(config);
  const messages: ChatMessage[] = [];
  await runAgentTurn(provider, messages, task, {
    yolo: flags.yolo ?? config.yolo ?? false,
  });
  saveSession(messages);
}
