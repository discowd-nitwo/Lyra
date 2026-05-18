import { Message, PartialMessage, EmbedBuilder } from "discord.js";
import { LyraEvent } from ".";
import { LyraClient } from "../types";
import { sendAuditLog, AuditEventType } from "../utils/auditLogger";

const event: LyraEvent = {
  name: "messageUpdate",
  once: false,

  async execute(client: LyraClient, oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage): Promise<void> {
    if (newMessage.author?.bot) return;
    if (!newMessage.guildId) return;
    if (oldMessage.content === newMessage.content) return;

    const embed = new EmbedBuilder()
      .setTitle("Message Edited")
      .addFields(
        { name: "Author", value: `<@${newMessage.author?.id}> (${newMessage.author?.tag ?? "Unknown"})`, inline: true },
        { name: "Channel", value: `<#${newMessage.channelId}>`, inline: true },
        { name: "Before", value: oldMessage.content || "Unknown", inline: false },
        { name: "After", value: newMessage.content || "Unknown", inline: false },
        { name: "Jump to Message", value: `[Click here](${newMessage.url})`, inline: false }
      );

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