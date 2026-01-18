import { describe, it, expect, vi, beforeEach } from "vitest";
import { SaveChatMessageUseCase } from "./save-chat-message.use-case";
import { IChatMessageRepository } from "@/clean-architecture/domain/repositories/chat-message.repository.interface";

describe("SaveChatMessageUseCase", () => {
    let useCase: SaveChatMessageUseCase;
    let mockChatMessageRepository: IChatMessageRepository;

    beforeEach(() => {
        mockChatMessageRepository = {
            findChatMessagesByVideoIdAndUserId: vi.fn(),
            createChatMessage: vi.fn(),
            deleteChatMessagesByVideoIdAndUserId: vi.fn(),
        };

        useCase = new SaveChatMessageUseCase(mockChatMessageRepository);
    });

    describe("saveUserMessage", () => {
        it("saves a user message with correct parameters", async () => {
            await useCase.saveUserMessage(1, "user-123", "Hello, how does this work?");

            expect(mockChatMessageRepository.createChatMessage).toHaveBeenCalledWith(
                1,
                "user-123",
                "user",
                "Hello, how does this work?"
            );
        });

        it("saves message with empty content", async () => {
            await useCase.saveUserMessage(1, "user-123", "");

            expect(mockChatMessageRepository.createChatMessage).toHaveBeenCalledWith(
                1,
                "user-123",
                "user",
                ""
            );
        });
    });

    describe("saveAssistantMessage", () => {
        it("saves an assistant message with correct parameters", async () => {
            await useCase.saveAssistantMessage(1, "user-123", "Here is my response...");

            expect(mockChatMessageRepository.createChatMessage).toHaveBeenCalledWith(
                1,
                "user-123",
                "assistant",
                "Here is my response..."
            );
        });

        it("saves message with empty content", async () => {
            await useCase.saveAssistantMessage(1, "user-123", "");

            expect(mockChatMessageRepository.createChatMessage).toHaveBeenCalledWith(
                1,
                "user-123",
                "assistant",
                ""
            );
        });
    });
});
