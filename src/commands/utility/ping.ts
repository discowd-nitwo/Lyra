import { SlashCommandBuilder } from "discord.js";
import { Category, ICommand, CommandEvent } from "../../types";
import { infoEmbed } from "../../utils/embed";
import { t } from "../../utils/i18n";

const command: ICommand = {
  name: "ping",
  description: t("command.description.ping"),
  category: Category.UTILITY,
  aliases: ["latency"],

  async execute(event: CommandEvent): Promise<void> {
    const latency = event.client.ws.ping;

    const embed = infoEmbed(
      t("message.ping.response", { latency: latency.toString() })
    );

    await event.reply(embed);
  },

  getSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("ping")
      .setDescription(t("command.description.ping")) as SlashCommandBuilder;
  },
};

export default command;