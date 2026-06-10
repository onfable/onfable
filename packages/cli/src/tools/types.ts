import type { ToolDef } from "../providers/types.js";

export interface Tool extends ToolDef {
  /** Dangerous tools require user confirmation before executing. */
  needsApproval: boolean;
  /** One-line human-readable summary of what this call will do, shown in approval prompts and banners. */
  summarize(args: Record<string, unknown>): string;
  execute(args: Record<string, unknown>): Promise<string>;
}
