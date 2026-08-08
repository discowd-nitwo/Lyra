import { SlashCommandBuilder } from "discord.js";
import { Category, ICommand } from "@/types";
import { baseEmbedV2 } from "@utils/embed";
import { t } from "@utils/i18n";
import { CommandEvent } from "@utils/CommandEvent";

const command: ICommand = {
    name: "coinflip",
    description: t("command.description.coinflip"),
    category: Category.FUN,
    aliases: ["cf", "flip", "coinf"],


    async execute(event: CommandEvent): Promise<void> {

        const result = Math.random() < 0.5 ? "Heads" : "Tails";

        const container = baseEmbedV2().addTextDisplayComponents(text => text.setContent(`# 🪙 Coin Flip\n`+
            `**Result**\n`+
            `${result}`
        ));

        await event.replyWithComponentsV2(container);
    },

    getSlashCommand(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName("coinflip")
            .setDescription(t("command.description.coinflip")) as SlashCommandBuilder;
    },
};

export default command;
