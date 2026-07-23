import { GuildMember, SlashCommandBuilder, User } from "discord.js";
import { Category, ICommand } from "@/types";
import { CommandEvent } from "@utils/CommandEvent";
import { t } from "@utils/i18n";
import { baseEmbed, errorEmbed } from "@utils/embed";
import { config } from "@/config";

const command: ICommand = {
  name: "userinfo",
  description: t("command.description.userinfo"),
  category: Category.UTILITY,
  aliases: ["whois", "w", "ui"],
  guildOnly: true,

  async execute(event: CommandEvent): Promise<void> {
    let user: User | null = null;
    let member: GuildMember | null = null;

    const guild = event.isSlashCommand()
      ? event.interaction?.guild
      : event.message?.guild;

    if (event.isSlashCommand()) {
      user = event.interaction?.options.getUser("target") ?? event.interaction?.user ?? null;
    } else {
      const arg = event.args?.[0];
      const userId = arg?.replace(/[<@!>]/g, ""); // strip mention formatting if present

      if (userId && /^\d+$/.test(userId)) {
        user = await event.client.users.fetch(userId).catch(() => null) ?? null;
      }

      user = user ?? event.message?.author ?? null;
    }

    if (!user) {
      await event.reply(errorEmbed(t("error.generic")), 5);
      return;
    }

    member = await guild?.members.fetch(user.id).catch(() => null) ?? null;

    const roles = member?.roles.cache
      .filter((r) => r.id !== guild?.id)
      .sort((a, b) => b.position - a.position)
      .map((r) => `<@&${r.id}>`)
      .join(" ") || "None";
    
    const embed = baseEmbed()
      .setTitle(`${user.displayName}'s Info`)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "Username", value: user.tag, inline: true },
        { name: "ID", value: user.id, inline: true },
        { name: "Bot", value: user.bot ? "Yes" : "No", inline: true },
        { name: "Account Created", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
        ...(member ? [
          { name: "Joined Server", value: member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : "Unknown", inline: true },
          { name: "Nickname", value: member.nickname ?? "None", inline: true },
          { name: `Roles (${member.roles.cache.size - 1})`, value: roles.length > 1024 ? "Too many roles to display" : roles, inline: false },
        ] : [])
      )
      .setFooter({
        text: `${event.getMemberName()} - ${config.advertisement}`,
        iconURL: event.getMemberAvatarUrl(),
      });

      await event.reply(embed);
  },

  getSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("userinfo")
      .setDescription(t("command.description.userinfo"))
      .addUserOption((option) => 
        option
          .setName("target")
          .setDescription("The user to get info about")
          .setRequired(false)
      ) as SlashCommandBuilder;
  },
};

export default command;