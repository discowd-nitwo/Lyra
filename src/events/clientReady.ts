import { LyraEvent } from ".";
import { config } from "../config";
import { logger } from "../utils/logger";

const event: LyraEvent = {
  name: "clientReady",
  once: true,
  async execute(client): Promise<void> {
    logger.info(`Lyra v${config.version} is online as ${client.user?.tag}`);
  },
};

export default event;