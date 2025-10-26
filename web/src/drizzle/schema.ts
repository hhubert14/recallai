import { pgTable, foreignKey, unique, uuid, text, timestamp, bigint, boolean, integer, index, smallint, date, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const plan = pgEnum("plan", ['free', 'premium', 'student'])
export const platform = pgEnum("platform", ['YouTube', 'Vimeo'])
export const processingMode = pgEnum("processing_mode", ['manual', 'auto'])
export const status = pgEnum("status", ['active', 'canceled', 'past_due', 'trialing', 'incomplete'])


export const extensionTokens = pgTable("extension_tokens", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	token: text().notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "extension_tokens_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	unique("extension_tokens_token_key").on(table.token),
	// pgPolicy("Enable delete for users based on user_id", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(( SELECT auth.uid() AS uid) = user_id)` }),
	// pgPolicy("Enable insert for users based on user_id", { as: "permissive", for: "insert", to: ["authenticated"] }),
	// pgPolicy("Enable users to view their own data only", { as: "permissive", for: "select", to: ["authenticated"] }),
]);

export const subscriptions = pgTable("subscriptions", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "subscriptions_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	userId: uuid("user_id"),
	stripeCustomerId: text("stripe_customer_id"),
	stripeSubscriptionId: text("stripe_subscription_id"),
	status: status().default('active').notNull(),
	plan: plan().notNull(),
	currentPeriodStart: timestamp("current_period_start", { withTimezone: true, mode: 'string' }),
	currentPeriodEnd: timestamp("current_period_end", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
	canceledAt: timestamp("canceled_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "subscriptions_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const videos = pgTable("videos", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "videos_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	userId: uuid("user_id").notNull(),
	platform: platform().default('YouTube').notNull(),
	title: text().notNull(),
	channelName: text("channel_name"),
	duration: integer(),
	category: text(),
	url: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	expiryDate: timestamp("expiry_date", { withTimezone: true, mode: 'string' }).default(sql`(now() + '7 days'::interval)`),
	videoId: text("video_id"),
	description: text(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	shouldExpire: boolean("should_expire").default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "videos_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	email: text().notNull(),
	isSubscribed: boolean("is_subscribed").default(false).notNull(),
	monthlyVideoCount: smallint("monthly_video_count").default(sql`'0'`).notNull(),
	lastResetDate: timestamp("last_reset_date", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	processsingMode: processingMode("processsing_mode").default('auto').notNull(),
	stripeCustomerId: text("stripe_customer_id"),
}, (table) => [
	index("idx_users_stripe_customer_id").using("btree", table.stripeCustomerId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.id],
			foreignColumns: [table.id],
			name: "users_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	unique("users_stripe_customer_id_unique").on(table.stripeCustomerId),
	// pgPolicy("Enable users to view their own data only", { as: "permissive", for: "select", to: ["authenticated"], using: sql`(( SELECT auth.uid() AS uid) = id)` }),
]);

export const summaries = pgTable("summaries", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "summaries_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	videoId: bigint("video_id", { mode: "number" }),
	content: text().default('').notNull(),
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
	videoId: bigint("video_id", { mode: "number" }).notNull(),
	questionText: text("question_text").notNull(),
	questionType: text("question_type").notNull(),
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
	orderIndex: smallint("order_index"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	explanation: text(),
}, (table) => [
	foreignKey({
			columns: [table.questionId],
			foreignColumns: [questions.id],
			name: "question_options_question_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const userQuestionProgress = pgTable("user_question_progress", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "user_question_progress_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	userId: uuid("user_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	questionId: bigint("question_id", { mode: "number" }).notNull(),
	boxLevel: integer("box_level").default(1),
	nextReviewDate: date("next_review_date"),
	timesCorrect: integer("times_correct").default(0),
	timesIncorrect: integer("times_incorrect").default(0),
	lastReviewedAt: timestamp("last_reviewed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.questionId],
			foreignColumns: [questions.id],
			name: "user_question_progress_question_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_question_progress_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	unique("user_question_progress_user_id_question_id_key").on(table.userId, table.questionId),
	unique("user_question_progress_unique").on(table.userId, table.questionId),
]);

export const userAnswers = pgTable("user_answers", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "user_answers_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	userId: uuid("user_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	questionId: bigint("question_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	selectedOptionId: bigint("selected_option_id", { mode: "number" }).notNull(),
	textAnswer: text("text_answer"),
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
