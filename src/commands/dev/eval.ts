import { CommandEvent } from "@utils/CommandEvent";
import { Category, ICommand } from "@/types";
import { getLogger } from "@utils/logger";
import { embedWithPrefix } from "@utils/embed";
import { SlashCommandBuilder } from "discord.js";
import { inspect } from "util";

const logger = getLogger("eval");

const command: ICommand = {
  name: "eval",
  description: "Evaluate JavaScript code",
  category: Category.DEV,

  async execute(event: CommandEvent): Promise<void> {
    const code = event.interaction?.options.getString("code", true);

    if (!code) {
      await event.reply("No code provided.");
      return;
    }

    let output: string;
    let isError = false;

    try {
      let result = eval(`(async () => { ${code} })()`);
      result = await result;
      output = inspect(result, { depth: 2 });
    } catch (err) {
      output = err instanceof Error ? err.message : String(err);
      isError = true;
    }

    output = output.replace(new RegExp(process.env.DISCORD_TOKEN!, "g"), "[TOKEN]");
    if (output.length > 4000) output = output.slice(0, 4000) + "\n...";

    logger.info(`Eval executed by ${event.getMemberName()} [${event.getMemberId()}]`);

    await event.reply(embedWithPrefix(
      isError ? "❌" : "✅",
      `\`\`\`js\n${output}\n\`\`\``,
      isError ? "Red" : "Green",
    ))
  },

  getSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("eval")
      .setDescription("Evaluate JavaScript code")
      .addStringOption((option) =>
        option
          .setName("code")
          .setDescription("Code to evaluate")
          .setRequired(true),
      ) as SlashCommandBuilder;
  },
};

export default command;