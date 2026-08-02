import { Message } from "discord.js";
import { LyraEvent } from ".";
import { Category, LyraClient } from "@/types";
import { config } from "@/config";
import { CommandEvent } from "@utils/CommandEvent";
import { baseEmbed, errorEmbed } from "@utils/embed";
import { t } from "@utils/i18n";
import { getLogger } from "@utils/logger";

const logger = getLogger("messageCreate")

const event: LyraEvent = {
  name: "messageCreate",
  once: false,

  async execute(client: LyraClient, message: Message) {
    if (message.author.bot) return;
    if (message.content.startsWith(`<@${client.user?.id}>`)) {
      await message.react('👋')

      const embed = baseEmbed()
        .setTitle("hey!")
        .setDescription(`My prefix is currently \`${config.prefix}\`!`)
        .setFooter({ text: `${client.user?.tag}`, iconURL: client.user?.displayAvatarURL() })
      
      const sent = await message.reply({ embeds: [embed] });
      setTimeout(() => sent.delete().catch(() => {}), 5000)
      return
    };
    if (!message.content.startsWith(config.prefix)) return;

    const [commandName, ...args] = message.content
      .slice(config.prefix.length)
      .trim()
      .split(/\s+/);

    const name = commandName.toLowerCase();

    const command =
      client.commands.get(name) ??
      client.commands.get(client.aliases.get(name) ?? "");

    if (!command) return;

    const event = new CommandEvent(client, message, args);

    try {
      if (command.nsfwOnly && !event.isNSFWChannel()) {
        await message.reply({
          embeds: [errorEmbed(t("message.default.onlyNSFW"))],
        });
        return;
      }

      if (command.category === Category.DEV) {
        const isOwner = message.author.id === config.ownerId;
        const isMasterGuild = message.guildId === config.masterGuildId;
        const hasAdminRole = config.adminRoleId
          ? (message.member?.roles.cache.has(config.adminRoleId) ?? false)
          : false;

        if (!isOwner && !(isMasterGuild && hasAdminRole)) {
          await message.reply({
            embeds: [errorEmbed(t("message.default.noPermission"))]
          });
          return;
        }
      }

      await command.execute(event);
      logger.debug(`${message.author.username} used ${config.prefix}${command.name}`)
    } catch (err) {
      logger.error(`Error executing command ${command.name}: ${err}`);
      await message.reply({
        embeds: [errorEmbed(t("error.generic"))],
      });
    }
  },
};

export default event;