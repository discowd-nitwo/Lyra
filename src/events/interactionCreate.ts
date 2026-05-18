import { LyraEvent } from ".";
import { LyraClient } from "../types";
import { Interaction, MessageFlags } from "discord.js";
import { logger } from "../utils/logger";
import { errorEmbed } from "../utils/embed";
import { t } from "../utils/i18n";
import { CommandEvent } from "../utils/CommandEvent";

const event: LyraEvent = {
  name: "interactionCreate",
  once: false,

  async execute(client: LyraClient, interaction: Interaction): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      logger.warn(`Unknown command: ${interaction.commandName}`);
      await interaction.reply({
        embeds: [errorEmbed(t("error.generic"))],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const event = new CommandEvent(client, interaction);

    try {
      if (command.nsfwOnly && !event.isNSFWChannel()) {
        await interaction.reply({
          embeds: [errorEmbed(t("message.default.onlyNSFW"))],
          flags: MessageFlags.Ephemeral
        });
        return;
      }

      await command.execute(event);
      logger.info(`${interaction.user.username} used /${command.name}`);
    } catch (err) {
      await interaction.reply({
        embeds: [errorEmbed(t("error.generic"))],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

export default event;