import { join } from "path";
import { LyraClient } from "../types";
import { readdirSync } from "fs";
import { logger } from "../utils/logger";

export interface LyraEvent {
  name: string;
  once?: boolean;
  execute(client: LyraClient, ...args: any[]): Promise<void>;
}

export async function loadEvents(client: LyraClient): Promise<void> {
  const eventsPath = join(__dirname);
  const eventFiles = readdirSync(eventsPath).filter(
    (file) => (file.endsWith(".ts") || file.endsWith(".js")) && file !== "index.ts" && file !== "index.js"
  );

  let loaded = 0;
  let failed = 0;

  for (const file of eventFiles) {
    try {
      const eventModule = await import(join(eventsPath, file));
      const event: LyraEvent = eventModule.default;

      if (!event?.name || !event?.execute) {
        logger.warn(`Skipping ${file} - missing name or execute function`);
        failed++;
        continue;
      }

      if (event.once) {
        client.once(event.name, (...args) => event.execute(client, ...args));
      } else {
        client.on(event.name, (...args) => event.execute(client, ...args));
      }

      loaded++;
      logger.info(`Loaded event: ${event.name}`);
    } catch (err) {
      logger.error(`Failed to load event ${file}: ${err}`)
      failed++;
    }
  }

  logger.info(`Events loaded: ${loaded} successful, ${failed} failed`);
}