import Discord from 'discord.js';

export type MessageFunction = (
  message: Discord.Message,
  user: Discord.User,
  args: string[]
) => void;
