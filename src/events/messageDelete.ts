import { AuditLogEvent, EmbedBuilder, Message, PartialMessage } from "discord.js";
import { LyraEvent } from ".";
import { LyraClient } from "../types";
import { AuditEventType, sendAuditLog } from "../utils/auditLogger";

const event: LyraEvent = {
  name: "messageDelete",
  once: false,

  async execute(client: LyraClient, message: Message | PartialMessage): Promise<void> {
    if (message.author?.bot) return;
    if (!message.guild) return;
    if (!message.guildId) return;

    await new Promise(r => setTimeout(r, 500));

    const embed = new EmbedBuilder()
      .setTitle("Message Deleted")
      .setThumbnail(message.author?.displayAvatarURL() ?? null)
      .addFields(
        { name: "Author", value: `<@${message.author?.id}> (${message.author?.tag ?? "Unknown"})`, inline: true },
        { name: "Channel", value: `<#${message.channelId}>`, inline: true },
        { name: "Content", value: message.content || "No content (embed or attachment)".slice(0, 1024), inline: false }
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