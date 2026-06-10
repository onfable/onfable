import { editFileTool, listDirTool, readFileTool, writeFileTool } from "./fs.js";
import { memoryRecallTool, memorySaveTool } from "./memory.js";
import { runCommandTool } from "./shell.js";
import { webFetchTool, webSearchTool } from "./web.js";
import type { Tool } from "./types.js";

export const tools: Tool[] = [
  runCommandTool,
  readFileTool,
  writeFileTool,
  editFileTool,
  listDirTool,
  webFetchTool,
  webSearchTool,
  memorySaveTool,
  memoryRecallTool,
];

export function getTool(name: string): Tool | undefined {
  return tools.find((t) => t.name === name);
}

export type { Tool } from "./types.js";
