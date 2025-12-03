/**
 * Application Constants
 * 
 * Central location for magic numbers, configuration values, and constants
 * used throughout the application.
 */

/**
 * Spaced Repetition System Constants
 * Based on the Leitner box system
 */
export const SPACED_REPETITION = {
    /** Minimum box level (new/struggling questions) */
    MIN_BOX_LEVEL: 1,
    
    /** Maximum box level (mastered questions) */
    MAX_BOX_LEVEL: 5,
    
    /** Review intervals in days for each box level */
    BOX_INTERVALS: {
        1: 1,   // Review tomorrow
        2: 3,   // Review in 3 days
        3: 7,   // Review in 1 week
        4: 14,  // Review in 2 weeks
        5: 30,  // Review in 1 month
    } as const,
} as const;

/**
 * Video Processing Constants
 */
export const VIDEO_PROCESSING = {
    /** Default number of questions to generate per video */
    DEFAULT_QUESTION_COUNT: 5,
    
    /** Maximum video duration in minutes that can be processed */
    MAX_VIDEO_DURATION_MINUTES: 120,
    
    /** Number of days before video data expires (for free tier) */
    DEFAULT_EXPIRY_DAYS: 7,
} as const;

/**
 * Pagination Constants
 */
export const PAGINATION = {
    /** Default page size for list endpoints */
    DEFAULT_PAGE_SIZE: 20,
    
    /** Maximum page size allowed */
    MAX_PAGE_SIZE: 100,
    
    /** Default page size for video library */
    VIDEO_LIBRARY_PAGE_SIZE: 12,
} as const;

/**
 * Authentication Constants
 */
export const AUTH = {
    /** Extension token expiry in days */
    EXTENSION_TOKEN_EXPIRY_DAYS: 365,
    
    /** Session cookie name */
    SESSION_COOKIE_NAME: "sb-access-token",
} as const;

/**
 * Subscription Plan Limits
 */
export const SUBSCRIPTION_LIMITS = {
    free: {
        /** Maximum videos per month for free tier */
        monthlyVideoLimit: 5,
        
        /** Whether videos expire for this tier */
        videosExpire: true,
    },
    premium: {
        monthlyVideoLimit: Infinity,
        videosExpire: false,
    },
    student: {
        monthlyVideoLimit: 50,
        videosExpire: false,
    },
} as const;

/**
 * HTTP Status Codes
 * Common status codes used in API responses
 */
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
} as const;
