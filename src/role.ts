import Discord from 'discord.js';
import { BotConfig } from './utils/config';

export const autorole = (
  member: Discord.GuildMember | Discord.PartialGuildMember
) => {
  const roles = BotConfig.autorole;
  const discordRoles = roles
    .map((i) => member.guild?.roles.cache.get(i))
    .filter((i) => !!i) as Discord.Role[];

  discordRoles.forEach((role) => {
    member.roles.add(role);
  });
};
