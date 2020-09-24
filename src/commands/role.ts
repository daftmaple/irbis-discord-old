import Discord from 'discord.js';

import { MessageFunction } from '../types/message';
import { BotConfig } from '../utils/config';

const role: MessageFunction = async (
  message: Discord.Message,
  user: Discord.User,
  args: string[]
) => {
  const firstArg = args.shift();

  if (!firstArg) {
    message.channel.send(`Missing argument for command: add/remove/help`);
    return;
  }

  const mapper = new Map<string, MessageFunction>(
    Object.entries({
      add: add,
      remove: remove,
      list: list,
      help: help,
    })
  );

  const func = mapper.get(firstArg);
  if (func) func(message, user, args);
  else {
    message.channel.send(
      `Invalid argument \`${firstArg}\`. Valid arguments: \`${Array.from(
        mapper.keys()
      ).join(', ')}\``
    );
  }
};

const add: MessageFunction = (
  message: Discord.Message,
  user: Discord.User,
  args: string[]
): void => {
  const roleName = args.shift();

  if (!roleName) {
    message.channel.send(`Missing role to add`);
    return;
  }

  const roles = BotConfig.assignableRoles;
  const roleToAdd = roles.find((i) => i.name === roleName);

  if (!roleToAdd) {
    message.channel.send(`Invalid role \`${roleName}\``);
  } else {
    try {
      const discordRole = message.guild?.roles.cache.get(roleToAdd.id);
      if (!discordRole) {
        message.channel.send(`Unable to resolve role`);
      } else {
        message.member?.roles.add(discordRole);
        message.channel.send(`Role ${roleName} added`);
      }
    } catch (e) {
      message.channel.send(`Unable to resolve role`);
    }
  }
};

const remove: MessageFunction = (
  message: Discord.Message,
  user: Discord.User,
  args: string[]
): void => {
  const roleName = args.shift();

  if (!roleName) {
    message.channel.send(`Missing role to remove`);
    return;
  }

  const roles = BotConfig.assignableRoles;
  const roleToRemove = roles.find((i) => i.name === roleName);

  if (!roleToRemove) {
    message.channel.send(`Invalid role \`${roleName}\``);
  } else {
    try {
      const discordRole = message.guild?.roles.cache.get(roleToRemove.id);
      if (!discordRole) {
        message.channel.send(`Unable to resolve role`);
      } else {
        message.member?.roles.remove(discordRole);
        message.channel.send(`Role ${roleName} removed`);
      }
    } catch (e) {
      message.channel.send(`Unable to resolve role`);
    }
  }
};

const list: MessageFunction = (message: Discord.Message): void => {
  const embed = new Discord.MessageEmbed();
  // embed.setTitle('Available roles: ');

  const roles = BotConfig.assignableRoles;
  embed.addField(
    'Available roles: ',
    roles.map((i) => `\`${i.name}\``).join('\n')
  );
  message.channel.send(embed);
};

const help: MessageFunction = (message: Discord.Message): void => {
  const embed = new Discord.MessageEmbed();
  embed.setTitle('Args for command `role`:');

  embed.addFields([
    { name: 'add <role_name>', value: 'Add role' },
    { name: 'remove <role_name>', value: 'Remove role' },
    { name: 'list', value: 'Lists all available roles' },
    { name: 'help', value: 'This help embed' },
  ]);
  message.channel.send(embed);
};

export const roleHandler = { role };
