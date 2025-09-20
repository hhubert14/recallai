import "server-only";

// Leitner box intervals (in days)
const BOX_INTERVALS = {
    1: 1, // Box 1: Daily (struggling)
    2: 3, // Box 2: Every 3 days
    3: 7, // Box 3: Every week
    4: 14, // Box 4: Every 2 weeks
    5: 30, // Box 5: Every month
};

export function getNextReviewDate(boxLevel: number): string {
    const interval = BOX_INTERVALS[boxLevel as keyof typeof BOX_INTERVALS] || 1;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    return nextDate.toISOString().split("T")[0]; // Return YYYY-MM-DD format
}

export function getNextBoxLevel(
    currentBox: number,
    isCorrect: boolean
): number {
    if (isCorrect) {
        // Move up one box (max box 5)
        return Math.min(currentBox + 1, 5);
    } else {
        // Move back to box 1 for incorrect answers
        return 1;
    }
}

export function calculateProgressUpdate(
    currentBoxLevel: number,
    isCorrect: boolean,
    currentCorrectCount: number,
    currentIncorrectCount: number
) {
    const newBoxLevel = getNextBoxLevel(currentBoxLevel, isCorrect);
    const nextReviewDate = getNextReviewDate(newBoxLevel);

    return {
        box_level: newBoxLevel,
        next_review_date: nextReviewDate,
        times_correct: isCorrect
            ? currentCorrectCount + 1
            : currentCorrectCount,
        times_incorrect: isCorrect
            ? currentIncorrectCount
            : currentIncorrectCount + 1,
        last_reviewed_at: new Date().toISOString(),
    };
}
