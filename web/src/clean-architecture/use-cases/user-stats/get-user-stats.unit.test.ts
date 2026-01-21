import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetUserStatsUseCase } from "./get-user-stats.use-case";
import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { IAnswerRepository } from "@/clean-architecture/domain/repositories/answer.repository.interface";
import { VideoEntity } from "@/clean-architecture/domain/entities/video.entity";
import { MultipleChoiceAnswerEntity } from "@/clean-architecture/domain/entities/answer.entity";

function createMockVideo(overrides: Partial<VideoEntity> = {}): VideoEntity {
	return new VideoEntity(
		overrides.id ?? 1,
		overrides.publicId ?? "550e8400-e29b-41d4-a716-446655440000",
		overrides.userId ?? "user-1",
		overrides.title ?? "Test Video",
		overrides.url ?? "https://youtube.com/watch?v=test",
		overrides.channelName ?? "Test Channel",
		overrides.createdAt ?? new Date().toISOString(),
	);
}

function createMockAnswer(overrides: Partial<MultipleChoiceAnswerEntity> = {}): MultipleChoiceAnswerEntity {
	return new MultipleChoiceAnswerEntity(
		overrides.id ?? 1,
		overrides.userId ?? "user-1",
		overrides.questionId ?? 1,
		overrides.selectedOptionId ?? 1,
		overrides.isCorrect ?? true,
		overrides.createdAt ?? new Date().toISOString(),
	);
}

function daysAgo(days: number): string {
	const date = new Date();
	date.setDate(date.getDate() - days);
	return date.toISOString();
}

