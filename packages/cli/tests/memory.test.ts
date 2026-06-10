import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Point HOME at a temp dir BEFORE the module under test resolves ~/.onfable
const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), "onfable-home-"));
const realHome = process.env.HOME;

beforeAll(() => {
  process.env.HOME = fakeHome;
});

afterAll(() => {
  process.env.HOME = realHome;
  fs.rmSync(fakeHome, { recursive: true, force: true });
});

describe("memory store", () => {
  it("appends dated bullets and reads them back", async () => {
    const { appendMemory, readMemory } = await import("../src/memory/store.js");
    appendMemory("user prefers tabs over spaces");
    appendMemory("project uses pnpm");

    const memory = readMemory();
    const today = new Date().toISOString().slice(0, 10);
    expect(memory).toContain(`- [${today}] user prefers tabs over spaces`);
    expect(memory).toContain("project uses pnpm");
  });

  it("filters lines case-insensitively", async () => {
    const { readMemory } = await import("../src/memory/store.js");
    expect(readMemory("PNPM")).toContain("project uses pnpm");
    expect(readMemory("PNPM")).not.toContain("tabs over spaces");
  });

  it("reports no matches without erroring", async () => {
    const { readMemory } = await import("../src/memory/store.js");
    expect(readMemory("nonexistent-topic")).toBe("[no matching memories]");
  });

  it("caps the prompt excerpt and keeps the newest entries", async () => {
    const { appendMemory, memoryForPrompt } = await import("../src/memory/store.js");
    for (let i = 0; i < 100; i++) appendMemory(`filler note number ${i} ${"x".repeat(80)}`);
    const excerpt = memoryForPrompt();
    expect(excerpt.length).toBeLessThanOrEqual(4_002); // 4000-char cap + "…\n" prefix
    expect(excerpt).toContain("filler note number 99");
  });
});
