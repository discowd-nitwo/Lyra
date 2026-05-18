import { ColorResolvable, EmbedBuilder, TextChannel } from "discord.js";
import { LyraClient } from "../types";
import { logger } from "./logger";
import prisma from "../database";

export enum AuditEventType {
  MEMBER_JOIN = "MEMBER_JOIN",
  MEMBER_LEAVE = "MEMBER_LEAVE",
  MEMBER_BAN = "MEMBER_BAN",
  MEMBER_UNBAN = "MEMBER_UNBAN",
  MESSAGE_DELETE = "MESSAGE_DELETE",
  MESSAGE_UPDATE = "MESSAGE_UPDATE",
}

const EVENT_COLOURS: Record<AuditEventType, ColorResolvable> = {
  [AuditEventType.MEMBER_JOIN] : 0x57f287,      // green
  [AuditEventType.MEMBER_BAN] : 0xed4245,       // red
  [AuditEventType.MEMBER_UNBAN] : 0x57f287,     // green
  [AuditEventType.MEMBER_LEAVE] : 0xfee75c,     // yellow
  [AuditEventType.MESSAGE_DELETE] : 0xed4245,   // red
  [AuditEventType.MESSAGE_UPDATE] : 0xfee75c,   // yellow
};

interface AuditLogOptions {
  guildId: string;
  eventType: AuditEventType;
  embed: EmbedBuilder;
  userId?: string;
  targetId?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export async function sendAuditLog(
  client: LyraClient,
  options: AuditLogOptions
): Promise<void> {
  try {
    const config = await prisma.guildConfig.findUnique({
      where: { guildId: options.guildId },
    });

    if (!config?.auditLogEnabled || !config.auditLogChannel) return;

    const channel = await client.channels.fetch(config.auditLogChannel);

    if (!channel || !(channel instanceof TextChannel)) return;

    options.embed.setColor(EVENT_COLOURS[options.eventType]);
    options.embed.setTimestamp();

    await channel.send({ embeds: [options.embed] });

    await prisma.auditLogEvent.create({
      data: {
        guildId: options.guildId,
        eventType: options.eventType,
        userId: options.userId,
        targetId: options.targetId,
        reason: options.reason,
        metadata: options.metadata ? JSON.stringify(options.metadata) : null,
      },
    });
  } catch (err) {
    logger.error(`Failed to send audit log: ${err}`)
  }
}