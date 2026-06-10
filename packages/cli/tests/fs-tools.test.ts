import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { editFileTool, listDirTool, readFileTool, writeFileTool } from "../src/tools/fs.js";

let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "onfable-test-"));
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe("write_file", () => {
  it("writes content and creates parent directories", async () => {
    const target = path.join(dir, "nested", "deep", "file.txt");
    const result = await writeFileTool.execute({ path: target, content: "hello" });
    expect(result).toContain("Wrote 5 chars");
    expect(fs.readFileSync(target, "utf8")).toBe("hello");
  });

  it("requires approval", () => {
    expect(writeFileTool.needsApproval).toBe(true);
  });
});

describe("read_file", () => {
  it("reads file content", async () => {
    const target = path.join(dir, "a.txt");
    fs.writeFileSync(target, "content here");
    expect(await readFileTool.execute({ path: target })).toBe("content here");
  });

  it("supports offset paging and reports truncation", async () => {
    const target = path.join(dir, "big.txt");
    fs.writeFileSync(target, "x".repeat(60_000));
    const page = await readFileTool.execute({ path: target });
    expect(page).toContain("truncated");
    const rest = await readFileTool.execute({ path: target, offset: 50_000 });
    expect(rest).toBe("x".repeat(10_000));
  });

  it("does not require approval", () => {
    expect(readFileTool.needsApproval).toBe(false);
  });
});

describe("edit_file", () => {
  it("replaces a unique exact string", async () => {
    const target = path.join(dir, "edit.txt");
    fs.writeFileSync(target, "const a = 1;\nconst b = 2;\n");
    const result = await editFileTool.execute({
      path: target,
      old_string: "const b = 2;",
      new_string: "const b = 42;",
    });
    expect(result).toContain("Edited");
    expect(fs.readFileSync(target, "utf8")).toBe("const a = 1;\nconst b = 42;\n");
  });

  it("errors when old_string is missing", async () => {
    const target = path.join(dir, "edit.txt");
    fs.writeFileSync(target, "abc");
    const result = await editFileTool.execute({
      path: target,
      old_string: "zzz",
      new_string: "y",
    });
    expect(result).toContain("not found");
    expect(fs.readFileSync(target, "utf8")).toBe("abc");
  });

  it("errors when old_string is ambiguous", async () => {
    const target = path.join(dir, "edit.txt");
    fs.writeFileSync(target, "dup\ndup\n");
    const result = await editFileTool.execute({
      path: target,
      old_string: "dup",
      new_string: "x",
    });
    expect(result).toContain("2 times");
    expect(fs.readFileSync(target, "utf8")).toBe("dup\ndup\n");
  });
});

describe("list_dir", () => {
  it("lists entries with directory markers, sorted", async () => {
    fs.mkdirSync(path.join(dir, "sub"));
    fs.writeFileSync(path.join(dir, "b.txt"), "");
    fs.writeFileSync(path.join(dir, "a.txt"), "");
    expect(await listDirTool.execute({ path: dir })).toBe("a.txt\nb.txt\nsub/");
  });

  it("reports empty directories", async () => {
    expect(await listDirTool.execute({ path: dir })).toBe("[empty directory]");
  });
});
