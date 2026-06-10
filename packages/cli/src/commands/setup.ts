import {
  cancel,
  intro,
  isCancel,
  note,
  outro,
  password,
  select,
  spinner,
  text,
} from "@clack/prompts";
import pc from "picocolors";
import { saveConfig, type OnfableConfig } from "../config.js";
import { createProvider } from "../providers/index.js";
import type { ProviderKind } from "../providers/types.js";

const DEFAULT_MODELS: Record<ProviderKind, { value: string; label: string }[]> = {
  anthropic: [
    { value: "claude-fable-5", label: "claude-fable-5 (most powerful — the namesake ✳)" },
    { value: "claude-opus-4-8", label: "claude-opus-4-8 (recommended balance)" },
    { value: "claude-sonnet-4-6", label: "claude-sonnet-4-6 (fast + smart)" },
    { value: "claude-haiku-4-5", label: "claude-haiku-4-5 (fastest, cheapest)" },
  ],
  openai: [
    { value: "gpt-5.2", label: "gpt-5.2" },
    { value: "gpt-5-mini", label: "gpt-5-mini" },
    { value: "gpt-4.1", label: "gpt-4.1" },
  ],
  openrouter: [],
  custom: [],
};

function bail(value: unknown): value is symbol {
  if (isCancel(value)) {
    cancel("Setup cancelled — run `onfable setup` anytime.");
    process.exit(0);
  }
  return false;
}

export async function setupCommand(): Promise<OnfableConfig> {
  intro(pc.bold(" onfable setup "));

  const provider = await select<ProviderKind>({
    message: "Which AI provider powers your agent?",
    options: [
      { value: "anthropic", label: "Anthropic (Claude)", hint: "recommended" },
      { value: "openai", label: "OpenAI" },
      { value: "openrouter", label: "OpenRouter", hint: "hundreds of models, one key" },
      { value: "custom", label: "Custom OpenAI-compatible endpoint" },
    ],
  });
  bail(provider);

  let baseUrl: string | undefined;
  if (provider === "custom") {
    const url = await text({
      message: "Base URL of your OpenAI-compatible endpoint",
      placeholder: "https://my-endpoint.example.com/v1",
      validate: (v) =>
        /^https?:\/\//.test(v ?? "") ? undefined : "Must start with http(s)://",
    });
    bail(url);
    baseUrl = String(url);
  }

  const keyHints: Record<ProviderKind, string> = {
    anthropic: "console.anthropic.com → API keys",
    openai: "platform.openai.com → API keys",
    openrouter: "openrouter.ai → Keys",
    custom: "your endpoint's API key",
  };
  const apiKey = await password({
    message: `API key (${keyHints[provider as ProviderKind]})`,
    validate: (v) => (v && v.length > 5 ? undefined : "That doesn't look like a key"),
  });
  bail(apiKey);

  let model: string;
  const presets = DEFAULT_MODELS[provider as ProviderKind];
  if (presets.length > 0) {
    const choice = await select({
      message: "Model",
      options: [...presets, { value: "__other__", label: "Other (type a model id)" }],
    });
    bail(choice);
    if (choice === "__other__") {
      const custom = await text({ message: "Model id" });
      bail(custom);
      model = String(custom);
    } else {
      model = String(choice);
    }
  } else {
    const custom = await text({
      message: "Model id",
      placeholder:
        provider === "openrouter" ? "anthropic/claude-opus-4.8" : "model-id",
      validate: (v) => (v ? undefined : "Model id is required"),
    });
    bail(custom);
    model = String(custom);
  }

  const config: OnfableConfig = {
    provider: provider as ProviderKind,
    apiKey: String(apiKey),
    model,
    ...(baseUrl ? { baseUrl } : {}),
  };

  const s = spinner();
  s.start("Validating credentials");
  try {
    await createProvider(config).validate();
    s.stop("Credentials look good");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    s.stop(pc.yellow(`Could not validate: ${message}`));
    const proceed = await select({
      message: "Save anyway?",
      options: [
        { value: "yes", label: "Yes, save it" },
        { value: "no", label: "No, let me re-enter" },
      ],
    });
    bail(proceed);
    if (proceed === "no") return setupCommand();
  }

  saveConfig(config);
  note(
    `Config saved to ~/.onfable/config.json (chmod 600)\nMemory will live in ~/.onfable/memory.md`,
    "Saved",
  );
  outro(`You're set. Run ${pc.bold(pc.cyan("onfable"))} to start chatting.`);
  return config;
}
