import { Message, PartialMessage, EmbedBuilder, Events } from "discord.js";
import { LyraEvent } from ".";
import { LyraClient } from "../types";
import { sendAuditLog, AuditEventType } from "../utils/auditLogger";

const event: LyraEvent = {
  name: Events.MessageUpdate,
  once: false,

  async execute(client: LyraClient, oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage): Promise<void> {
    if (newMessage.author?.bot) return;
    if (!newMessage.guildId) return;
    if (oldMessage.content === newMessage.content) return;

    const channel = newMessage.channel;
    const channelName = channel.isTextBased() && 'name' in channel ? channel.name : 'Unknown';

    const embed = new EmbedBuilder()
      .setTitle("Message Edited")
      .setAuthor({
        name: newMessage.author?.tag ?? "Unknown",
        iconURL: newMessage.author?.displayAvatarURL() ?? undefined,
      })
      .setDescription(`> **Channel**: ${channelName} <#${newMessage.channelId}>\n> **Message ID**: ${`[${newMessage.id}`}](${newMessage.url})\n> **Message Author**: @${newMessage.author?.username} (<@${newMessage.author?.id}>)\n> **Message Created**: <t:${Math.floor(oldMessage.createdTimestamp / 1000)}:R>`)
      .addFields(
        { name: "Before", value: (oldMessage.content || "Unknown").slice(0, 1024), inline: true },
        { name: "After", value: (newMessage.content || "Unknown").slice(0, 1024), inline: true },
      )
      .setFooter({ text: `User ID: ${newMessage.author?.id}` })
      .setTimestamp();

    await sendAuditLog(client, {
      guildId: newMessage.guildId,
      eventType: AuditEventType.MESSAGE_UPDATE,
      embed,
      userId: newMessage.author?.id,
      metadata: { channelId: newMessage.channelId, messageId: newMessage.id },
    });
  },
};

export default event;