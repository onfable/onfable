import { isCancel, select } from "@clack/prompts";
import pc from "picocolors";

const sessionApproved = new Set<string>();

export type ApprovalResult = "allow" | "deny";

export async function confirmTool(
  toolName: string,
  summary: string,
  yolo: boolean,
): Promise<ApprovalResult> {
  if (yolo || sessionApproved.has(toolName)) return "allow";

  process.stdout.write(
    `\n${pc.yellow("●")} ${pc.bold(toolName)} wants to run:\n${pc.cyan(
      summary
        .split("\n")
        .map((line) => `  ${line}`)
        .join("\n"),
    )}\n`,
  );

  const answer = await select({
    message: "Allow?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "always", label: `Yes, and don't ask again for ${toolName} this session` },
      { value: "no", label: "No" },
    ],
  });

  if (isCancel(answer) || answer === "no") return "deny";
  if (answer === "always") sessionApproved.add(toolName);
  return "allow";
}
