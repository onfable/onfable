import { spawn } from "node:child_process";
import type { Tool } from "./types.js";

const TIMEOUT_MS = 60_000;
const MAX_OUTPUT = 16_000;

function runShell(command: string): Promise<string> {
  return new Promise((resolve) => {
    const isWindows = process.platform === "win32";
    const child = spawn(
      isWindows ? "cmd.exe" : "/bin/sh",
      isWindows ? ["/c", command] : ["-c", command],
      { cwd: process.cwd(), timeout: TIMEOUT_MS },
    );

    let output = "";
    const append = (chunk: Buffer) => {
      if (output.length < MAX_OUTPUT) output += chunk.toString();
    };
    child.stdout.on("data", append);
    child.stderr.on("data", append);

    child.on("error", (err) => resolve(`Error spawning command: ${err.message}`));
    child.on("close", (code, signal) => {
      let result = output.slice(0, MAX_OUTPUT);
      if (output.length > MAX_OUTPUT) result += "\n…[output truncated]";
      if (signal === "SIGTERM") result += "\n[command timed out after 60s]";
      else if (code !== 0) result += `\n[exit code: ${code}]`;
      resolve(result.trim() || "[no output]");
    });
  });
}

export const runCommandTool: Tool = {
  name: "run_command",
  description:
    "Run a shell command on the user's machine and return its output (stdout + stderr). " +
    "Commands run in the current working directory with a 60 second timeout. " +
    "Use this for anything the other tools don't cover: git, package managers, moving files, system info, etc.",
  inputSchema: {
    type: "object",
    properties: {
      command: { type: "string", description: "The shell command to run" },
    },
    required: ["command"],
  },
  needsApproval: true,
  summarize: (args) => String(args.command ?? ""),
  async execute(args) {
    const command = String(args.command ?? "");
    if (!command) return "Error: no command provided";
    return runShell(command);
  },
};
