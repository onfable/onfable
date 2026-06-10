import { describe, expect, it } from "vitest";
import { redactedConfig, type OnfableConfig } from "../src/config.js";

const base: OnfableConfig = {
  provider: "anthropic",
  apiKey: "sk-ant-api03-abcdefghijklmnop",
  model: "claude-opus-4-8",
};

describe("redactedConfig", () => {
  it("masks the middle of long keys", () => {
    const redacted = redactedConfig(base);
    expect(redacted.apiKey).toBe("sk-ant…mnop");
    expect(String(redacted.apiKey)).not.toContain("abcdefghijklmnop");
  });

  it("fully masks short keys", () => {
    const redacted = redactedConfig({ ...base, apiKey: "tiny" });
    expect(redacted.apiKey).toBe("•••");
  });

  it("leaves non-secret fields intact", () => {
    const redacted = redactedConfig(base);
    expect(redacted.provider).toBe("anthropic");
    expect(redacted.model).toBe("claude-opus-4-8");
  });
});
