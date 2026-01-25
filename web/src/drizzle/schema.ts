import { pgTable, foreignKey, unique, uuid, text, timestamp, bigint, boolean, integer, index, date, jsonb, vector, check } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm";


export const videos = pgTable("videos", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "videos_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	publicId: uuid("public_id").defaultRandom().notNull(),
	userId: uuid("user_id").notNull(),
	title: text().notNull(),
	channelName: text("channel_name").notNull(),
	url: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "videos_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	unique("videos_public_id_key").on(table.publicId),
]);

export const studySets = pgTable("study_sets", {
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "study_sets_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	publicId: uuid("public_id").defaultRandom().notNull(),
	userId: uuid("user_id").notNull(),
	name: text().notNull(),
	description: text(),
	sourceType: text("source_type").notNull(), // 'video' | 'manual' | 'pdf'
	videoId: bigint("video_id", { mode: "number" }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "study_sets_user_id_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.videoId],
		foreignColumns: [videos.id],
		name: "study_sets_video_id_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	unique("study_sets_public_id_key").on(table.publicId),
	check("study_sets_source_type_check", sql`source_type IN ('video', 'manual', 'pdf')`),
	index("idx_study_sets_user_id").using("btree", table.userId.asc().nullsLast()),
	index("idx_study_sets_video_id").using("btree", table.videoId.asc().nullsLast()),
]);

// NOTE: id references auth.users(id) ON DELETE CASCADE
// FK constraint added via migration 0010_auth_users_fk_constraint.sql
// Trigger on auth.users auto-creates public.users (see Supabase auth triggers)
export const users = pgTable("users", {
	id: uuid().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	email: text().notNull(),
});

export const summaries = pgTable("summaries", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "summaries_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	videoId: bigint("video_id", { mode: "number" }).notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.videoId],
			foreignColumns: [videos.id],
			name: "summaries_video_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const questions = pgTable("questions", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "questions_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	// NOTE: nullable to support manual study sets without video source
	videoId: bigint("video_id", { mode: "number" }),
	questionText: text("question_text").notNull(),
	questionType: text("question_type").notNull(),
	sourceQuote: text("source_quote"),
	sourceTimestamp: integer("source_timestamp"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.videoId],
			foreignColumns: [videos.id],
			name: "questions_video_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const questionOptions = pgTable("question_options", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "question_options_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	questionId: bigint("question_id", { mode: "number" }).notNull(),
	optionText: text("option_text").notNull(),
	isCorrect: boolean("is_correct").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	explanation: text(),
}, (table) => [
	foreignKey({
			columns: [table.questionId],
			foreignColumns: [questions.id],
			name: "question_options_question_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const userAnswers = pgTable("user_answers", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "user_answers_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	userId: uuid("user_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	questionId: bigint("question_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	selectedOptionId: bigint("selected_option_id", { mode: "number" }).notNull(),
	isCorrect: boolean("is_correct").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.questionId],
			foreignColumns: [questions.id],
			name: "user_answers_question_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.selectedOptionId],
			foreignColumns: [questionOptions.id],
			name: "user_answers_selected_option_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_answers_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const onboardingSurveys = pgTable("onboarding_surveys", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	answers: jsonb().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "onboarding_surveys_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	unique("onboarding_surveys_user_id_key").on(table.userId),
]);

export const flashcards = pgTable("flashcards", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "flashcards_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	// NOTE: nullable to support manual study sets without video source
	videoId: bigint("video_id", { mode: "number" }),
	userId: uuid("user_id").notNull(),
	front: text().notNull(),
	back: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.videoId],
			foreignColumns: [videos.id],
			name: "flashcards_video_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "flashcards_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const transcriptWindows = pgTable("transcript_windows", {
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "transcript_windows_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	videoId: bigint("video_id", { mode: "number" }).notNull(),
	windowIndex: integer("window_index").notNull(),
	startTime: integer("start_time").notNull(),
	endTime: integer("end_time").notNull(),
	text: text().notNull(),
	embedding: vector("embedding", { dimensions: 384 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.videoId],
			foreignColumns: [videos.id],
			name: "transcript_windows_video_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	index("idx_transcript_windows_video_id").using("btree", table.videoId.asc().nullsLast()),
	unique("transcript_windows_video_id_window_index_key").on(table.videoId, table.windowIndex),
]);

export const videoTranscripts = pgTable("video_transcripts", {
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "video_transcripts_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	videoId: bigint("video_id", { mode: "number" }).notNull(),
	segments: jsonb().notNull(),
	fullText: text("full_text").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.videoId],
			foreignColumns: [videos.id],
			name: "video_transcripts_video_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	index("idx_video_transcripts_video_id").using("btree", table.videoId.asc().nullsLast()),
	unique("video_transcripts_video_id_key").on(table.videoId),
]);

export const chatMessages = pgTable("chat_messages", {
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "chat_messages_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	videoId: bigint("video_id", { mode: "number" }).notNull(),
	userId: uuid("user_id").notNull(),
	role: text().notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.videoId],
			foreignColumns: [videos.id],
			name: "chat_messages_video_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "chat_messages_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	index("idx_chat_messages_video_user").using("btree", table.videoId.asc().nullsLast(), table.userId.asc().nullsLast()),
]);

export const reviewableItems = pgTable("reviewable_items", {
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "reviewable_items_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	userId: uuid("user_id").notNull(),
	itemType: text("item_type").notNull(), // 'question' | 'flashcard'
	questionId: bigint("question_id", { mode: "number" }),
	flashcardId: bigint("flashcard_id", { mode: "number" }),
	// NOTE: nullable to support manual study sets without video source
	videoId: bigint("video_id", { mode: "number" }),
	studySetId: bigint("study_set_id", { mode: "number" }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "reviewable_items_user_id_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.questionId],
		foreignColumns: [questions.id],
		name: "reviewable_items_question_id_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.flashcardId],
		foreignColumns: [flashcards.id],
		name: "reviewable_items_flashcard_id_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.videoId],
		foreignColumns: [videos.id],
		name: "reviewable_items_video_id_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.studySetId],
		foreignColumns: [studySets.id],
		name: "reviewable_items_study_set_id_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	// Ensure one reviewable item per question/flashcard (questions are user-scoped via video ownership)
	unique("reviewable_items_question_id_key").on(table.questionId),
	unique("reviewable_items_flashcard_id_key").on(table.flashcardId),
	index("idx_reviewable_items_user_id").using("btree", table.userId.asc().nullsLast()),
	index("idx_reviewable_items_video_id").using("btree", table.videoId.asc().nullsLast()),
	index("idx_reviewable_items_study_set_id").using("btree", table.studySetId.asc().nullsLast()),
]);

export const reviewProgress = pgTable("review_progress", {
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "review_progress_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	userId: uuid("user_id").notNull(),
	reviewableItemId: bigint("reviewable_item_id", { mode: "number" }).notNull(),
	boxLevel: integer("box_level").default(1).notNull(),
	nextReviewDate: date("next_review_date"),
	timesCorrect: integer("times_correct").default(0).notNull(),
	timesIncorrect: integer("times_incorrect").default(0).notNull(),
	lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "review_progress_user_id_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.reviewableItemId],
		foreignColumns: [reviewableItems.id],
		name: "review_progress_reviewable_item_id_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	unique("review_progress_user_reviewable_item_key").on(table.userId, table.reviewableItemId),
	index("idx_review_progress_user_id").using("btree", table.userId.asc().nullsLast()),
	index("idx_review_progress_next_review_date").using("btree", table.nextReviewDate.asc().nullsLast()),
]);
