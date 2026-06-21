import { codeBlock, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Category, ICommand } from "../../types";
import { errorEmbed, infoEmbed } from "../../utils/embed";
import { t } from "../../utils/i18n";
import { CommandEvent } from "../../utils/CommandEvent";
import axios from "axios";
import { logger } from "../../utils/logger";
import { config } from "../../config";

const command: ICommand = {
  name: "fact",
  description: t("command.description.fact"),
  category: Category.FUN,
  aliases: ["funfact"],

  async execute(event: CommandEvent): Promise<void> {
    const apiUrl = `https://api.api-ninjas.com/v1/facts`;

    axios
      .get(apiUrl, {
        headers: {
          "X-Api-Key": process.env.api_ninja_key,
        },
      })
      .then((response) => {
        const embed = new EmbedBuilder()
          .setColor(config.mainColour)
          .setTitle("Random Fact")
          .setDescription(codeBlock(response.data[0].fact))
          .setTimestamp();
        event.reply(embed);
      })
      .catch(async (error) => {
        if (error.response) {
          logger.error("Error:", error.response.status, error.response.data);
          event.reply(errorEmbed(error.response.data));
        } else {
          logger.error("Request failed:", error.message);
          event.reply(errorEmbed(error.message));
        }
      });
  },

  getSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("fact")
      .setDescription(t("command.description.fact")) as SlashCommandBuilder;
  },
};

export default command;
