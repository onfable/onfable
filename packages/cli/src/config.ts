import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { ProviderConfig } from "./providers/types.js";

export interface McpServerConfig {
  /** Short id used in commands and on disk, e.g. "base". */
  name: string;
  /** Streamable HTTP endpoint, e.g. https://mcp.base.org */
  url: string;
}

export interface OnfableConfig extends ProviderConfig {
  yolo?: boolean;
  mcpServers?: McpServerConfig[];
}

export const ONFABLE_DIR = path.join(os.homedir(), ".onfable");
export const CONFIG_PATH = path.join(ONFABLE_DIR, "config.json");
export const MEMORY_PATH = path.join(ONFABLE_DIR, "memory.md");
export const HISTORY_DIR = path.join(ONFABLE_DIR, "history");
export const MCP_DIR = path.join(ONFABLE_DIR, "mcp");

export function ensureDirs(): void {
  fs.mkdirSync(ONFABLE_DIR, { recursive: true });
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
  fs.mkdirSync(MCP_DIR, { recursive: true });
}

export function loadConfig(): OnfableConfig | null {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf8");
    const parsed = JSON.parse(raw) as OnfableConfig;
    if (!parsed.provider || !parsed.apiKey || !parsed.model) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveConfig(config: OnfableConfig): void {
  ensureDirs();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n", {
    mode: 0o600,
  });
  // chmod again in case the file already existed with looser permissions
  fs.chmodSync(CONFIG_PATH, 0o600);
}

export function redactedConfig(config: OnfableConfig): Record<string, unknown> {
  const key = config.apiKey;
  const redacted =
    key.length > 8 ? `${key.slice(0, 6)}…${key.slice(-4)}` : "•••";
  return { ...config, apiKey: redacted };
}
