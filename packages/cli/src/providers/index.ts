import { createAnthropicProvider } from "./anthropic.js";
import { createOpenAIProvider } from "./openai.js";
import type { Provider, ProviderConfig } from "./types.js";

export function createProvider(config: ProviderConfig): Provider {
  if (config.provider === "anthropic") {
    return createAnthropicProvider(config);
  }
  // openai, openrouter, and custom all speak the OpenAI-compatible API
  return createOpenAIProvider(config);
}

export * from "./types.js";
