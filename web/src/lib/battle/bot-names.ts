const BOT_NAMES = [
  "Alex Bot",
  "Luna Bot",
  "Max Bot",
  "Nova Bot",
  "Sam Bot",
  "Kai Bot",
  "Mia Bot",
  "Leo Bot",
  "Zoe Bot",
  "Finn Bot",
];

/**
 * Generate a random bot name from a preset list.
 */
export function generateBotName(): string {
  return BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
}
