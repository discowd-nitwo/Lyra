import { CommandEvent } from "@utils/CommandEvent";
import { Category, ICommand } from "@/types";
import { getLogger } from "@utils/logger";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";

const logger = getLogger("panic");

const command: ICommand = {
  name: "panic",
  description: "Kill the bot",
  category: Category.DEV,

  async execute(event: CommandEvent): Promise<void> {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("panic_yes")
        .setLabel("Yes, kill it")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("panic_no")
        .setLabel("No")
        .setStyle(ButtonStyle.Danger),
    );

    const reply = await event.replyWithComponents(
      "⚠️ Are you sure you want to kill the bot?",
      [row],
    );

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (i) =>
        i.user.id === (event.interaction?.user.id ?? event.message?.author.id),
      time: 15_000,
      max: 1,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "panic_yes") {
        await i.update({ content: "💀 Killing the bot.", components: [] });
        logger.warn(`Bot killed by ${event.getMemberName()} [${event.getMemberId()}]`);
        process.exit(1);
      } else {
        await i.update({ content: "❌ Cancelled.", components: [] });
      }
    });

    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        await reply.edit({ content: "⏱️ Timed out.", components: [] });
      }
    });
  },
};

export default command;
