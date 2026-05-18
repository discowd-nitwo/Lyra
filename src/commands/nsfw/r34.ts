import { Message, SlashCommandBuilder } from "discord.js";
import { ICommand, Category } from "../../types";
import { CommandEvent } from "../../utils/CommandEvent";
import { baseEmbed, errorEmbed } from "../../utils/embed";
import { t } from "../../utils/i18n";
import { fetchPosts } from "../../notifiers/danbooru";
import { randomElement } from "../../utils/random";
import { config } from "../../config";

const BANNED_TAGS = [
  "loli", "child", "children", "kid", "underaged",
  "underage", "young", "petite", "toddler", "todler",
  "baby", "cub"
];

function containsBannedTags(tags: string): boolean {
  const normalized = tags
    .toLowerCase()
    .replace(/1/g, "i")
    .replace(/0/g, "o")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t");

  return BANNED_TAGS.some((tag) => normalized.includes(tag));
}

const command: ICommand = {
  name: "r34",
  description: t("command.description.rule34"),
  category: Category.NSFW,
  aliases: ["rule34", "34"],
  nsfwOnly: true,

  async execute(event: CommandEvent): Promise<void> {
    if (!event.isNSFWChannel()) {
      await event.reply(errorEmbed(t("message.default.onlyNSFW")), 5);
      return;
    }

    const tags = event.isSlashCommand()
      ? event.interaction?.options.getString("tags") ?? ""
      : event.args?.join(" ") ?? "";

    if (tags && containsBannedTags(tags)) {
      await event.reply(errorEmbed(t("message.nsfw.notAllowed")), 5);
      return;
    }

    let searchingMessage: Message | undefined;
    if (event.isSlashCommand() && event.interaction) {
      await event.interaction.reply({ content: t("message.nsfw.searching") })
      searchingMessage = await event.interaction.fetchReply() as Message;
    } else if (event.message) {
      searchingMessage = await event.message.reply({ content: t("message.nsfw.searching") });
    }

    const posts = await fetchPosts(tags || undefined);

    await searchingMessage?.delete().catch(() => null)

    if (!posts.length) {
      await event.reply(errorEmbed(t("message.default.retrievalError")), 5);
      return;
    }

    const post = randomElement(posts);

    const embed = baseEmbed()
      .setImage(post.url)
      .setFooter({
        text: `${event.getMemberName()} - ${config.advertisement}`,
        iconURL: event.getMemberAvatarUrl(),
      });

    await event.reply(embed);
  },

  getSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("r34")
      .setDescription(t("command.description.rule34"))
      .addStringOption((option) =>
        option
          .setName("tags")
          .setDescription("Tags to search for")
          .setRequired(false)
      ) as SlashCommandBuilder;
  },
};

export default command;