import { EmbedBuilder, GuildMember } from "discord.js";
import { LyraEvent } from ".";
import { LyraClient } from "../types";
import { AuditEventType, sendAuditLog } from "../utils/auditLogger";

const event: LyraEvent = {
  name: "guildMemberAdd",
  once: false,

  async execute(client: LyraClient, member: GuildMember): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle("Member Joined")
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: "User", value: `<@${member.user.id}> (${member.user.tag})`, inline: true },
        { name: "ID", value: member.user.id, inline: true },
        { name: "Account Created", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>` },
        { name: "Member Count", value: member.guild.memberCount.toString(), inline: true }
      );

    await sendAuditLog(client, {
      guildId: member.guild.id,
      eventType: AuditEventType.MEMBER_JOIN,
      embed,
      userId: member.user.id
    })
  },
};

export default event;