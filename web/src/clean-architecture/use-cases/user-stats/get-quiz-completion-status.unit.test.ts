import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetQuizCompletionStatusUseCase } from "./get-quiz-completion-status.use-case";
import { IQuestionRepository } from "@/clean-architecture/domain/repositories/question.repository.interface";
import { IAnswerRepository } from "@/clean-architecture/domain/repositories/answer.repository.interface";
import { MultipleChoiceQuestionEntity, MultipleChoiceOption } from "@/clean-architecture/domain/entities/question.entity";

function createMockQuestion(id: number, videoId: number = 1): MultipleChoiceQuestionEntity {
	return new MultipleChoiceQuestionEntity(
		id,
		videoId,
		`Question ${id}`,
		[
			new MultipleChoiceOption(id * 10 + 1, "Option A", true, null),
			new MultipleChoiceOption(id * 10 + 2, "Option B", false, null),
		],
		null,
		null,
	);
}

describe("GetQuizCompletionStatusUseCase", () => {
	let useCase: GetQuizCompletionStatusUseCase;
	let mockQuestionRepo: IQuestionRepository;
	let mockAnswerRepo: IAnswerRepository;

	beforeEach(() => {
		mockQuestionRepo = {
			findQuestionsByVideoId: vi.fn(),
			createMultipleChoiceQuestion: vi.fn(),
			findQuestionById: vi.fn(),
			findQuestionsByIds: vi.fn(),
			countQuestionsByVideoIds: vi.fn(),
			updateQuestion: vi.fn(),
			deleteQuestion: vi.fn(),
		};

		mockAnswerRepo = {
			findAnsweredQuestionIdsByVideoId: vi.fn(),
			findAnswersByUserId: vi.fn(),
			createMultipleChoiceAnswer: vi.fn(),
		};

		useCase = new GetQuizCompletionStatusUseCase(mockQuestionRepo, mockAnswerRepo);
	});

	describe("happy path", () => {
		it("returns true when user answered all questions for a video", async () => {
			const questions = [
				createMockQuestion(1),
				createMockQuestion(2),
				createMockQuestion(3),
			];
			vi.mocked(mockQuestionRepo.findQuestionsByVideoId).mockResolvedValue(questions);
			vi.mocked(mockAnswerRepo.findAnsweredQuestionIdsByVideoId).mockResolvedValue([1, 2, 3]);

			const result = await useCase.execute("user-1", 1);

			expect(result).toBe(true);
		});

		it("returns false when user answered some but not all questions", async () => {
			const questions = [
				createMockQuestion(1),
				createMockQuestion(2),
				createMockQuestion(3),
			];
			vi.mocked(mockQuestionRepo.findQuestionsByVideoId).mockResolvedValue(questions);
			vi.mocked(mockAnswerRepo.findAnsweredQuestionIdsByVideoId).mockResolvedValue([1, 2]); // Missing question 3

			const result = await useCase.execute("user-1", 1);

			expect(result).toBe(false);
		});
	});

	describe("edge cases", () => {
		it("returns false when video has no questions", async () => {
			vi.mocked(mockQuestionRepo.findQuestionsByVideoId).mockResolvedValue([]);
			vi.mocked(mockAnswerRepo.findAnsweredQuestionIdsByVideoId).mockResolvedValue([]);

			const result = await useCase.execute("user-1", 1);

			expect(result).toBe(false);
		});

		it("returns false when user has no answers for video", async () => {
			const questions = [
				createMockQuestion(1),
				createMockQuestion(2),
			];
			vi.mocked(mockQuestionRepo.findQuestionsByVideoId).mockResolvedValue(questions);
			vi.mocked(mockAnswerRepo.findAnsweredQuestionIdsByVideoId).mockResolvedValue([]);

			const result = await useCase.execute("user-1", 1);

			expect(result).toBe(false);
		});
	});
});
