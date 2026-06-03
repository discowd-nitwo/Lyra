import { EmbedBuilder, Events, Message, PartialMessage } from "discord.js";
import { LyraEvent } from ".";
import { LyraClient } from "../types";
import { AuditEventType, sendAuditLog } from "../utils/auditLogger";

const event: LyraEvent = {
  name: Events.MessageDelete,

  async execute(client: LyraClient, message: Message | PartialMessage): Promise<void> {
    if (!message.guild || !message.author || message.author.bot || !message) return;

    const channel = message.channel;
    const channelName = channel.isTextBased() && 'name' in channel ? channel.name : 'Unknown';
    const embed = new EmbedBuilder()
      .setTitle("Message Deleted")
      .setAuthor({
        name: message.author.tag ?? "Unknown",
        iconURL: message.author.displayAvatarURL() ?? undefined,
      })
      .setDescription(`> **Channel**: ${channelName} <#${message.channelId}>\n> **Message ID**: ${`[${message.id}`}](${message.url})\n> **Message Author**: @${message.author.username} (<@${message.author.id}>)\n> **Message Created**: <t:${Math.floor(message.createdTimestamp / 1000)}:R>`)
      .addFields(
        { name: "Message", value: (message.content || "Unknown").slice(0, 1024), inline: true }
      )
      .setFooter({ text: `User ID: ${message.author.id}` })
      .setTimestamp();

    await sendAuditLog(client, {
      guildId: message.guildId as string,
      eventType: AuditEventType.MESSAGE_DELETE,
      embed,
      userId: message.author?.id,
      metadata: { channelId: message.channelId, messageId: message.id },
    });
  },
};

export default event;