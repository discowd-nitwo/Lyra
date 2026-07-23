import {
  GuildMember,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { Category, ICommand } from "@/types";
import { CommandEvent } from "@utils/CommandEvent";
import { errorEmbed, infoEmbed, successEmbed } from "@utils/embed";
import { t } from "@utils/i18n";

const MAX_PURGE = 100;

const command: ICommand = {
  name: "purge",
  description: t("command.description.purge"),
  category: Category.MODERATION,
  aliases: ["clear", "bulkdelete"],
  guildOnly: true,

  async execute(event: CommandEvent): Promise<void> {
    const member = (event.interaction?.member ??
      event.message?.member) as GuildMember | null;
    if (!member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
      await event.reply(errorEmbed(t("message.error.noPermission")));
      return;
    }

    const channel = (event.interaction?.channel ??
      event.message?.channel) as TextChannel;
    if (!channel || !("bulkDelete" in channel)) {
      await event.reply(errorEmbed(t("message.purge.notTextChannel")));
      return;
    }

    let amount: number;
    if (event.isSlashCommand()) {
      amount = event.interaction?.options.getInteger("amount") ?? 0;
    } else {
      const raw = event.args?.[0];
      amount = raw ? parseInt(raw, 10) : 0;
    }

    if (isNaN(amount) || amount < 1) {
      await event.reply(errorEmbed(t("message.purge.invalid")));
      return;
    }

    if (amount > MAX_PURGE) {
      await event.reply(errorEmbed(t("message.purge.tooHigh")));
      return;
    }

    if (event.message) {
      const statusMsg = await event.message.reply({
        embeds: [infoEmbed("Purging messages...")],
      });

      const messages = await channel.messages.fetch({ limit: amount });
      const filtered = messages.filter((m) => m.id !== statusMsg.id);
      const deleted = await channel.bulkDelete(filtered, true);

      await statusMsg.edit({
        embeds: [
          successEmbed(
            t("message.purge.success", { count: String(deleted.size) }),
          ),
        ],
      });

      setTimeout(() => {
        statusMsg.delete().catch(() => null);
        event.message?.delete().catch(() => null);
      }, 5000);
    } else {
      const deleted = await channel.bulkDelete(amount, true);

      await event.reply(
        successEmbed(t("message.purge.success", { count: String(deleted.size) })),
        5,
      );
    }
  },

  getSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("purge")
      .setDescription(t("command.description.purge"))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
      .addIntegerOption((option) =>
        option
          .setName("amount")
          .setDescription(t("command.option.purge.amount"))
          .setMinValue(1)
          .setMaxValue(MAX_PURGE)
          .setRequired(true),
      ) as SlashCommandBuilder;
  },
};

export default command;
