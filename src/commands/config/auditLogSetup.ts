import { ChannelType, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from "discord.js";
import { Category, ICommand } from "../../types";
import { CommandEvent } from "@utils/CommandEvent";
import { baseEmbed, errorEmbed } from "@utils/embed";
import { t } from "@utils/i18n";
import prisma from "../../database";

const command: ICommand = {
  name: "auditlogsetup",
  description: t("command.description.auditlogsetup"),
  category: Category.CONFIG,
  aliases: ["auditlog", "setauditlog"],
  guildOnly: true,

  async execute(event: CommandEvent): Promise<void> {
    const guildId = event.isSlashCommand()
      ? event.interaction?.guildId
      : event.message?.guildId

    if (!guildId) {
      await event.reply(errorEmbed("This command can only be used in a server."), 5);
      return;
    }

    const member = event.isSlashCommand()
      ? event.interaction?.memberPermissions
      : (event.message?.member?.permissions);

    if (!member?.has(PermissionFlagsBits.ManageGuild)) {
      await event.reply(errorEmbed("You need the **Manage Server** permission to use this command."), 5);
      return;
    }
        if (event.isSlashCommand() && event.interaction) {
      const subcommand = event.interaction.options.getSubcommand();

      if (subcommand === "enable") {
        const channel = event.interaction.options.getChannel("channel", true);

        if (channel.type !== ChannelType.GuildText) {
          await event.reply(errorEmbed("Please select a text channel."), 5);
          return;
        }

        await prisma.guildConfig.upsert({
          where: { guildId },
          create: { guildId, auditLogChannel: channel.id, auditLogEnabled: true },
          update: { auditLogChannel: channel.id, auditLogEnabled: true },
        });

        const embed = baseEmbed()
          .setTitle("✅ Audit Log Enabled")
          .setDescription(`Audit logs will now be sent to <#${channel.id}>.`);

        await event.reply(embed);

      } else if (subcommand === "disable") {
        await prisma.guildConfig.upsert({
          where: { guildId },
          create: { guildId, auditLogEnabled: false },
          update: { auditLogEnabled: false },
        });

        const embed = baseEmbed()
          .setTitle("🔕 Audit Log Disabled")
          .setDescription("Audit logging has been disabled for this server.");

        await event.reply(embed);
      }

      return;
    }

    // Prefix command fallback
    const subcommand = event.args?.[0]?.toLowerCase();

    if (!subcommand || !["enable", "disable"].includes(subcommand)) {
      await event.reply(errorEmbed("Usage: `auditlogsetup enable #channel` or `auditlogsetup disable`"), 5);
      return;
    }

    if (subcommand === "enable") {
      const channelMention = event.args?.[1];
      const channelId = channelMention?.replace(/[<#>]/g, "");
      const channel = channelId
        ? await event.message?.guild?.channels.fetch(channelId).catch(() => null)
        : null;

      if (!channel || !(channel instanceof TextChannel)) {
        await event.reply(errorEmbed("Please mention a valid text channel. Usage: `auditlogsetup enable #channel`"), 5);
        return;
      }

      await prisma.guildConfig.upsert({
        where: { guildId },
        create: { guildId, auditLogChannel: channel.id, auditLogEnabled: true },
        update: { auditLogChannel: channel.id, auditLogEnabled: true },
      });

      const embed = baseEmbed()
        .setTitle("✅ Audit Log Enabled")
        .setDescription(`Audit logs will now be sent to <#${channel.id}>.`);

      await event.reply(embed);

    } else if (subcommand === "disable") {
      await prisma.guildConfig.upsert({
        where: { guildId },
        create: { guildId, auditLogEnabled: false },
        update: { auditLogEnabled: false },
      });

      const embed = baseEmbed()
        .setTitle("🔕 Audit Log Disabled")
        .setDescription("Audit logging has been disabled for this server.");

      await event.reply(embed);
    }
  },

  getSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("auditlogsetup")
      .setDescription("Configure the audit log channel for this server.")
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
      .addSubcommand((sub) =>
        sub
          .setName("enable")
          .setDescription("Enable audit logging and set the channel.")
          .addChannelOption((option) =>
            option
              .setName("channel")
              .setDescription("The channel to send audit logs to.")
              .addChannelTypes(ChannelType.GuildText)
              .setRequired(true)
          )
      )
      .addSubcommand((sub) =>
        sub
          .setName("disable")
          .setDescription("Disable audit logging for this server.")
      ) as SlashCommandBuilder;
  },
};

export default command;