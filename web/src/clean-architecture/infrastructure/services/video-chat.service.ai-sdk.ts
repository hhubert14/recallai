import "server-only";

import { openai } from "@ai-sdk/openai";
import { ModelMessage, streamText } from "ai";
import {
  IVideoChatService,
  StreamChatOptions,
  ChatMessageInput,
} from "@/clean-architecture/domain/services/video-chat.interface";

export class AiSdkVideoChatService implements IVideoChatService {
  streamChat(
    systemPrompt: string,
    messages: ChatMessageInput[],
    options?: StreamChatOptions
  ): Response {
    const formattedMessages: ModelMessage[] = messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      messages: formattedMessages,
    });

    return result.toUIMessageStreamResponse({
      sendReasoning: false,
      onFinish: options?.onFinish
        ? ({ responseMessage }) => {
            const text = responseMessage.parts
              .filter(
                (part): part is { type: "text"; text: string } =>
                  part.type === "text"
              )
              .map((part) => part.text)
              .join("");
            options.onFinish!(text);
          }
        : undefined,
    });
  }
}
