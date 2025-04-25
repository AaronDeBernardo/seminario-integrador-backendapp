import crypto from "crypto";

export function generateRandomCode(length: number = 20): string {
  return crypto
    .randomBytes(Math.ceil((length * 3) / 4))
    .toString("base64url")
    .slice(0, length);
}
