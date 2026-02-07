import { scrypt, randomBytes, timingSafeEqual } from "crypto";

/**
 * Hash a password using scrypt with a random salt.
 * Returns a string in the format "salt:hash" (both hex-encoded).
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = await new Promise<string>((resolve, reject) => {
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString("hex"));
    });
  });
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored "salt:hash" string.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const parts = storedHash.split(":");
  if (parts.length !== 2) {
    return false;
  }
  const [salt, hash] = parts;
  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
  const hashBuffer = Buffer.from(hash, "hex");
  if (derivedKey.length !== hashBuffer.length) {
    return false;
  }
  return timingSafeEqual(derivedKey, hashBuffer);
}
