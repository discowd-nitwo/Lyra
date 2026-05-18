import { EmbedBuilder, Message, PartialMessage } from "discord.js";
import { LyraEvent } from ".";
import { LyraClient } from "../types";
import { AuditEventType, sendAuditLog } from "../utils/auditLogger";

const event: LyraEvent = {
  name: "messageDelete",
  once: false,

  async execute(client: LyraClient, message: Message | PartialMessage): Promise<void> {
    if (message.author?.bot) return;
    if (!message.guildId) return;

    const embed = new EmbedBuilder()
      .setTitle("Message Deleted")
      .addFields(
        { name: "Author", value: `<@${message.author?.id}> (${message.author?.tag ?? "Unknown"})`, inline: true },
        { name: "Channel", value: `<#${message.channelId}>`, inline: true },
        { name: "Content", value: message.content || "No content (embed or attachment)", inline: false }
      );

    await sendAuditLog(client, {
      guildId: message.guildId,
      eventType: AuditEventType.MESSAGE_DELETE,
      embed,
      userId: message.author?.id,
      metadata: { channelId: message.channelId, messageId: message.id },
    });
  },
};

export default event;