import { inlineCode, SlashCommandBuilder } from "discord.js";
import * as os from "os";
import { config } from "../../config";
import { Category, ICommand } from "../../types";
import { CommandEvent } from "../../utils/CommandEvent";
import { baseEmbed } from "../../utils/embed";
import { formatUptime } from "../../utils/formatUptime";
import { versionTag } from "../../utils/logger";
import packageInfo from "../../../package.json";

const formatBytes = (bytes: number): string => {
  const gb = bytes / 1024 ** 3;
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  const mb = bytes / 1024 ** 2;
  return `${mb.toFixed(2)} MB`;
};

const command: ICommand = {
  name: "debuginfo",
  description: "debug info",
  category: Category.DEV,
  aliases: ["dinfo"],

  async execute(event: CommandEvent): Promise<void> {
    const client = event.client;
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const cpus = os.cpus();

    const embed = baseEmbed()
      .setTitle("Debug Information")
      .setThumbnail(client.user?.displayAvatarURL({ size: 1024 }) || null)
      .addFields(
        // Bot
        {
          name: "Bot",
          value: [
            `Tag: ${inlineCode(client.user?.tag ?? "Unknown")}`,
            `ID: ${inlineCode(client.user?.id ?? "Unknown")}`,
            `Version: ${inlineCode(versionTag)}`,
            `Uptime: ${inlineCode(formatUptime(process.uptime() * 1000))}`,
            `Guilds: ${inlineCode(client.guilds.cache.size.toString())}`,
            `Users: ${inlineCode(client.users.cache.size.toString())}`,
            `Channels: ${inlineCode(client.channels.cache.size.toString())}`,
            `Cached Messages: ${inlineCode(client.sweepers ? "enabled" : "disabled")}`,
            `Ping: ${inlineCode(`${client.ws.ping}ms`)}`,
            `Shard: ${inlineCode(client.shard ? client.shard.ids.join(", ") : "none")}`,
          ].join("\n"),
          inline: false,
        },
        // Process
        {
          name: "Process",
          value: [
            `PID: ${inlineCode(process.pid.toString())}`,
            `Node.js: ${inlineCode(process.version)}`,
            `V8: ${inlineCode(process.versions.v8)}`,
            `OpenSSL: ${inlineCode(process.versions.openssl)}`,
            `Platform: ${inlineCode(`${process.platform} (${process.arch})`)}`,
            `Heap Used: ${inlineCode(formatBytes(memUsage.heapUsed))}`,
            `Heap Total: ${inlineCode(formatBytes(memUsage.heapTotal))}`,
            `RSS: ${inlineCode(formatBytes(memUsage.rss))}`,
            `External: ${inlineCode(formatBytes(memUsage.external))}`,
          ].join("\n"),
          inline: false,
        },
        // System
        {
          name: "System",
          value: [
            `Hostname: ${inlineCode(os.hostname())}`,
            `OS: ${inlineCode(`${os.type()} ${os.release()}`)}`,
            `CPU: ${inlineCode(cpus[0]?.model ?? "Unknown")}`,
            `CPU Cores: ${inlineCode(cpus.length.toString())}`,
            `CPU Speed: ${inlineCode(`${cpus[0]?.speed ?? 0} MHz`)}`,
            `Load Avg: ${inlineCode(os.loadavg().map(n => n.toFixed(2)).join(", "))}`,
            `System Uptime: ${inlineCode(formatUptime(os.uptime() * 1000))}`,
            `Total Memory: ${inlineCode(formatBytes(totalMem))}`,
            `Used Memory: ${inlineCode(formatBytes(usedMem))}`,
            `Free Memory: ${inlineCode(formatBytes(freeMem))}`,
          ].join("\n"),
          inline: false,
        },
        // Dependencies
        {
          name: "Dependencies",
          value: [
            `discord.js: ${inlineCode(packageInfo.dependencies["discord.js"] ?? "Unknown")}`,
            `TypeScript: ${inlineCode((packageInfo.devDependencies as Record<string, string>)["typescript"] ?? "Unknown")}`,
          ].join("\n"),
          inline: false,
        },
        // Contributors
        {
          name: "Contributors",
          value: [
            "<@931938914959228948>",
            "<@1511705313651462248>",
            "<@933424626976047156>",
            "<@1220832158139027526>",
          ].join("\n"),
          inline: false,
        },
      )
      .setFooter({
        text: `${event.getMemberName()} - ${config.advertisement}`,
        iconURL: event.getMemberAvatarUrl(),
      });

    await event.reply(embed);
  },

  getSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("debuginfo")
      .setDescription("Shows bot debug information");
  },
};

export default command;