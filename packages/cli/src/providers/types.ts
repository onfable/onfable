/** Neutral message format — converted to each provider's wire format per call. */
export type ChatMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; toolCalls?: ToolCall[] }
  | { role: "tool_results"; results: ToolResult[] };

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  content: string;
  isError?: boolean;
}

export interface ToolDef {
  name: string;
  description: string;
  /** JSON Schema for the tool input, passed straight to the provider API. */
  inputSchema: Record<string, unknown>;
}

export type StreamEvent =
  | { type: "text"; delta: string }
  | { type: "tool_call"; call: ToolCall }
  | { type: "done"; stopReason: "end" | "tool_use" };

export interface StreamOptions {
  system: string;
  messages: ChatMessage[];
  tools: ToolDef[];
}

export interface Provider {
  /** Stream one assistant turn. Emits text deltas, then tool calls, then done. */
  stream(opts: StreamOptions): AsyncGenerator<StreamEvent>;
  /** Cheap call to validate credentials. Throws on failure. */
  validate(): Promise<void>;
}

export type ProviderKind = "anthropic" | "openai" | "openrouter" | "custom";

export interface ProviderConfig {
  provider: ProviderKind;
  apiKey: string;
  model: string;
  baseUrl?: string;
}
