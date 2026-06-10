import { describe, expect, it } from "vitest";
import { runCommandTool } from "../src/tools/shell.js";

describe("run_command", () => {
  it("captures stdout", async () => {
    expect(await runCommandTool.execute({ command: "echo hello" })).toBe("hello");
  });

  it("captures stderr too", async () => {
    const result = await runCommandTool.execute({ command: "echo oops 1>&2" });
    expect(result).toContain("oops");
  });

  it("reports non-zero exit codes", async () => {
    const result = await runCommandTool.execute({ command: "exit 3" });
    expect(result).toContain("[exit code: 3]");
  });

  it("handles empty output", async () => {
    expect(await runCommandTool.execute({ command: "true" })).toBe("[no output]");
  });

  it("rejects an empty command", async () => {
    expect(await runCommandTool.execute({})).toContain("no command");
  });

  it("requires approval and summarizes as the command itself", () => {
    expect(runCommandTool.needsApproval).toBe(true);
    expect(runCommandTool.summarize({ command: "ls -la" })).toBe("ls -la");
  });
});
