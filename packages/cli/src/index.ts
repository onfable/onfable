import { Command } from "commander";
import pc from "picocolors";
import { chatCommand } from "./commands/chat.js";
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
