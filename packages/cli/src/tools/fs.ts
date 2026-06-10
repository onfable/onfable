import fs from "node:fs";
import path from "node:path";
import type { Tool } from "./types.js";

const MAX_READ = 50_000;

function resolvePath(p: string): string {
  return path.resolve(process.cwd(), p);
}

export const readFileTool: Tool = {
  name: "read_file",
  description:
    "Read a text file from the user's machine. Returns up to 50,000 characters; pass offset to read further.",
  inputSchema: {
    type: "object",
    properties: {
      path: { type: "string", description: "File path (absolute or relative to cwd)" },
      offset: {
        type: "number",
        description: "Character offset to start reading from (default 0)",
      },
    },
    required: ["path"],
  },
  needsApproval: false,
  summarize: (args) => String(args.path ?? ""),
  async execute(args) {
    const filePath = resolvePath(String(args.path ?? ""));
    const offset = Number(args.offset ?? 0);
    const content = fs.readFileSync(filePath, "utf8");
    const slice = content.slice(offset, offset + MAX_READ);
    const suffix =
      content.length > offset + MAX_READ
        ? `\n…[truncated — file is ${content.length} chars, read offset ${offset}-${offset + MAX_READ}]`
        : "";
    return slice + suffix;
  },
};

export const writeFileTool: Tool = {
  name: "write_file",
  description:
    "Write content to a file on the user's machine, creating it (and parent directories) if needed, or overwriting it.",
  inputSchema: {
    type: "object",
    properties: {
      path: { type: "string", description: "File path (absolute or relative to cwd)" },
      content: { type: "string", description: "The full file content to write" },
    },
    required: ["path", "content"],
  },
  needsApproval: true,
  summarize: (args) => {
    const content = String(args.content ?? "");
    const preview = content.split("\n").slice(0, 3).join("\n");
    return `${args.path} (${content.length} chars)\n${preview}${content.split("\n").length > 3 ? "\n…" : ""}`;
  },
  async execute(args) {
    const filePath = resolvePath(String(args.path ?? ""));
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, String(args.content ?? ""));
    return `Wrote ${String(args.content ?? "").length} chars to ${filePath}`;
  },
};

export const editFileTool: Tool = {
  name: "edit_file",
  description:
    "Edit a file by replacing an exact string with a new string. " +
    "old_string must appear exactly once in the file — include enough surrounding context to make it unique.",
  inputSchema: {
    type: "object",
    properties: {
      path: { type: "string", description: "File path (absolute or relative to cwd)" },
      old_string: { type: "string", description: "Exact text to replace (must be unique in the file)" },
      new_string: { type: "string", description: "Replacement text" },
    },
    required: ["path", "old_string", "new_string"],
  },
  needsApproval: true,
  summarize: (args) => {
    const oldStr = String(args.old_string ?? "");
    const newStr = String(args.new_string ?? "");
    const clip = (s: string) => (s.length > 120 ? s.slice(0, 120) + "…" : s);
    return `${args.path}\n- ${clip(oldStr)}\n+ ${clip(newStr)}`;
  },
  async execute(args) {
    const filePath = resolvePath(String(args.path ?? ""));
    const oldStr = String(args.old_string ?? "");
    const newStr = String(args.new_string ?? "");
    const content = fs.readFileSync(filePath, "utf8");
    const count = content.split(oldStr).length - 1;
    if (count === 0) return "Error: old_string not found in file";
    if (count > 1)
      return `Error: old_string appears ${count} times — add more context to make it unique`;
    fs.writeFileSync(filePath, content.replace(oldStr, newStr));
    return `Edited ${filePath}`;
  },
};

export const listDirTool: Tool = {
  name: "list_dir",
  description: "List the entries of a directory. Directories are marked with a trailing slash.",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Directory path (absolute or relative to cwd). Defaults to cwd.",
      },
    },
  },
  needsApproval: false,
  summarize: (args) => String(args.path ?? "."),
  async execute(args) {
    const dirPath = resolvePath(String(args.path ?? "."));
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    if (entries.length === 0) return "[empty directory]";
    return entries
      .map((e) => (e.isDirectory() ? `${e.name}/` : e.name))
      .sort()
      .join("\n");
  },
};
