import OpenAI from "openai";
import type {
  ChatMessage,
  Provider,
  ProviderConfig,
  StreamEvent,
  StreamOptions,
  ToolDef,
} from "./types.js";

type OpenAIMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

function toOpenAIMessages(
  system: string,
  messages: ChatMessage[],
): OpenAIMessage[] {
  const out: OpenAIMessage[] = [{ role: "system", content: system }];
  for (const msg of messages) {
    if (msg.role === "user") {
      out.push({ role: "user", content: msg.content });
    } else if (msg.role === "assistant") {
      out.push({
        role: "assistant",
        content: msg.content || null,
        ...(msg.toolCalls && msg.toolCalls.length > 0
          ? {
              tool_calls: msg.toolCalls.map((call) => ({
                id: call.id,
                type: "function" as const,
                function: {
                  name: call.name,
                  arguments: JSON.stringify(call.args),
                },
              })),
            }
          : {}),
      });
    } else {
      for (const result of msg.results) {
        out.push({
          role: "tool",
          tool_call_id: result.toolCallId,
          content: result.content,
        });
      }
    }
  }
  return out;
}

function toOpenAITools(
  tools: ToolDef[],
): OpenAI.Chat.Completions.ChatCompletionTool[] {
  return tools.map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.inputSchema,
    },
  }));
}

const BASE_URLS: Record<string, string | undefined> = {
  openai: undefined,
  openrouter: "https://openrouter.ai/api/v1",
};

export function createOpenAIProvider(config: ProviderConfig): Provider {
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl ?? BASE_URLS[config.provider],
    defaultHeaders:
      config.provider === "openrouter"
        ? { "HTTP-Referer": "https://onfable.xyz", "X-Title": "onfable" }
        : undefined,
  });

  return {
    async *stream(opts: StreamOptions): AsyncGenerator<StreamEvent> {
      const stream = await client.chat.completions.create({
        model: config.model,
        stream: true,
        messages: toOpenAIMessages(opts.system, opts.messages),
        ...(opts.tools.length > 0 ? { tools: toOpenAITools(opts.tools) } : {}),
      });

      // Accumulate streamed tool_call fragments by index.
      const pending = new Map<number, { id: string; name: string; args: string }>();
      let finishReason: string | null = null;

      for await (const chunk of stream) {
        const choice = chunk.choices[0];
        if (!choice) continue;
        if (choice.delta?.content) {
          yield { type: "text", delta: choice.delta.content };
        }
        for (const tc of choice.delta?.tool_calls ?? []) {
          const entry = pending.get(tc.index) ?? { id: "", name: "", args: "" };
          if (tc.id) entry.id = tc.id;
          if (tc.function?.name) entry.name += tc.function.name;
          if (tc.function?.arguments) entry.args += tc.function.arguments;
          pending.set(tc.index, entry);
        }
        if (choice.finish_reason) finishReason = choice.finish_reason;
      }

      for (const entry of pending.values()) {
        let args: Record<string, unknown> = {};
        try {
          args = entry.args ? JSON.parse(entry.args) : {};
        } catch {
          // Malformed JSON from the model — pass it through for the tool to reject.
          args = { _raw: entry.args };
        }
        yield {
          type: "tool_call",
          call: { id: entry.id, name: entry.name, args },
        };
      }

      yield {
        type: "done",
        stopReason:
          finishReason === "tool_calls" || pending.size > 0 ? "tool_use" : "end",
      };
    },

    async validate(): Promise<void> {
      await client.chat.completions.create({
        model: config.model,
        max_tokens: 1,
        messages: [{ role: "user", content: "ping" }],
      });
    },
  };
}
