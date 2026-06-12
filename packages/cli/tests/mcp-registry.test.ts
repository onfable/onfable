import { describe, expect, it } from "vitest";
import { KNOWN_SERVERS, findKnownServer } from "../src/mcp/registry.js";

describe("MCP registry", () => {
  it("includes the Base server pointing at the official endpoint", () => {
    const base = findKnownServer("base");
    expect(base).toBeDefined();
    expect(base?.url).toBe("https://mcp.base.org");
  });

  it("returns undefined for unknown servers", () => {
    expect(findKnownServer("nope")).toBeUndefined();
  });

  it("every known server has a name, https url, and description", () => {
    for (const s of KNOWN_SERVERS) {
      expect(s.name).toMatch(/^[a-z0-9-]+$/);
      expect(s.url).toMatch(/^https:\/\//);
      expect(s.description.length).toBeGreaterThan(10);
    }
  });
});
