/**
 * Formats a raw string into UUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).
 * @param raw - The 32-character hex string to format.
 * @returns The formatted UUID string.
 */
export function formatUUID(raw: string): string {
  return `${raw.slice(0,8)}-${raw.slice(8,12)}-${raw.slice(12,16)}-${raw.slice(16,20)}-${raw.slice(20)}`;
}