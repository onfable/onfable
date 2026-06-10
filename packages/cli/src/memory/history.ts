import fs from "node:fs";
import path from "node:path";
import { ensureDirs, HISTORY_DIR } from "../config.js";
import type { ChatMessage } from "../providers/types.js";

export function saveSession(messages: ChatMessage[]): void {
  if (messages.length === 0) return;
  try {
    ensureDirs();
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    fs.writeFileSync(
      path.join(HISTORY_DIR, `${stamp}.json`),
      JSON.stringify(messages, null, 2),
    );
  } catch {
    // History is best-effort; never crash the CLI over it.
  }
}
