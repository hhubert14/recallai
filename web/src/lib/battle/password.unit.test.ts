import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password utility", () => {
  it("hashes a password to a salt:hash string", async () => {
    const hash = await hashPassword("mypassword");

    expect(hash).not.toBe("mypassword");
    expect(hash).toContain(":");

    const [salt, derivedHash] = hash.split(":");
    expect(salt).toHaveLength(32); // 16 bytes hex
    expect(derivedHash).toHaveLength(128); // 64 bytes hex
  });

  it("verifies a correct password", async () => {
    const hash = await hashPassword("correct-password");
    const result = await verifyPassword("correct-password", hash);

    expect(result).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct-password");
    const result = await verifyPassword("wrong-password", hash);

    expect(result).toBe(false);
  });

  it("produces different hashes for the same password (salt uniqueness)", async () => {
    const hash1 = await hashPassword("same-password");
    const hash2 = await hashPassword("same-password");

    expect(hash1).not.toBe(hash2);
  });
});
