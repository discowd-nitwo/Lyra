import { AuditLogEvent, EmbedBuilder, Events, GuildBan } from "discord.js";
import { LyraEvent } from ".";
import { LyraClient } from "../types";
import { AuditEventType, sendAuditLog } from "@utils/auditLogger";

const event: LyraEvent = {
  name: Events.GuildBanRemove,
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
      .setTitle("Member Unbanned")
      .setThumbnail(ban.user.displayAvatarURL())
      .addFields(
        { name: "User", value: `<@${ban.user.id}> (${ban.user.tag})`, inline: true },
        { name: "ID", value: ban.user.id, inline: true }
      )
      .setFooter({ text: footerText, iconURL: moderator?.displayAvatarURL() });

    await sendAuditLog(client, {
      guildId: ban.guild.id,
      eventType: AuditEventType.MEMBER_UNBAN,
      embed,
      userId: moderator?.id,
      targetId: ban.user.id,
    });
  },
};

export default event;