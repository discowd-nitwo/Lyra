import { randomBytes, randomInt } from "crypto";

/**
 * Returns a cryptographically secure random integer between min and max (inclusive).
 */
export function secureRandomInt(min: number, max: number): number {
  return randomInt(min, max + 1);
}

/**
 * Returns a random element from an array.
 */
export function randomElement<T>(array: T[]): T {
  return array[secureRandomInt(0, array.length - 1)];
}

/**
 * Returns a random hex string of the given byte length.
 */
export function randomHex(bytes: number = 16): string {
  return randomBytes(bytes).toString("hex");
}

/**
 * Returns a random boolean.
 */
export function randomBool(): boolean {
  return secureRandomInt(0, 1) === 1;
}

/**
 * Shuffles an array in place using Fisher-Yates.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandomInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}