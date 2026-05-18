import { EmbedBuilder, GuildBan } from "discord.js";
import { LyraEvent } from ".";
import { LyraClient } from "../types";
import { AuditEventType, sendAuditLog } from "../utils/auditLogger";

const event: LyraEvent = {
  name: "guildBanRemove",
  once: false,

  async execute(client: LyraClient, ban: GuildBan): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle("Member Unbanned")
      .setThumbnail(ban.user.displayAvatarURL())
      .addFields(
        { name: "User", value: `<@${ban.user.id}> (${ban.user.tag})`, inline: true },
        { name: "ID", value: ban.user.id, inline: true }
      );

    await sendAuditLog(client, {
      guildId: ban.guild.id,
      eventType: AuditEventType.MEMBER_UNBAN,
      embed,
      targetId: ban.user.id,
    });
  },
};

export default event;