import { SlashCommandBuilder, ChannelType, ColorResolvable } from "discord.js";
import { Category, ICommand } from "../../types";
import { CommandEvent } from "@utils/CommandEvent";
import { t } from "@utils/i18n";
import { baseEmbed } from "@utils/embed";
import { config } from "../../config";

const command: ICommand = {
  name: "guildinfo",
  description: t("command.description.guildinfo"),
  category: Category.UTILITY,
  aliases: ["serverinfo", "si", "gi", "sinfo", "ginfo"],
  guildOnly: true,

  async execute(event: CommandEvent): Promise<void> {

    const guild = event.isSlashCommand()
      ? event.interaction?.guild
      : event.message?.guild;

    const owner = await guild?.fetchOwner();
    const embed = baseEmbed()
      .setAuthor({ name: guild!.name, iconURL: guild?.iconURL() ?? undefined})
      .setThumbnail(guild?.iconURL() ?? null)
      .addFields(
        { name: "Owner", value: owner?.user.username ?? "Unknown", inline: true },
        { name: "Members", value: String(guild?.memberCount), inline: true },
        { name: "Roles", value: String(guild?.roles.cache.size), inline: true },
        { name: "Categories", value: String(guild!.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size), inline: true },
        { name: "Text Channels", value: String(guild!.channels.cache.filter(c => c.type === ChannelType.GuildText).size), inline: true },
        { name: "Voice Channels", value: String(guild?.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size), inline: true },
        { name: "Threads", value: String(guild!.channels.cache.filter(c => c.type === ChannelType.PublicThread).size + guild!.channels.cache.filter(c => c.type === ChannelType.PrivateThread).size), inline: true },
        { name: "Boosts", value: String(guild!.premiumSubscriptionCount), inline: true }
      )
      .setImage(guild?.bannerURL() ?? null)
      .setColor(config.mainColour as ColorResolvable)
      .setFooter({ text: `${guild?.name} | ${guild?.id}`, iconURL: guild?.iconURL() ?? event.client.user?.displayAvatarURL() })
      .setTimestamp()

    await event.reply(embed);
  },

  getSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("guildinfo")
      .setDescription(t("command.description.guildinfo")) as SlashCommandBuilder;
  },
};

export default command;