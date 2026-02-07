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

  it("excludes names already in use", () => {
    const exclude = ["Alex Bot", "Luna Bot", "Max Bot"];
    for (let i = 0; i < 30; i++) {
      const name = generateBotName(exclude);
      expect(exclude).not.toContain(name);
      expect(KNOWN_BOT_NAMES).toContain(name);
    }
  });

  it("still returns a name when all names are excluded", () => {
    const name = generateBotName(KNOWN_BOT_NAMES);
    expect(typeof name).toBe("string");
    expect(name).toMatch(/^\w+ Bot$/);
  });
});
