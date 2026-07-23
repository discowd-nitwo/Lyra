import { SlashCommandBuilder, ChannelType, ColorResolvable, GuildVerificationLevel } from "discord.js";
import { Category, ICommand } from "@/types";
import { CommandEvent } from "@utils/CommandEvent";
import { t } from "@utils/i18n";
import { baseEmbed } from "@utils/embed";
import { config } from "@/config";

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
    const g = guild!;

    const channelCounts = {
      text: g.channels.cache.filter(c => c.type === ChannelType.GuildText).size,
      voice: g.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size,
      category: g.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size,
      threads: g.channels.cache.filter(c => c.isThread()).size,
    };

    const embed = baseEmbed()
      .setAuthor({ name: g.name, iconURL: g.iconURL() ?? undefined })
      .setThumbnail(g.iconURL() ?? null)
      .addFields(
        { name: "Owner", value: owner?.user.username ?? "Unknown", inline: true },
        { name: "Created", value: `<t:${Math.floor(g.createdTimestamp / 1000)}:R>`, inline: true },
        { name: "Verification", value: GuildVerificationLevel[g.verificationLevel], inline: true },
        { name: "Members", value: String(g.memberCount), inline: true },
        { name: "Roles", value: String(g.roles.cache.size), inline: true },
        { name: "Boosts", value: `${g.premiumSubscriptionCount ?? 0} (Tier ${g.premiumTier})`, inline: true },
        {
          name: "Channels",
          value: `${channelCounts.text} text · ${channelCounts.voice} voice · ${channelCounts.category} categories · ${channelCounts.threads} threads`,
        }
      )
      .setImage(g.bannerURL() ?? null)
      .setColor(config.mainColour as ColorResolvable)
      .setFooter({ text: `${g.name} | ${g.id}`, iconURL: g.iconURL() ?? event.client.user?.displayAvatarURL() })
      .setTimestamp();

    await event.reply(embed);
  },

  getSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("guildinfo")
      .setDescription(t("command.description.guildinfo")) as SlashCommandBuilder;
  },
};

export default command;