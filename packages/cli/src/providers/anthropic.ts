import Anthropic from "@anthropic-ai/sdk";
import type {
  ChatMessage,
  Provider,
  ProviderConfig,
  StreamEvent,
  StreamOptions,
  ToolDef,
} from "./types.js";

function toAnthropicMessages(
  messages: ChatMessage[],
): Anthropic.MessageParam[] {
  const out: Anthropic.MessageParam[] = [];
  for (const msg of messages) {
    if (msg.role === "user") {
      out.push({ role: "user", content: msg.content });
    } else if (msg.role === "assistant") {
      const content: Anthropic.ContentBlockParam[] = [];
      if (msg.content) content.push({ type: "text", text: msg.content });
      for (const call of msg.toolCalls ?? []) {
        content.push({
          type: "tool_use",
          id: call.id,
          name: call.name,
          input: call.args,
        });
      }
      if (content.length > 0) out.push({ role: "assistant", content });
    } else {
      out.push({
        role: "user",
        content: msg.results.map((r) => ({
          type: "tool_result" as const,
          tool_use_id: r.toolCallId,
          content: r.content,
          is_error: r.isError ?? false,
        })),
      });
    }
  }
  return out;
}

function toAnthropicTools(tools: ToolDef[]): Anthropic.Tool[] {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.inputSchema as Anthropic.Tool.InputSchema,
  }));
}

export function createAnthropicProvider(config: ProviderConfig): Provider {
  const client = new Anthropic({ apiKey: config.apiKey });

  return {
    async *stream(opts: StreamOptions): AsyncGenerator<StreamEvent> {
      const stream = client.messages.stream({
        model: config.model,
        max_tokens: 8192,
        system: opts.system,
        messages: toAnthropicMessages(opts.messages),
        tools: toAnthropicTools(opts.tools),
      });

      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          yield { type: "text", delta: event.delta.text };
        }
      }

      const final = await stream.finalMessage();
      for (const block of final.content) {
        if (block.type === "tool_use") {
          yield {
            type: "tool_call",
            call: {
              id: block.id,
              name: block.name,
              args: (block.input ?? {}) as Record<string, unknown>,
            },
          };
        }
      }
      yield {
        type: "done",
        stopReason: final.stop_reason === "tool_use" ? "tool_use" : "end",
      };
    },

    async validate(): Promise<void> {
      await client.messages.create({
        model: config.model,
        max_tokens: 1,
        messages: [{ role: "user", content: "ping" }],
      });
    },
  };
}
