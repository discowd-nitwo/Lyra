import axios from "axios";
import { Category, ICommand } from "../../types";
import { CommandEvent } from "@utils/CommandEvent";
import { formatUUID } from "@utils/format";
import { baseEmbed } from "@utils/embed";
import { SlashCommandBuilder } from "discord.js";

const command: ICommand = {
  name: "mclookup",
  description: "Look up a Minecraft: Java Edition account's name and skin download.",
  category: Category.FUN,
  aliases: [],

  async execute(event: CommandEvent) {
    if (!event.isSlashCommand()) {
      await event.reply("We do not currently support text commands for this!", 5);
      await event.message?.react("✅")
      return;
    }

    const username = event.interaction?.options.getString("username", true);

    if (username === "") {
      await event.reply("Make sure to supply a username!");
      return;
    }

    const uuidReq = await axios.get(
      `https://api.mojang.com/minecraft/profile/lookup/name/${username}`,
      {
        headers: {
          "User-Agent": "Lyra Discord Bot/0.1.0",
        },
      },
    );

    if (!uuidReq.data.id) {
      await event.reply("Couldn't find that username!");
      return;
    }

    const uuid = uuidReq.data.id;
    const formattedUuid = formatUUID(uuid);

    const embed = baseEmbed()
      .setTitle(uuidReq.data.name)
      .setURL(`https://namemc.com/profile/${uuid}`)
      .setDescription(`**UUID**: \`${formattedUuid}\`\n**Stripped UUID**: \`${uuid}\`\n[Skin download](https://mineskin.eu/skin/${uuidReq.data.name})`)
      .setThumbnail(`https://api.mineatar.io/face/${uuid}?scale=50`)
      .setFooter({ text: "Lyra Bot", iconURL: event.client.user?.displayAvatarURL() })
      .setTimestamp();

    await event.reply(embed);
  },

  getSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("mclookup")
      .setDescription("Look up a Minecraft: Java Edition account's name and skin download.")
      .addStringOption((option) =>
        option
          .setName("username")
          .setDescription("The username to look up")
          .setRequired(true),
      ) as SlashCommandBuilder;
  },
};

export default command;
