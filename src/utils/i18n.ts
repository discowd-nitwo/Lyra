import { logger } from "./logger";

type Locale = Record<string, unknown>;

let locale: Locale = {};

export async function loadLocale(lang: string = "en"): Promise<void> {
  try {
    locale = await import(`../locales/${lang}.json`);
    logger.info(`Loaded locale: ${lang}`);
  } catch (err) {
    logger.error(`Failed to load locale ${lang}: ${err}`);
  }
}

/**
 * Retrieves a translation string by dot-notation key.
 * e.g. t("message.default.onlyNSFW")
 */
export function t(key: string, replacements?: Record<string, string>): string {
  const value = key.split(".").reduce<unknown>((obj, k) => {
    if (typeof obj === "object" && obj !== null) {
      return (obj as Record<string, unknown>)[k];
    }
    return undefined;
  }, locale);

  if (typeof value !== "string") {
    logger.warn(`Missing translation key: ${key}`);
    return key;
  }

  if (replacements) {
    return Object.entries(replacements).reduce(
      (str, [k, v]) => str.replace(`{${k}}`, v),
      value
    );
  }

  return value;
}