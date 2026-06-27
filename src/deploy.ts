import { REST, Routes } from "discord.js";
import { readdirSync, statSync } from "fs";
import { join } from "path";
import { ICommand } from "./types";
import * as dotenv from "dotenv";
import { loadLocale } from "@utils/i18n";

dotenv.config();

async function deploy(): Promise<void> {
  await loadLocale();

  const commands = [];
  const categoriesPath = join(__dirname, "commands");

  const categories = readdirSync(categoriesPath).filter((item) =>
    statSync(join(categoriesPath, item)).isDirectory()
  );

  for (const category of categories) {
    const categoryPath = join(categoriesPath, category);
    const commandFiles = readdirSync(categoryPath).filter(
      (file) => file.endsWith(".ts") || file.endsWith(".js")
    );

    for (const file of commandFiles) {
      const commandModule = await import(join(categoryPath, file));
      const command: ICommand = commandModule.default;

      if (command?.getSlashCommand) {
        commands.push(command.getSlashCommand().toJSON());
        console.log(`Registered slash command: ${command.name}`);
      }
    }
  }

  const rest = new REST({ version: "10" }).setToken(
    process.env.DISCORD_TOKEN!
  );

  console.log(`Deploying ${commands.length} slash commands...`);

  await rest.put(
    Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
    { body: commands }
  );

  console.log("Slash commands deployed successfully!");
}

deploy().catch(console.error);