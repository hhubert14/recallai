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
 * Generate a random bot name from a preset list, excluding names already in use.
 */
export function generateBotName(exclude: string[] = []): string {
  const available = BOT_NAMES.filter((name) => !exclude.includes(name));
  const pool = available.length > 0 ? available : BOT_NAMES;
  return pool[Math.floor(Math.random() * pool.length)];
}
