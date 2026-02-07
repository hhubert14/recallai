import { describe, it, expect } from "vitest";
import { generateBotName } from "./bot-names";

const KNOWN_BOT_NAMES = [
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

describe("generateBotName", () => {
  it("returns a string matching 'Name Bot' format", () => {
    const name = generateBotName();

    expect(typeof name).toBe("string");
    expect(name).toMatch(/^\w+ Bot$/);
  });

  it("returns a name from the known list", () => {
    // Run multiple times to reduce false-positive risk
    for (let i = 0; i < 20; i++) {
      const name = generateBotName();
      expect(KNOWN_BOT_NAMES).toContain(name);
    }
  });
});
