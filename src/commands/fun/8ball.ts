import { SlashCommandBuilder } from "discord.js";
import { Category, ICommand } from "../../types";
import { baseEmbedV2 } from "@utils/embed";
import { t } from "@utils/i18n";
import { CommandEvent } from "@utils/CommandEvent";

const EIGHT_BALL_RESPONSES = [
  // Affirmative
  "It is certain.",
  "It is decidedly so.",
  "Without a doubt.",
  "Yes, definitely.",
  "You may rely on it.",
  "As I see it, yes.",
  "Most likely.",
  "Outlook good.",
  "Yes.",
  "Signs point to yes.",

  // Non-committal
  "Reply hazy, try again.",
  "Ask again later.",
  "Better not tell you now.",
  "Cannot predict now.",
  "Concentrate and ask again.",

  // Negative
  "Don't count on it.",
  "My reply is no.",
  "My sources say no.",
  "Outlook not so good.",
  "Very doubtful.",
];

const command: ICommand = {
  name: "8ball",
  description: t("command.description.8ball"),
  category: Category.FUN,
  aliases: ["magic-8ball"],

  async execute(event: CommandEvent): Promise<void> {
    const question = event.interaction!.options.getString("prompt", true)
    const reply = EIGHT_BALL_RESPONSES[Math.floor(Math.random() * EIGHT_BALL_RESPONSES.length)];

    const container = baseEmbedV2().addTextDisplayComponents(text => text.setContent(`# 🎱 8ball\n`+
        `**Question**\n`+
        `*${question + !question?.endsWith('?') ? '?' : ''}*\n\n`+
        `**Answer**\n`+
        reply
    ));

    await event.replyWithComponentsV2(container);
  },

  getSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("8ball")
      .setDescription(t("command.description.8ball")).addStringOption(
        opt => 
            opt.setName("prompt")
            .setDescription("Speak your question into the void.")
            .setRequired(true)
      ) as SlashCommandBuilder;
  },
};

export default command;
