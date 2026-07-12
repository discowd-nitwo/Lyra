import {
  ChatInputCommandInteraction,
  Message,
  InteractionResponse,
  EmbedBuilder,
  TextChannel,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ContainerBuilder,
  MessageFlags,
} from "discord.js";
import { LyraClient, ICommandEvent, IReplyOptions } from "../types";

export class CommandEvent implements ICommandEvent {
  client: LyraClient;
  interaction?: ChatInputCommandInteraction;
  message?: Message;
  args?: string[];

  constructor(
    client: LyraClient,
    interactionOrMessage: ChatInputCommandInteraction | Message,
    args?: string[],
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
      (this.message?.channel.type === ChannelType.GuildText &&
        (this.message?.channel as TextChannel).nsfw) ??
      false
    );
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

  getMemberId(): string {
    if (this.interaction) {
      return this.interaction.member?.user.id ?? "Unknown";
    }
    return this.message?.author.id ?? "Unknown";
  }

  async replyWithComponents(
    content: string,
    components: ActionRowBuilder<ButtonBuilder>[],
  ): Promise<Message> {
    if (this.interaction) {
      await this.interaction.reply({ content, components });
      return this.interaction.fetchReply() as Promise<Message>;
    } else {
      return this.message!.reply({ content, components });
    }
  }

  async replyWithComponentsV2(
    components: ContainerBuilder,
  ): Promise<Message> {
    if (this.interaction) {
      await this.interaction.reply({
        components: [components],
        flags: [MessageFlags.IsComponentsV2],
      });
      return this.interaction.fetchReply() as Promise<Message>;
    } else {
      return this.message!.reply({
        components: [components],
        flags: [MessageFlags.IsComponentsV2],
      });
    }
  }

  async reply(
    content: string | EmbedBuilder | IReplyOptions,
    deleteAfter?: number,
  ): Promise<void> {
    let response: Message | InteractionResponse | undefined;

    let options: IReplyOptions;
    if (typeof content === "string") {
      options = { content, deleteAfter };
    } else if (content instanceof EmbedBuilder) {
      options = { embed: content, deleteAfter };
    } else {
      options = content;
    }

    const payload = {
      ...(options.content && { content: options.content }),
      ...(options.embed && { embeds: [options.embed] }),
      ...(options.files && { files: options.files }),
    };

    if (this.isSlashCommand() && this.interaction) {
      response = await this.interaction.reply(payload);
      response = (await this.interaction.fetchReply()) as Message;
    } else if (this.message) {
      response = await this.message.reply(payload);
    }

    const delay = options.deleteAfter ?? deleteAfter;
    if (delay && response) {
      setTimeout(async () => {
        try {
          if (response instanceof Message) {
            await response.delete();
          }
        } catch {
          // Message may have already been deleted
        }
      }, delay * 1000);
    }
  }
}
