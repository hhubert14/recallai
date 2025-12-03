/**
 * Dependency Injection Factory
 * 
 * Creates instances of repositories and services with proper dependencies.
 * This reduces code duplication in API routes and makes testing easier.
 */

import { DrizzleVideoRepository } from "@/clean-architecture/infrastructure/repositories/video.repository.drizzle";
import { DrizzleSummaryRepository } from "@/clean-architecture/infrastructure/repositories/summary.repository.drizzle";
import { DrizzleQuestionRepository } from "@/clean-architecture/infrastructure/repositories/question.repository.drizzle";
import { DrizzleUserRepository } from "@/clean-architecture/infrastructure/repositories/user.repository.drizzle";
import { DrizzleOnboardingSurveyRepository } from "@/clean-architecture/infrastructure/repositories/onboarding-survey.repository.drizzle";
import { DrizzleProgressRepository } from "@/clean-architecture/infrastructure/repositories/progress.repository.drizzle";

import { YouTubeVideoInfoService } from "@/clean-architecture/infrastructure/services/video-info.service.youtube";
import { StrapiVideoTranscriptService } from "@/clean-architecture/infrastructure/services/video-transcript.service.strapi";
import { OpenAIVideoClassifierService } from "@/clean-architecture/infrastructure/services/video-classifier.service.openai";
import { LangChainVideoSummarizerService } from "@/clean-architecture/infrastructure/services/video-summarizer.service.langchain";
import { LangChainQuestionGeneratorService } from "@/clean-architecture/infrastructure/services/question-generator.service.langchain";

import { ProcessVideoUseCase } from "@/clean-architecture/use-cases/video/process-video.use-case";

/**
 * Repository Factory
 * Creates instances of data access layer repositories
 */
export const repositories = {
    video: () => new DrizzleVideoRepository(),
    summary: () => new DrizzleSummaryRepository(),
    question: () => new DrizzleQuestionRepository(),
    user: () => new DrizzleUserRepository(),
    onboardingSurvey: () => new DrizzleOnboardingSurveyRepository(),
    progress: () => new DrizzleProgressRepository(),
} as const;

/**
 * Service Factory
 * Creates instances of external services (AI, video APIs, etc.)
 */
export const services = {
    videoInfo: () => new YouTubeVideoInfoService(),
    videoTranscript: () => new StrapiVideoTranscriptService(),
    videoClassifier: () => new OpenAIVideoClassifierService(),
    videoSummarizer: () => new LangChainVideoSummarizerService(),
    questionGenerator: () => new LangChainQuestionGeneratorService(),
} as const;

/**
 * Use Case Factory
 * Creates fully configured use case instances with all dependencies
 */
export const useCases = {
    processVideo: () => new ProcessVideoUseCase(
        repositories.video(),
        repositories.summary(),
        repositories.question(),
        services.videoInfo(),
        services.videoTranscript(),
        services.videoClassifier(),
        services.videoSummarizer(),
        services.questionGenerator()
    ),
} as const;
