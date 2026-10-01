import {SlashCommandBuilder, User} from "discord.js";
import { Category, ICommand } from "@/types";
import { CommandEvent } from "@utils/CommandEvent";
import { t } from "@utils/i18n";
import { baseEmbed, errorEmbed } from "@utils/embed";
import { config } from "@/config";

const command: ICommand = {
  name: "avatar",
  description: t("command.description.avatar"),
  category: Category.UTILITY,
  aliases: ["av"],

  async execute(event: CommandEvent): Promise<void> {
    let user: User | null = null;
    let avatarType: boolean | null = null;

    if (event.isSlashCommand()) {
      user = event.interaction?.options.getUser("target") ?? null;
      avatarType = event.interaction?.options.getBoolean("server-avatar") ?? null;
    } else {
      const arg = event.args?.[0];
      const userId = arg?.replace(/[<@!>]/g, ""); // handles both raw IDs and mentions

      const avatarTypeText = event.args?.[1];

      avatarType = ["server", "guild", "true"].includes(avatarTypeText?.toLowerCase() ?? "");

      if (userId && /^\d+$/.test(userId)) {
        user =
          (await event.client.users.fetch(userId).catch(() => null)) ?? null;
      }

      if (!user) {
        const mentions = event.message?.mentions.users;
        if (event.args?.length && mentions?.size === 0) {
          await event.reply(errorEmbed(t("message.default.noMention.user")), 5);
          return;
        }
        user = mentions?.first() ?? null;
      }
    }

    if (!user) {
      user = event.isSlashCommand()
        ? (event.interaction?.user ?? null)
        : (event.message?.author ?? null);
    }

    if (!user) {
      await event.reply(errorEmbed(t("error.generic")), 5);
      return;
    }

    let avatarUrl = user.displayAvatarURL({ size: 1024, extension: "webp" })

    const guild = event.interaction?.guild ?? event.message?.guild;

    if (avatarType && guild) {
      const member = await guild.members.fetch(user.id).catch(() => null);
      if (member) avatarUrl = member.displayAvatarURL({ size: 1024, extension: "webp" });
    }

    const embed = baseEmbed()
      .setTitle(t("label.avatar"))
      .setAuthor({
        name: user.displayName,
        iconURL: avatarUrl,
        url: avatarUrl,
      })
      .setImage(avatarUrl)
      .setFooter({
        text: `${event.getMemberName()} - ${config.advertisement}`,
        iconURL: event.getMemberAvatarUrl(),
      });

    await event.reply(embed);
  },

  getSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
        .setName("avatar")
        .setDescription(t("command.description.avatar"))
        .addUserOption((option) =>
            option
                .setName("target")
                .setDescription("The user whose avatar you want")
                .setRequired(false),
        )
        .addBooleanOption((option) =>
            option
                .setName("server-avatar")
                .setDescription("Whether you want the user's server avatar or not")
        ) as SlashCommandBuilder;
  },
};

export default command;
