import { PermissionFlagsBits, SlashCommandBuilder, TextChannel, GuildMember } from "discord.js";
import { Category, ICommand } from "../../types";
import { CommandEvent } from "@utils/CommandEvent";
import { errorEmbed, infoEmbed, successEmbed, warnEmbed } from "@utils/embed";
import { t } from "@utils/i18n";

const MAX_SLOWMODE = 21600;

const command: ICommand = {
  name: "slowmode",
  description: t("command.description.slowmode"),
  category: Category.MODERATION,
  aliases: ["sm", "smode"],
  guildOnly: true,

  async execute(event: CommandEvent) {
    const member = (event.interaction?.member ?? event.message?.member) as GuildMember | null;
    if (!member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await event.reply(errorEmbed(t("message.default.noPermission")));
      return;
    }

    const channel = (event.interaction?.channel ?? event.message?.channel) as TextChannel;
    if (!channel || !("rateLimitPerUser" in channel)) {
      await event.reply(errorEmbed(t("message.slowmode.notTextChannel")));
      return;
    }

    let duration: number;
    if (event.isSlashCommand()) {
      duration = event.interaction?.options.getInteger("duration") ?? 0;
    } else {
      const raw = event.args?.[0];
      if (raw == "query") {
        if (channel.rateLimitPerUser === 0) {
          await event.reply(warnEmbed("Slowmode is currently disabled in this channel."));
          return;
        } else {
          await event.reply(infoEmbed(t("message.slowmode.query", { duration: String(channel.rateLimitPerUser) })));
          return;
        }
      }
      duration = raw ? parseInt(raw, 10) : 0;
    }

    if (isNaN(duration) || duration < 0) {
      await event.reply(errorEmbed(t("message.slowmode.invalid")));
      return;
    }

    if (duration > MAX_SLOWMODE) {
      await event.reply(errorEmbed(t("message.slowmode.tooHigh")));
      return;
    }

    await channel.setRateLimitPerUser(duration, `Slowmode set by ${event.getMemberName()}`);

    if (duration === 0) {
      await event.reply(successEmbed(t("message.slowmode.removed")));
    } else {
      await event.reply(successEmbed(t("message.slowmode.set", { duration: String(duration) })));
    }
  },

  getSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("slowmode")
      .setDescription(t("command.description.slowmode"))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
      .addIntegerOption(option =>
        option
          .setName("duration")
          .setDescription(t("command.option.slowmode.duration"))
          .setMinValue(0)
          .setMaxValue(MAX_SLOWMODE)
          .setRequired(false)
      ) as SlashCommandBuilder;
  },
};

export default command;