describe("GetUserStatsUseCase", () => {
	let useCase: GetUserStatsUseCase;
	let mockVideoRepo: IVideoRepository;
	let mockAnswerRepo: IAnswerRepository;

	beforeEach(() => {
		mockVideoRepo = {
			findVideosByUserId: vi.fn(),
			createVideo: vi.fn(),
			findVideoById: vi.fn(),
			findVideoByPublicId: vi.fn(),
			findVideoByUserIdAndUrl: vi.fn(),
			findVideosByIds: vi.fn(),
		};

		mockAnswerRepo = {
			findAnswersByUserId: vi.fn(),
			createMultipleChoiceAnswer: vi.fn(),
			findAnsweredQuestionIdsByVideoId: vi.fn(),
		};

		useCase = new GetUserStatsUseCase(mockVideoRepo, mockAnswerRepo);
	});

	describe("totalVideos", () => {
		it("returns correct total video count", async () => {
			const videos = [
				createMockVideo({ id: 1 }),
				createMockVideo({ id: 2 }),
				createMockVideo({ id: 3 }),
			];
			vi.mocked(mockVideoRepo.findVideosByUserId).mockResolvedValue(videos);
			vi.mocked(mockAnswerRepo.findAnswersByUserId).mockResolvedValue([]);

			const result = await useCase.execute("user-1");

			expect(result.totalVideos).toBe(3);
		});
	});

	describe("totalQuestionsAnswered", () => {
		it("returns correct total questions answered count", async () => {
			const answers = [
				createMockAnswer({ id: 1 }),
				createMockAnswer({ id: 2 }),
				createMockAnswer({ id: 3 }),
				createMockAnswer({ id: 4 }),
			];
			vi.mocked(mockVideoRepo.findVideosByUserId).mockResolvedValue([]);
			vi.mocked(mockAnswerRepo.findAnswersByUserId).mockResolvedValue(answers);

			const result = await useCase.execute("user-1");

			expect(result.totalQuestionsAnswered).toBe(4);
		});
	});

	describe("quizAccuracy", () => {
		it("calculates quiz accuracy correctly (correct / total * 100)", async () => {
			const answers = [
				createMockAnswer({ id: 1, isCorrect: true }),
				createMockAnswer({ id: 2, isCorrect: true }),
				createMockAnswer({ id: 3, isCorrect: false }),
				createMockAnswer({ id: 4, isCorrect: true }),
			];
			vi.mocked(mockVideoRepo.findVideosByUserId).mockResolvedValue([]);
			vi.mocked(mockAnswerRepo.findAnswersByUserId).mockResolvedValue(answers);

			const result = await useCase.execute("user-1");

			expect(result.quizAccuracy).toBe(75); // 3/4 * 100 = 75
		});

		it("returns 100% accuracy when all answers are correct", async () => {
			const answers = [
				createMockAnswer({ id: 1, isCorrect: true }),
				createMockAnswer({ id: 2, isCorrect: true }),
				createMockAnswer({ id: 3, isCorrect: true }),
			];
			vi.mocked(mockVideoRepo.findVideosByUserId).mockResolvedValue([]);
			vi.mocked(mockAnswerRepo.findAnswersByUserId).mockResolvedValue(answers);

			const result = await useCase.execute("user-1");

			expect(result.quizAccuracy).toBe(100);
		});

		it("returns 0% accuracy when all answers are incorrect", async () => {
			const answers = [
				createMockAnswer({ id: 1, isCorrect: false }),
				createMockAnswer({ id: 2, isCorrect: false }),
				createMockAnswer({ id: 3, isCorrect: false }),
			];
			vi.mocked(mockVideoRepo.findVideosByUserId).mockResolvedValue([]);
			vi.mocked(mockAnswerRepo.findAnswersByUserId).mockResolvedValue(answers);

			const result = await useCase.execute("user-1");

			expect(result.quizAccuracy).toBe(0);
		});

		it("returns 0% accuracy when user has no answers", async () => {
			vi.mocked(mockVideoRepo.findVideosByUserId).mockResolvedValue([]);
			vi.mocked(mockAnswerRepo.findAnswersByUserId).mockResolvedValue([]);

			const result = await useCase.execute("user-1");

			expect(result.quizAccuracy).toBe(0);
		});
	});

	describe("videosThisWeek", () => {
		it("returns correct count for videos created within 7 days", async () => {
			const videos = [
				createMockVideo({ id: 1, createdAt: daysAgo(1) }), // 1 day ago - this week
				createMockVideo({ id: 2, createdAt: daysAgo(5) }), // 5 days ago - this week
				createMockVideo({ id: 3, createdAt: daysAgo(10) }), // 10 days ago - not this week
				createMockVideo({ id: 4, createdAt: daysAgo(30) }), // 30 days ago - not this week
			];
			vi.mocked(mockVideoRepo.findVideosByUserId).mockResolvedValue(videos);
			vi.mocked(mockAnswerRepo.findAnswersByUserId).mockResolvedValue([]);

			const result = await useCase.execute("user-1");

			expect(result.videosThisWeek).toBe(2);
		});
	});

	describe("questionsThisWeek", () => {
		it("returns correct count for answers created within 7 days", async () => {
			const answers = [
				createMockAnswer({ id: 1, createdAt: daysAgo(1) }), // 1 day ago - this week
				createMockAnswer({ id: 2, createdAt: daysAgo(3) }), // 3 days ago - this week
				createMockAnswer({ id: 3, createdAt: daysAgo(6) }), // 6 days ago - this week
				createMockAnswer({ id: 4, createdAt: daysAgo(14) }), // 14 days ago - not this week
			];
			vi.mocked(mockVideoRepo.findVideosByUserId).mockResolvedValue([]);
			vi.mocked(mockAnswerRepo.findAnswersByUserId).mockResolvedValue(answers);

			const result = await useCase.execute("user-1");

			expect(result.questionsThisWeek).toBe(3);
		});
	});

	describe("edge cases", () => {
		it("returns zeros for user with no videos and no answers", async () => {
			vi.mocked(mockVideoRepo.findVideosByUserId).mockResolvedValue([]);
			vi.mocked(mockAnswerRepo.findAnswersByUserId).mockResolvedValue([]);

			const result = await useCase.execute("user-1");

			expect(result).toEqual({
				totalVideos: 0,
				totalQuestionsAnswered: 0,
				quizAccuracy: 0,
				videosThisWeek: 0,
				questionsThisWeek: 0,
			});
		});
	});
});
