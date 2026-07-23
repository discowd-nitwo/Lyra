import { ColorResolvable, ContainerBuilder, EmbedBuilder } from "discord.js";
import { config } from "@/config";

export function baseEmbed(): EmbedBuilder {
  return new EmbedBuilder().setColor(config.mainColour as ColorResolvable);
}

export function baseEmbedV2(): ContainerBuilder {
  return new ContainerBuilder().setAccentColor(config.mainColour as number);
}

export function successEmbed(description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor("Green")
    .setDescription(`✅ ${description}`);
}

export function errorEmbed(description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor("Red")
    .setDescription(`❌ ${description}`);
}

export function warnEmbed(description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor("Yellow")
    .setDescription(`⚠️ ${description}`);
}

export function infoEmbed(description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(config.mainColour as ColorResolvable)
    .setDescription(`ℹ️ ${description}`)
}

export function embedWithPrefix(prefix: string, description: string, colour?: ColorResolvable): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(colour ?? config.mainColour as ColorResolvable)
    .setDescription(`${prefix} ${description}`)
}