import { IVideoRepository } from "@/clean-architecture/domain/repositories/video.repository.interface";
import { IAnswerRepository } from "@/clean-architecture/domain/repositories/answer.repository.interface";

export type UserStatsDto = {
	totalVideos: number;
	totalQuestionsAnswered: number;
	quizAccuracy: number;
	videosThisWeek: number;
	questionsThisWeek: number;
};

const DAYS_IN_WEEK = 7;

function isWithinLastDays(dateString: string, days: number): boolean {
	const date = new Date(dateString);
	const now = new Date();
	const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
	return date >= cutoff;
}

export class GetUserStatsUseCase {
	constructor(
		private readonly videoRepository: IVideoRepository,
		private readonly answerRepository: IAnswerRepository,
	) {}

	async execute(userId: string): Promise<UserStatsDto> {
		const [videos, answers] = await Promise.all([
			this.videoRepository.findVideosByUserId(userId),
			this.answerRepository.findAnswersByUserId(userId),
		]);

		const totalVideos = videos.length;
		const totalQuestionsAnswered = answers.length;

		const correctAnswers = answers.filter((a) => a.isCorrect).length;
		const quizAccuracy = totalQuestionsAnswered > 0
			? Math.round((correctAnswers / totalQuestionsAnswered) * 100)
			: 0;

		const videosThisWeek = videos.filter((v) =>
			isWithinLastDays(v.createdAt, DAYS_IN_WEEK)
		).length;

		const questionsThisWeek = answers.filter((a) =>
			isWithinLastDays(a.createdAt, DAYS_IN_WEEK)
		).length;

		return {
			totalVideos,
			totalQuestionsAnswered,
			quizAccuracy,
			videosThisWeek,
			questionsThisWeek,
		};
	}
}
