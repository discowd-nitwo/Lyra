import { PresenceUpdateStatus } from "discord.js";
import { LyraEvent } from ".";
import { config } from "../config";
import { logger, versionTag } from "../utils/logger";

const event: LyraEvent = {
  name: "clientReady",
  once: true,
  async execute(client): Promise<void> {
    logger.info(`Lyra ${versionTag} is online as ${client.user?.tag}`);

    client.user?.setPresence({ activities: [{ name: `Lyra | ${config.prefix}ping | ${client.guilds.cache.size} servers` }], status: PresenceUpdateStatus.Idle })
  },
};

export default event;