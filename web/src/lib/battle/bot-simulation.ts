export interface BotAnswer {
  selectedOptionId: number;
  isCorrect: boolean;
  delayMs: number;
}

const BOT_ACCURACY = 0.78;
const MIN_DELAY_MS = 1500;
const MAX_DELAY_MS = 4000;

export function simulateBotAnswer(
  options: { id: number; isCorrect: boolean }[],
  timeLimitSeconds: number
): BotAnswer {
  const picksCorrect = Math.random() < BOT_ACCURACY;

  let selectedOption: { id: number; isCorrect: boolean };

  if (picksCorrect) {
    selectedOption = options.find((o) => o.isCorrect)!;
  } else {
    const wrongOptions = options.filter((o) => !o.isCorrect);
    selectedOption = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
  }

  const maxDelay = Math.min(MAX_DELAY_MS, timeLimitSeconds * 1000 - 500);
  const delayMs = Math.floor(
    MIN_DELAY_MS + Math.random() * (maxDelay - MIN_DELAY_MS)
  );

  return {
    selectedOptionId: selectedOption.id,
    isCorrect: selectedOption.isCorrect,
    delayMs,
  };
}
