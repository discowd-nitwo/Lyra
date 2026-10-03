import "./instrument";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import { ICommand, LyraClient } from "./types";
import { printBanner, getLogger } from "@utils/logger";
import { loadCommands } from "./commands";
import { loadEvents } from "./events";
import { loadLocale } from "@utils/i18n";
import prisma from "./database";

const logger = getLogger("Lyra")

async function bootstrap(): Promise<void> {
  printBanner();

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildModeration
    ],
  }) as LyraClient;

  client.commands = new Collection<string, ICommand>();
  client.aliases = new Collection<string, string>();

  await loadLocale();

  logger.info("Attempting to connect to the database")
  await prisma.$connect();
  logger.info("Connected to database");

  await loadCommands(client);

  await loadEvents(client);

  client.login(process.env.DISCORD_TOKEN).catch((err) => {
    logger.error(`Failed to login: ${err}`);
    process.exit(1);
  })
}

bootstrap().catch((err) => {
  logger.error(`Failed to bootstrap Lyra: ${err}`);
  process.exit(1);
})

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  logger.info("Disconnected from database")
  process.exit(0)
})