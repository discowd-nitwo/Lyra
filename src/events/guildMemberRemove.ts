import { GuildMember, PartialGuildMember, EmbedBuilder } from "discord.js";
import { LyraEvent } from "./index";
import { LyraClient } from "../types";
import { sendAuditLog, AuditEventType } from "../utils/auditLogger";

const event: LyraEvent = {
  name: "guildMemberRemove",
  once: false,

  async execute(client: LyraClient, member: GuildMember | PartialGuildMember): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle("Member Left")
      .setThumbnail(member.user?.displayAvatarURL() ?? null)
      .addFields(
        { name: "User", value: `<@${member.user?.id}> (${member.user?.tag ?? "Unknown"})`, inline: true },
        { name: "ID", value: member.user?.id ?? "Unknown", inline: true },
        { name: "Joined At", value: member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : "Unknown", inline: true },
        { name: "Member Count", value: member.guild.memberCount.toString(), inline: true }
      );

    await sendAuditLog(client, {
      guildId: member.guild.id,
      eventType: AuditEventType.MEMBER_LEAVE,
      embed,
      userId: member.user?.id,
    });
  },
};

export default event;