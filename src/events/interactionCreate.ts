import { LyraEvent } from ".";
import { Category, LyraClient } from "../types";
import { GuildMember, Interaction, MessageFlags } from "discord.js";
import { logger } from "@utils/logger";
import { baseEmbed, errorEmbed } from "@utils/embed";
import { t } from "@utils/i18n";
import { CommandEvent } from "@utils/CommandEvent";
import { config } from "../config";

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

      if (command.category === Category.DEV) {
        const isOwner = interaction.user.id === config.ownerId;
        const isMasterGuild = interaction.guildId === config.masterGuildId;
        const hasAdminRole = config.adminRoleId
          ? (interaction.member instanceof GuildMember && interaction.member.roles.cache.has(config.adminRoleId))
          : false;

        if (!isOwner && !(isMasterGuild && hasAdminRole)) {
          interaction.reply({
            embeds: [errorEmbed(t("message.default.noPermission"))],
            flags: MessageFlags.Ephemeral
          });
          return;
        }
      }

      await command.execute(event);
      logger.debug(`${interaction.user.username} used /${command.name}`);
    } catch (err) {
      await interaction.reply({
        embeds: [errorEmbed(t("error.generic"))],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

export default event;