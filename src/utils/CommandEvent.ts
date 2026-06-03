import {
  ChatInputCommandInteraction,
  Message,
  InteractionResponse,
  EmbedBuilder,
  TextChannel,
  ChannelType,
} from "discord.js";
import { LyraClient, ICommandEvent } from "../types";

export class CommandEvent implements ICommandEvent {
  client: LyraClient;
  interaction?: ChatInputCommandInteraction;
  message?: Message;
  args?: string[];

  constructor(
    client: LyraClient,
    interactionOrMessage: ChatInputCommandInteraction | Message,
    args?: string[]
  ) {
    this.client = client;
    this.args = args;

    if (interactionOrMessage instanceof Message) {
      this.message = interactionOrMessage;
    } else {
      this.interaction = interactionOrMessage;
    }
  }

  isSlashCommand(): boolean {
    return !!this.interaction;
  }

  isNSFWChannel(): boolean {
    if (this.interaction) {
      return (
        this.interaction.channel?.type === ChannelType.GuildText &&
        (this.interaction.channel as TextChannel).nsfw
      );
    }

    return (
      this.message?.channel.type === ChannelType.GuildText &&
      (this.message?.channel as TextChannel).nsfw
    ) ?? false;
  }

  getMemberName(): string {
    if (this.interaction) {
      return this.interaction.member?.user.username ?? "Unknown";
    }
    return this.message?.author.username ?? "Unknown";
  }

  getMemberAvatarUrl(): string {
    if (this.interaction) {
      return this.interaction.user.displayAvatarURL();
    }
    return this.message?.author.displayAvatarURL() ?? "";
  }

  async reply(
    content: string | EmbedBuilder,
    deleteAfter?: number
  ): Promise<void> {
    let response: Message | InteractionResponse | undefined;

    if (this.isSlashCommand() && this.interaction) {
      if (content instanceof EmbedBuilder) {
        response = await this.interaction.reply({ embeds: [content] });
      } else {
        response = await this.interaction.reply({ content });
      }

      response = (await this.interaction.fetchReply()) as Message;
    } else if (this.message) {
      if (content instanceof EmbedBuilder) {
        response = await this.message.reply({ embeds: [content] });
      } else {
        response = await this.message.reply({ content });
      }
    }

    if (deleteAfter && response) {
      setTimeout(async () => {
        try {
          if (response instanceof Message) {
            await response.delete();
          }
        } catch {
          // Message may have already been deleted
        }
      }, deleteAfter * 1000);
    }
  }
}