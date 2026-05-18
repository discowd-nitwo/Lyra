import { join } from "path";
import { ICommand, LyraClient } from "../types";
import { readdirSync, statSync } from "fs";
import { logger } from "../utils/logger";

export async function loadCommands(client:LyraClient): Promise<void> {
  const categoriesPath = join(__dirname);

  const categories = readdirSync(categoriesPath).filter((item) => {
    return (
      statSync(join(categoriesPath, item)).isDirectory()
    );
  });

  let loaded = 0;
  let failed = 0;

  for (const category of categories) {
    const categoryPath = join(categoriesPath, category);
    const commandFiles = readdirSync(categoryPath).filter((file) =>
      file.endsWith(".ts") || file.endsWith(".js")
    );

    for (const file of commandFiles) {
      try {
        const commandModule = await import(join(categoryPath, file));
        const command: ICommand = commandModule.default;

        if (!command?.name || !command?.execute) {
          logger.warn(`Skipping ${file} - missing name or execute function`);
          failed++;
          continue;
        }

        client.commands.set(command.name, command);

        if (command.aliases?.length) {
          command.aliases.forEach((alias) => {
            client.aliases.set(alias, command.name);
          });
        }

        loaded++;
        logger.info(`Loaded command: ${command.name} [${command.category}]`);
      } catch (err) {
        logger.error(`Failed to load command ${file}: ${err}`);
        failed++;
      }
    }
  }

  logger.info(`Commands loaded: ${loaded} successful, ${failed} failed`)
}