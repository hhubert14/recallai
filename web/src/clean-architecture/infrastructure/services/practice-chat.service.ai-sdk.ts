import "server-only";

import { openai } from "@ai-sdk/openai";
import { ModelMessage, streamText } from "ai";
import {
  IPracticeChatService,
  PracticeChatMessageInput,
} from "@/clean-architecture/domain/services/practice-chat.interface";

export class AiSdkPracticeChatService implements IPracticeChatService {
  async streamChat(
    systemPrompt: string,
    messages: PracticeChatMessageInput[],
    onFinish?: (fullText: string) => void
  ): Promise<Response> {
    const formattedMessages: ModelMessage[] = messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    const result = streamText({
      model: openai("gpt-4.1-mini"),
      system: systemPrompt,
      messages: formattedMessages,
    });

    return result.toUIMessageStreamResponse({
      sendReasoning: false,
      onFinish: onFinish
        ? ({ responseMessage }) => {
            const text = responseMessage.parts
              .filter(
                (part): part is { type: "text"; text: string } =>
                  part.type === "text"
              )
              .map((part) => part.text)
              .join("");
            onFinish(text);
          }
        : undefined,
    });
  }
}
