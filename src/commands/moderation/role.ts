import {GuildMember, PermissionFlagsBits, Role, roleMention, SlashCommandBuilder, User} from "discord.js";
import { Category, ICommand } from "@/types";
import { CommandEvent } from "@utils/CommandEvent";
import { t } from "@utils/i18n";
import {embedWithPrefix, errorEmbed} from "@utils/embed";
import {logger} from "@utils/logger";

const command: ICommand = {
    name: "role",
    description: t("command.description.role"),
    category: Category.MODERATION,
    aliases: [],
    guildOnly: true,

    async execute(event: CommandEvent): Promise<void> {
        let user: User | null = null;
        let role: Role | null = null;
        let member: GuildMember | null = null;

        const guild = event.isSlashCommand()
            ? event.interaction?.guild
            : event.message?.guild;

        const isSlash = event.isSlashCommand();

        const executor = (event.interaction?.member ?? event.message?.member) as GuildMember | null;
        if (!executor?.permissions.has(PermissionFlagsBits.ManageRoles)) {
            await event.reply(errorEmbed(t("message.default.noPermission")));
            return;
        }

        if (isSlash) {
            user = event.interaction?.options.getUser("target") ?? event.interaction?.user ?? null;
            role = event.interaction?.options.getRole("role", true) as Role ?? null;
        } else {
            const [userArg, roleArg] = event.args ?? [];

            const userId = userArg?.replace(/[<@!>]/g, "");
            if (userId && /^\d+$/.test(userId)) {
                user = await event.client.users.fetch(userId).catch(() => null) ?? null;
            }
            user = user ?? event.message?.author ?? null;

            const roleId = roleArg?.replace(/[<@&>]/g, "");
            if (roleId && /^\d+$/.test(roleId)) {
                role = guild?.roles.cache.get(roleId) ?? null;
            }
            if (!role && roleArg) {
                role = guild?.roles.cache.find(
                    (r) => r.name.toLowerCase() === roleArg.toLowerCase()
                ) ?? null;
            }
        }

        if (!user || !role) {
            await event.reply(errorEmbed(t("error.generic")), 5);
            return;
        }

        member = await guild?.members.fetch(user.id).catch(() => null) ?? null;

        const hasRole = member?.roles.cache.has(role.id);
        const symbol = hasRole ? "-" : "+";

        try {
            if (hasRole) {
                await member?.roles.remove(role.id)
            } else {
                await member?.roles.add(role.id)
            }
        } catch (err) {
            logger.error(err)
            await event.reply(errorEmbed(t("error.generic")));
        }

        const embed = embedWithPrefix("<:check:1533479622996656199>", `Roles updated: ${symbol} ${roleMention(role.id)}`);

        await event.reply(embed);
    },

    getSlashCommand(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName("role")
            .setDescription(t("command.description.role"))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
            .addUserOption((option) =>
                option
                    .setName("target")
                    .setDescription("The user to add the role to")
                    .setRequired(true)
            )
            .addRoleOption((option) =>
                option
                    .setName("role")
                    .setDescription("The role to add to the user")
                    .setRequired(true)
            ) as SlashCommandBuilder;
    },
};

export default command;