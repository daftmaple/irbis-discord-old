import Discord from 'discord.js';

import { MessageFunction } from '../types/message';
import { BotConfig } from '../utils/config';

const role: MessageFunction = async (
  message: Discord.Message,
  user: Discord.User,
  args: string[]
) => {
  const roles = BotConfig.assignableRoles;
  message.channel.send('Not set yet');
};

export const roleHandler = { role };
