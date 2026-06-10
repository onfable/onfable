import fs from "node:fs";
import { ensureDirs, MEMORY_PATH } from "../config.js";

const MEMORY_INJECT_LIMIT = 4_000;

export function appendMemory(note: string): void {
  ensureDirs();
  const date = new Date().toISOString().slice(0, 10);
  fs.appendFileSync(MEMORY_PATH, `- [${date}] ${note.trim()}\n`);
}

export function readMemory(filter?: string): string {
  try {
    const content = fs.readFileSync(MEMORY_PATH, "utf8");
    if (!filter) return content;
    const lower = filter.toLowerCase();
    return (
      content
        .split("\n")
        .filter((line) => line.toLowerCase().includes(lower))
        .join("\n") || "[no matching memories]"
    );
  } catch {
    return "";
  }
}

/** Memory excerpt for the system prompt: newest entries last, capped in size. */
export function memoryForPrompt(): string {
  const content = readMemory();
  if (!content) return "";
  if (content.length <= MEMORY_INJECT_LIMIT) return content;
  return "…\n" + content.slice(-MEMORY_INJECT_LIMIT);
}
