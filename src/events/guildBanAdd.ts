import { EmbedBuilder, GuildBan } from "discord.js";
import { LyraEvent } from ".";
import { LyraClient } from "../types";
import { AuditEventType, sendAuditLog } from "../utils/auditLogger";

const event: LyraEvent = {
  name: "guildBanAdd",
  once: false,

  async execute(client: LyraClient, ban: GuildBan): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle("Member Banned")
      .setThumbnail(ban.user.displayAvatarURL())
      .addFields(
        { name: "User", value: `<@${ban.user.id}> (${ban.user.tag})`, inline: true },
        { name: "ID", value: ban.user.id, inline: true },
        { name: "Reason", value: ban.reason ?? "No reason provided", inline: false }
      );


    await sendAuditLog(client, {
      guildId: ban.guild.id,
      eventType: AuditEventType.MEMBER_BAN,
      embed,
      targetId: ban.user.id,
      reason: ban.reason ?? undefined,
    });
  },
};

export default event;