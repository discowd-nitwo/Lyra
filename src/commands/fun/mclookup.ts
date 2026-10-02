import axios from "axios";
import {Category, ICommand} from "@/types";
import {CommandEvent} from "@utils/CommandEvent";
import {formatUUID} from "@utils/format";
import {baseEmbedV2} from "@utils/embed";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  inlineCode,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SlashCommandBuilder,
  TextDisplayBuilder
} from "discord.js";

const command: ICommand = {
  name: "mclookup",
  description: "Look up a Minecraft: Java Edition account's name and skin download.",
  category: Category.FUN,
  aliases: [],

  async execute(event: CommandEvent) {
    const username = event.isSlashCommand()
        ? event.interaction?.options.getString("username", true)
        : event.args?.[0];

    if (!username) {
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

    const componentsV2Section = new SectionBuilder().addTextDisplayComponents(text =>
        text.setContent(`# ${uuidReq.data.name}\n`+
        `**UUID**: ${inlineCode(formattedUuid)}\n` +
        `**Stripped UUID**: ${inlineCode(uuid)}\n`
    )).setThumbnailAccessory(
        (thumbnail) =>
            thumbnail.setURL(`https://api.mineatar.io/face/${uuid}?scale=50`)
    )

    const NameMCButton = new ButtonBuilder()
        .setURL(`https://namemc.com/profile/${uuid}`)
        .setLabel("NameMC Profile")
        .setStyle(ButtonStyle.Link)
        .setEmoji({ id: "1555518312895615016" });
    const skinButton = new ButtonBuilder()
        .setURL(`https://mineskin.eu/skin/${uuidReq.data.name}`)
        .setLabel("Direct skin download")
        .setStyle(ButtonStyle.Link)
        .setEmoji({ id: "1555519291720204288" });

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(NameMCButton, skinButton)

    const separator = new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)

    const footer = new TextDisplayBuilder().setContent(`-# Lyra Bot • <t:${Math.floor(Date.now() / 1000)}:R>`)

    const container = baseEmbedV2()
        .addSectionComponents(componentsV2Section)
        .addActionRowComponents(actionRow)
        .addSeparatorComponents(separator)
        .addTextDisplayComponents(footer)

    await event.replyWithComponentsV2(container);
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
