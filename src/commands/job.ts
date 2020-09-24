import Discord from 'discord.js';
import { container } from 'tsyringe';

import { MessageFunction } from '../types/message';
import { Repository } from '../repository';
import { MessageError } from '../types/error';

const job: MessageFunction = async (
  message: Discord.Message,
  user: Discord.User,
  args: string[]
) => {
  const firstArg = args.shift();

  if (!firstArg) {
    message.channel.send(
      `Missing argument for command: create/list/cancel/help`
    );
    return;
  }

  const mapper = new Map<string, MessageFunction>(
    Object.entries({
      create: create,
      cancel: cancel,
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

const create: MessageFunction = (
  message: Discord.Message,
  user: Discord.User,
  args: string[]
): void => {
  const repo = container.resolve(Repository);
  try {
    repo.createJob(user.id, args, message);
  } catch (e) {
    if (e instanceof MessageError) throw e;
  }
};

const cancel: MessageFunction = (
  message: Discord.Message,
  user: Discord.User,
  args: string[]
): void => {
  const repo = container.resolve(Repository);
  try {
    repo.cancelJob(user.id, args, message);
  } catch (e) {
    if (e instanceof MessageError) throw e;
  }
};

const list: MessageFunction = (
  message: Discord.Message,
  user: Discord.User
): void => {
  const repo = container.resolve(Repository);
  try {
    repo.listJob(user.id, message);
  } catch (e) {
    if (e instanceof MessageError) throw e;
  }
};

const help: MessageFunction = (message: Discord.Message): void => {
  const opts = [
    '-m (message)',
    '-t (time)',
    '-c (channel)',
    '-s (silent)',
    '-d (delete)',
    '-i (self)',
    '-e (everyone)',
    '-u (user)',
  ];

  const embed = new Discord.MessageEmbed();
  embed.setTitle('Args for command `job`:');

  embed.addFields([
    { name: 'create', value: 'Create a job. Options:\n' + opts.join('\n') },
    { name: 'cancel', value: 'Cancel currently running job' },
    { name: 'list', value: 'List all of your currently running job' },
  ]);
  message.channel.send(embed);
};

const jobHandler = { job };

export { jobHandler };
