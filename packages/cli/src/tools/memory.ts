import { appendMemory, readMemory } from "../memory/store.js";
import type { Tool } from "./types.js";

export const memorySaveTool: Tool = {
  name: "memory_save",
  description:
    "Save a short note to persistent memory (~/.onfable/memory.md). " +
    "Use this for durable facts about the user: preferences, project context, recurring tasks. " +
    "Notes are injected into your context in future sessions.",
  inputSchema: {
    type: "object",
    properties: {
      note: { type: "string", description: "A concise, self-contained note to remember" },
    },
    required: ["note"],
  },
  needsApproval: false,
  summarize: (args) => String(args.note ?? ""),
  async execute(args) {
    const note = String(args.note ?? "").trim();
    if (!note) return "Error: empty note";
    appendMemory(note);
    return "Saved to memory.";
  },
};

export const memoryRecallTool: Tool = {
  name: "memory_recall",
  description:
    "Read persistent memory. Optionally filter lines by a substring. " +
    "Recent memory is already in your context — use this to search older entries.",
  inputSchema: {
    type: "object",
    properties: {
      filter: {
        type: "string",
        description: "Optional substring to filter memory lines by",
      },
    },
  },
  needsApproval: false,
  summarize: (args) => (args.filter ? `filter: ${args.filter}` : "all"),
  async execute(args) {
    const memory = readMemory(args.filter ? String(args.filter) : undefined);
    return memory || "[memory is empty]";
  },
};
