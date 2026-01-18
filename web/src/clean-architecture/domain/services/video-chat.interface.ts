export type ChatMessageInput = {
    role: "user" | "assistant";
    content: string;
};

export type VideoChatContext = {
    videoTitle: string;
    summary: string;
    relevantTranscriptWindows: string[];
};

export type StreamChatOptions = {
    onFinish?: (text: string) => void | Promise<void>;
};

export interface IVideoChatService {
    streamChat(
        systemPrompt: string,
        messages: ChatMessageInput[],
        options?: StreamChatOptions
    ): Response;
}
