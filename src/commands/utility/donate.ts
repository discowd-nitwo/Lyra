import { SlashCommandBuilder } from "discord.js";
import { config } from "../../config";
import { Category, ICommand } from "../../types";
import { CommandEvent } from "../../utils/CommandEvent";
import { baseEmbed } from "../../utils/embed";
import { t } from "../../utils/i18n";

const command: ICommand = {
  name: "donate",
  description: t("command.description.donate"),
  category: Category.UTILITY,
  aliases: ["tip", "support"],
  guildOnly: true,

  async execute(event: CommandEvent): Promise<void> {
    const embed = baseEmbed()
      .setTitle("Donations")
      .setDescription("Whilst we don't currently have a way to donate to us, we recommend you take that money and donate to [Alveus Sanctuary](https://www.alveussanctuary.org/).\n\n" + 
        "They do some awesome things and some of your favourite content creators may have already donated!\n\n" +
        "They also 24/7 livestream some of their animal ambassadors on [Twitch](https://www.twitch.tv/alveussanctuary)!")
      .setFooter({ 
        text: `${event.getMemberName()} - ${config.advertisement}`,
        iconURL: event.getMemberAvatarUrl() 
      });

    await event.reply(embed)
  },

  getSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("donate")
      .setDescription(t("command.description.donate")) as SlashCommandBuilder;
  },
};

export default command;