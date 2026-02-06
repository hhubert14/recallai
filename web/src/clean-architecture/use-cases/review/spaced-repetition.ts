const BOX_INTERVALS = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
};

export function getNextReviewDate(boxLevel: number): string {
  const interval = BOX_INTERVALS[boxLevel as keyof typeof BOX_INTERVALS] || 1;
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  return nextDate.toISOString().split("T")[0];
}

export function getNextBoxLevel(
  currentBox: number,
  isCorrect: boolean
): number {
  if (isCorrect) {
    return Math.min(currentBox + 1, 5);
  } else {
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
    boxLevel: newBoxLevel,
    nextReviewDate: nextReviewDate,
    timesCorrect: isCorrect ? currentCorrectCount + 1 : currentCorrectCount,
    timesIncorrect: isCorrect
      ? currentIncorrectCount
      : currentIncorrectCount + 1,
    lastReviewedAt: new Date().toISOString(),
  };
}
