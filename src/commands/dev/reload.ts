import { join } from "path";
import { LyraEvent } from "../../events";
import { Category, ICommand, LyraClient } from "../../types";
import { getLogger } from "@utils/logger";
import { readdirSync } from "fs";
import { t } from "@utils/i18n";
import { SlashCommandBuilder } from "discord.js";
import { errorEmbed, infoEmbed, successEmbed } from "@utils/embed";
import { CommandEvent } from "@utils/CommandEvent";
import { config } from "../../config";

const logger = getLogger("reload-events")

async function reloadEvents(
  client: LyraClient,
): Promise<{ loaded: number; failed: number; errors: string[] }> {
  const eventsPath = join(__dirname, "../../events");
  const eventFiles = readdirSync(eventsPath).filter(
    (file) =>
      (file.endsWith(".ts") || file.endsWith(".js")) &&
      !file.endsWith(".d.ts") &&
      file !== "index.ts" &&
      file !== "index.js",
  );

  let loaded = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    try {
      delete require.cache[require.resolve(filePath)];

      const eventModule = await import(filePath);
      const event: LyraEvent = eventModule.default;

      if (!event?.name || !event?.execute) {
        logger.warn(`Skipping ${file} - missing name or execute function`);
        errors.push(`${file}: missing name or execute`);
        failed++;
        continue;
      }

      client.removeAllListeners(event.name);

      if (event.once) {
        client.once(event.name, (...args) => event.execute(client, ...args));
      } else {
        client.on(event.name, (...args) => event.execute(client, ...args));
      }

      loaded++;
      logger.debug(`Reloaded event: ${event.name}`);
    } catch (err) {
      logger.error(`Failed to reload event ${file}: ${err}`);
      errors.push(`${file}: ${err}`);
      failed++;
    }
  }

  return { loaded, failed, errors };
}

const command: ICommand = {
  name: "reload",
  description: t("command.description.reload"),
  category: Category.DEV,
  aliases: ["rl"],

  async execute(event: CommandEvent): Promise<void> {
    const authorId = event.interaction?.user.id ?? event.message?.author.id;

    if (authorId !== config.ownerId) {
      await event.reply(errorEmbed(t("message.reload.noPermission")));
      return;
    }

    await event.reply(infoEmbed(t("message.reload.reloading")));

    const { loaded, failed, errors } = await reloadEvents(event.client);

    if (failed === 0) {
      await event.reply(
        successEmbed(t("message.reload.success", { loaded: String(loaded) })),
      );
    } else {
      const errorList = errors.map((e) => `• ${e}`).join("\n");
      await event.reply(
        errorEmbed(
          t("message.reload.partial", {
            loaded: String(loaded),
            failed: String(failed),
            errors: errorList,
          }),
        ),
      );
    }

    logger.debug(
      `Events reloaded by ${authorId}: ${loaded} loaded, ${failed} failed`,
    );
  },

  getSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("reload")
      .setDescription(t("command.description.reload")) as SlashCommandBuilder;
  },
};

export default command;
