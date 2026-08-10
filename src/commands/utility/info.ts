import {ActionRowBuilder, ButtonBuilder, ButtonStyle, inlineCode, SlashCommandBuilder} from "discord.js";
import { config } from "@/config";
import { Category, ICommand } from "@/types";
import { CommandEvent } from "@utils/CommandEvent";
import { baseEmbed } from "@utils/embed";
import { formatUptime } from "@utils/format";
import { versionTag } from "@utils/logger";
import packageInfo from "../../../package.json";

const command: ICommand = {
  name: "info",
  description: "Shows bot information",
  category: Category.UTILITY,
  aliases: ["botinfo"],
  guildOnly: true,

  async execute(event: CommandEvent): Promise<void> {
    const embed = baseEmbed()
      .setTitle("Hiya, I'm Lyra!")
      .setThumbnail(event.client.user?.displayAvatarURL({ size: 1024 }) || null)
      .setDescription(
        "A feature-rich Discord bot written with <:Typescript:1524466424050090085> TypeScript inspired by [Ree6](https://www.ree6.de/)",
      )
      .addFields(
        { name: "Version", value: `${inlineCode(versionTag)}`, inline: true },
        {
          name: "Uptime",
          value: `${formatUptime(process.uptime() * 1000)}`,
          inline: true,
        },
        {
          name: "Node.js Version",
          value: inlineCode(process.version),
          inline: true,
        },
        {
          name: "Discord.js Version",
          value: inlineCode(packageInfo.dependencies["discord.js"] || "Unknown"),
          inline: true,
        }
      )
      .setFooter({
        text: `${event.getMemberName()} - ${config.advertisement}`,
        iconURL: event.getMemberAvatarUrl(),
      });

      const discordButton = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Join our Discord!").setURL("https://discord.gg/U5f9kACj44")

      const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(discordButton)

      await event.replyWithComponents(embed, [actionRow]);
  },

  getSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("info")
      .setDescription("Shows bot information")
  }
};

export default command;