import { AuditLogEvent, EmbedBuilder, Events, GuildBan } from "discord.js";
import { LyraEvent } from ".";
import { LyraClient } from "../types";
import { AuditEventType, sendAuditLog } from "../utils/auditLogger";

const event: LyraEvent = {
  name: Events.GuildBanAdd,
  once: false,

  async execute(client: LyraClient, ban: GuildBan): Promise<void> {

    await new Promise(r => setTimeout(r, 500));
    
    const auditLogs = await ban.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberBanAdd,
    }).catch(() => null);

    const entry = auditLogs?.entries.first()
    const moderator = entry?.executor;

    const footerText = moderator
      ? `@${moderator.username}`
      : `@Unknown`

    const embed = new EmbedBuilder()
      .setTitle("Member Banned")
      .setThumbnail(ban.user.displayAvatarURL())
      .addFields(
        { name: "User", value: `<@${ban.user.id}> (${ban.user.tag})`, inline: true },
        { name: "ID", value: ban.user.id, inline: true },
        { name: "Reason", value: ban.reason ?? "No reason provided", inline: false }
      )
      .setFooter({ text: footerText, iconURL: moderator?.displayAvatarURL()});


    await sendAuditLog(client, {
      guildId: ban.guild.id,
      eventType: AuditEventType.MEMBER_BAN,
      embed,
      targetId: ban.user.id,
      userId: moderator?.id,
      reason: ban.reason ?? undefined,
    });
  },
};

export default event;