import { Message } from "discord.js";
import { LyraEvent } from ".";
import { LyraClient } from "../types";
import { config } from "../config";
import { CommandEvent } from "../utils/CommandEvent";
import { baseEmbed, errorEmbed } from "../utils/embed";
import { t } from "../utils/i18n";
import { logger } from "../utils/logger";

const event: LyraEvent = {
  name: "messageCreate",
  once: false,

  async execute(client: LyraClient, message: Message) {
    if (message.author.bot) return;
    if (message.content.startsWith(`<@${client.user?.id}>`)) {
      message.react('👋')

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

      await command.execute(event);
      logger.info(`${message.author.username} used ${config.prefix}${command.name}`)
    } catch (err) {
      logger.error(`Error executing command ${command.name}: ${err}`);
      await message.reply({
        embeds: [errorEmbed(t("error.generic"))],
      });
    }
  },
};

export default event;