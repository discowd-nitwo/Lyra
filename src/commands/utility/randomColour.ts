import { AttachmentBuilder, ColorResolvable, SlashCommandBuilder } from "discord.js";
import { Category, ICommand } from "@/types";
import { CommandEvent } from "@utils/CommandEvent";
import { baseEmbed } from "@utils/embed";
import { randomHex } from "@utils/random";
import { config } from "@/config";
import { t } from "@utils/i18n";
import { generateColourImage } from "@utils/colourImage";

const command: ICommand = {
  name: "randomcolour",
  description: t("command.description.randomColour"),
  category: Category.UTILITY,
  aliases: ["randomcolor", "colour", "color"],

  async execute(event: CommandEvent) {

    const colour = randomHex(3);
    const colourResolved = colour as ColorResolvable;

    const buffer = generateColourImage(colour);
    const attachment = new AttachmentBuilder(buffer, { name: `${colour}.png` });

    const embed = baseEmbed()
      .setTitle(`${colour}`)
      .setColor(colourResolved)
      .setThumbnail(`attachment://${colour}.png`)
      .setDescription(`Here's a random hex colour!\n\n[#${colour}](https://singlecolorimage.com/get/${colour}/500x500.png)`)
      .setFooter({
        text: `#${colour} - ${config.advertisement}`,
        iconURL: event.getMemberAvatarUrl()
      });

      await event.reply({ embed, files: [attachment] })
  },

  getSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("randomcolour")
      .setDescription(t("command.description.randomColour")) as SlashCommandBuilder;
  },
};

export default command;