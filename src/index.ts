import { Client, Collection, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
import { ICommand, LyraClient } from "./types";
import { logger, printBanner } from "./utils/logger";
import { loadCommands } from "./commands";
import { loadEvents } from "./events";
import { loadLocale } from "./utils/i18n";
import prisma from "./database";

dotenv.config({ quiet: true });

async function bootstrap(): Promise<void> {
  printBanner();

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.MessageContent
    ],
  }) as LyraClient;

  client.commands = new Collection<string, ICommand>();
  client.aliases = new Collection<string, string>();

  await loadLocale();

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

process.on("SIGNINT", async () => {
  await prisma.$disconnect();
  logger.info("Disconnected from database")
  process.exit(0)
})