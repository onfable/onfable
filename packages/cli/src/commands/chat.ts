import { isCancel, text } from "@clack/prompts";
import pc from "picocolors";
import { runAgentTurn } from "../agent/loop.js";
import { loadConfig } from "../config.js";
import { saveSession } from "../memory/history.js";
import { readMemory } from "../memory/store.js";
import { createProvider } from "../providers/index.js";
import type { ChatMessage } from "../providers/types.js";
import { printInfo } from "../ui/output.js";
import { setupCommand } from "./setup.js";

export interface ChatFlags {
  yolo?: boolean;
  model?: string;
}

const BANNER = `
  ${pc.bold("✳ onfable")} ${pc.dim("— your machine, your agent, your story")}
  ${pc.dim("type /help for commands")}
`;

const HELP = `
  ${pc.bold("Slash commands")}
    /new      reset the session (history is saved to ~/.onfable/history)
    /memory   show everything the agent remembers about you
    /help     show this help
    /exit     quit (also: /quit or Ctrl+C)

  ${pc.bold("Flags")} ${pc.dim("(pass when starting onfable)")}
    --yolo        skip tool approval prompts
    --model <id>  override the configured model for this session

  ${pc.dim("Config: ~/.onfable/config.json · Memory: ~/.onfable/memory.md")}
`;

export async function chatCommand(flags: ChatFlags): Promise<void> {
  let config = loadConfig();
  if (!config) {
    printInfo("No config found — let's set you up first.\n");
    config = await setupCommand();
  }
  if (flags.model) config = { ...config, model: flags.model };
  const yolo = flags.yolo ?? config.yolo ?? false;

  const provider = createProvider(config);
  let messages: ChatMessage[] = [];

  console.log(BANNER);
  if (yolo) printInfo("  --yolo: tool approvals are OFF. The agent acts freely.\n");

  process.on("exit", () => saveSession(messages));

  while (true) {
    const input = await text({ message: "›", placeholder: "Ask me to do something…" });
    if (isCancel(input)) break;
    const trimmed = String(input ?? "").trim();
    if (!trimmed) continue;

    if (trimmed === "/exit" || trimmed === "/quit") break;
    if (trimmed === "/help") {
      console.log(HELP);
      continue;
    }
    if (trimmed === "/new") {
      saveSession(messages);
      messages = [];
      printInfo("Session reset.");
      continue;
    }
    if (trimmed === "/memory") {
      const memory = readMemory();
      console.log(memory ? pc.dim(memory) : pc.dim("[memory is empty]"));
      continue;
    }

    await runAgentTurn(provider, messages, trimmed, { yolo });
  }

  saveSession(messages);
  printInfo("\nUntil next time. ✳");
}
