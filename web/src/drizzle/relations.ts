import { relations } from "drizzle-orm/relations";
import { users, videos, summaries, questions, questionOptions, userQuestionProgress, userAnswers, transcriptWindows, videoTranscripts } from "./schema";

export const usersRelations = relations(users, ({many}) => ({
	videos: many(videos),
	userQuestionProgresses: many(userQuestionProgress),
	userAnswers: many(userAnswers),
}));

export const videosRelations = relations(videos, ({one, many}) => ({
	user: one(users, {
		fields: [videos.userId],
		references: [users.id]
	}),
	summaries: many(summaries),
	questions: many(questions),
	transcriptWindows: many(transcriptWindows),
	videoTranscript: one(videoTranscripts),
}));

export const summariesRelations = relations(summaries, ({one}) => ({
	video: one(videos, {
		fields: [summaries.videoId],
		references: [videos.id]
	}),
}));

export const questionsRelations = relations(questions, ({one, many}) => ({
	video: one(videos, {
		fields: [questions.videoId],
		references: [videos.id]
	}),
	questionOptions: many(questionOptions),
	userQuestionProgresses: many(userQuestionProgress),
	userAnswers: many(userAnswers),
}));

export const questionOptionsRelations = relations(questionOptions, ({one, many}) => ({
	question: one(questions, {
		fields: [questionOptions.questionId],
		references: [questions.id]
	}),
	userAnswers: many(userAnswers),
}));

export const userQuestionProgressRelations = relations(userQuestionProgress, ({one}) => ({
	question: one(questions, {
		fields: [userQuestionProgress.questionId],
		references: [questions.id]
	}),
	user: one(users, {
		fields: [userQuestionProgress.userId],
		references: [users.id]
	}),
}));

export const userAnswersRelations = relations(userAnswers, ({one}) => ({
	question: one(questions, {
		fields: [userAnswers.questionId],
		references: [questions.id]
	}),
	questionOption: one(questionOptions, {
		fields: [userAnswers.selectedOptionId],
		references: [questionOptions.id]
	}),
	user: one(users, {
		fields: [userAnswers.userId],
		references: [users.id]
	}),
}));

export const transcriptWindowsRelations = relations(transcriptWindows, ({one}) => ({
	video: one(videos, {
		fields: [transcriptWindows.videoId],
		references: [videos.id]
	}),
}));

export const videoTranscriptsRelations = relations(videoTranscripts, ({one}) => ({
	video: one(videos, {
		fields: [videoTranscripts.videoId],
		references: [videos.id]
	}),
}));