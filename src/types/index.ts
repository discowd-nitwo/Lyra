import { AttachmentBuilder, ChatInputCommandInteraction, Client, Collection, ColorResolvable, EmbedBuilder, Message, SlashCommandBuilder } from "discord.js";

export enum Category {
  NSFW = "nsfw",
  MODERATION = "moderation",
  FUN = "fun",
  UTILITY = "utility",
  MUSIC = "music",
  CONFIG = "config",
  DEV = "dev"
}

export interface ICommand {
  name: string;
  description: string;
  category: Category;
  aliases?: string[];
  guildOnly?: boolean;
  nsfwOnly?: boolean;
  execute(event: ICommandEvent): Promise<void>;
  getSlashCommand?(): SlashCommandBuilder;
}

export interface ICommandEvent {
  client: LyraClient;
  interaction?: ChatInputCommandInteraction;
  message?: Message;
  args?: string[];
  isSlashCommand(): boolean;
  reply(content: string | object, deleteAfter?: number): void; 
}

export interface LyraClient extends Client {
  commands: Collection<string, ICommand>;
  aliases: Collection<string, string>;
}

export interface LyraConfig {
  mainColour: ColorResolvable;
  prefix: string;
  advertisement: string;
  version: string;
  ownerId: string;
  masterGuildId: string | null;
  adminRoleId: string | null;
}

export interface Rule34Post {
  id: number;
  url: string;
  tags: string;
  score: number;
  rating: string;
}

export interface IReplyOptions {
  embed?: EmbedBuilder;
  content?: string;
  files?: AttachmentBuilder[];
  deleteAfter?: number;
}