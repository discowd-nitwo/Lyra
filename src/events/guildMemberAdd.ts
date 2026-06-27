import { EmbedBuilder, Events, GuildMember, inlineCode } from "discord.js";
import { LyraEvent } from ".";
import { LyraClient } from "../types";
import { AuditEventType, sendAuditLog } from "@utils/auditLogger";

const event: LyraEvent = {
  name: Events.GuildMemberAdd,
  once: false,

  async execute(client: LyraClient, member: GuildMember): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle("User Joined")
      .setThumbnail(member.user.displayAvatarURL())
      .setDescription(`> **User**: @${member.user.username} (<@${member.user.id}>)\n> **ID:** ${inlineCode(member.user.id)}\n> **Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>\n> **Members:** ${member.guild.memberCount}`)
      .setTimestamp();
      
    await sendAuditLog(client, {
      guildId: member.guild.id,
      eventType: AuditEventType.MEMBER_JOIN,
      embed,
      userId: member.user.id
    })
  },
};

export default event;