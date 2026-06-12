import { Command } from "commander";
import pc from "picocolors";
import { chatCommand } from "./commands/chat.js";
import { mcpAdd, mcpList, mcpLogin, mcpRemove } from "./commands/mcp.js";
import { runCommand } from "./commands/run.js";
import { setupCommand } from "./commands/setup.js";
import { CONFIG_PATH, loadConfig, redactedConfig } from "./config.js";
import { VERSION } from "./version.js";

const program = new Command();

program
  .name("onfable")
  .description(
    "The open-source autonomous AI agent that lives in your terminal.\nDocs: https://onfable.xyz",
  )
  .version(VERSION)
  .option("--yolo", "skip tool approval prompts (the agent acts freely)")
  .option("--model <id>", "override the configured model for this session")
  .action(async (flags: { yolo?: boolean; model?: string }) => {
    await chatCommand(flags);
  });

program
  .command("setup")
  .description("interactive onboarding: pick a provider, add your API key")
  .action(async () => {
    await setupCommand();
  });

program
  .command("run <task>")
  .description('one-shot agentic run, e.g. onfable run "organize my downloads"')
  .option("--yolo", "skip tool approval prompts")
  .option("--model <id>", "override the configured model")
  .action(async (task: string, flags: { yolo?: boolean; model?: string }) => {
    await runCommand(task, flags);
  });

const mcp = program
  .command("mcp")
  .description("manage MCP servers (e.g. Base onchain wallet & DeFi)");
mcp
  .command("list")
  .description("list added and available MCP servers")
  .action(() => mcpList());
mcp
  .command("add <name>")
  .description("add an MCP server by name (e.g. base) and authorize it")
  .action(async (name: string) => {
    await mcpAdd(name);
  });
mcp
  .command("login <name>")
  .description("authorize an added MCP server in your browser")
  .action(async (name: string) => {
    await mcpLogin(name);
  });
mcp
  .command("remove <name>")
  .description("remove an MCP server and clear its saved authorization")
  .action((name: string) => mcpRemove(name));

program
  .command("config")
  .description("show the config file path and redacted contents")
  .action(() => {
    console.log(pc.dim(`config: ${CONFIG_PATH}`));
    const config = loadConfig();
    if (!config) {
      console.log("No config yet. Run `onfable setup`.");
      return;
    }
    console.log(JSON.stringify(redactedConfig(config), null, 2));
  });

program.parseAsync().catch((err: unknown) => {
  console.error(pc.red(err instanceof Error ? err.message : String(err)));
  process.exit(1);
});
