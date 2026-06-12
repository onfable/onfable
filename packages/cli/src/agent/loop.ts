import type {
  ChatMessage,
  Provider,
  ToolCall,
  ToolResult,
} from "../providers/types.js";
import { tools as builtinTools } from "../tools/index.js";
import type { Tool } from "../tools/types.js";
import { confirmTool } from "../ui/confirm.js";
import {
  newline,
  printError,
  printText,
  printToolBanner,
  printToolResultNote,
} from "../ui/output.js";
import { buildSystemPrompt } from "./system-prompt.js";

const MAX_TOOL_ITERATIONS = 25;

export interface AgentOptions {
  yolo: boolean;
  /** Extra tools beyond the built-ins (e.g. from connected MCP servers). */
  extraTools?: Tool[];
}

/**
 * Run one full agent turn: stream the model, execute tool calls (with
 * approval), feed results back, repeat until the model stops calling tools.
 * Mutates `messages` in place so the caller keeps conversation history.
 */
export async function runAgentTurn(
  provider: Provider,
  messages: ChatMessage[],
  userInput: string,
  options: AgentOptions,
): Promise<void> {
  const allTools = [...builtinTools, ...(options.extraTools ?? [])];
  const toolDefs = allTools.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
  }));
  messages.push({ role: "user", content: userInput });

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    let assistantText = "";
    const toolCalls: ToolCall[] = [];
    let stopReason: "end" | "tool_use" = "end";

    try {
      const stream = provider.stream({
        system: buildSystemPrompt(),
        messages,
        tools: toolDefs,
      });
      for await (const event of stream) {
        if (event.type === "text") {
          assistantText += event.delta;
          printText(event.delta);
        } else if (event.type === "tool_call") {
          toolCalls.push(event.call);
        } else {
          stopReason = event.stopReason;
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      printError(`Provider error: ${message}`);
      // Don't leave a dangling user message confusing the next turn
      return;
    }

    messages.push({
      role: "assistant",
      content: assistantText,
      ...(toolCalls.length > 0 ? { toolCalls } : {}),
    });

    if (stopReason !== "tool_use" || toolCalls.length === 0) {
      newline();
      return;
    }

    const results: ToolResult[] = [];
    for (const call of toolCalls) {
      results.push(await executeToolCall(call, options, allTools));
    }
    messages.push({ role: "tool_results", results });
  }

  printError(
    `Stopped after ${MAX_TOOL_ITERATIONS} tool iterations to prevent a runaway loop. Ask me to continue if needed.`,
  );
}

async function executeToolCall(
  call: ToolCall,
  options: AgentOptions,
  allTools: Tool[],
): Promise<ToolResult> {
  const tool = allTools.find((t) => t.name === call.name);
  if (!tool) {
    return {
      toolCallId: call.id,
      content: `Error: unknown tool "${call.name}"`,
      isError: true,
    };
  }

  const summary = tool.summarize(call.args);

  if (tool.needsApproval) {
    const approval = await confirmTool(tool.name, summary, options.yolo);
    if (approval === "deny") {
      printToolResultNote("denied");
      return {
        toolCallId: call.id,
        content: "User declined this action. Adapt or ask what to do instead.",
        isError: true,
      };
    }
  }

  printToolBanner(tool.name, summary);
  try {
    const output = await tool.execute(call.args);
    const lines = output.split("\n").length;
    printToolResultNote(`${lines} line${lines === 1 ? "" : "s"}`);
    return { toolCallId: call.id, content: output };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    printToolResultNote(`error: ${message}`);
    return { toolCallId: call.id, content: `Error: ${message}`, isError: true };
  }
}
