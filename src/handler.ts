import { singleton, container } from 'tsyringe';
import Discord from 'discord.js';

import { Repository } from './repository';
import { MessageError } from './error';

type MessageFunction = (
  user: Discord.User,
  args: string[],
  channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel
) => string | Discord.MessageEmbed;

@singleton()
export class Handler {
  private _prefix: string;
  private _command: Map<string, MessageFunction>;

  constructor() {
    this._prefix = process.env.BOT_PREFIX || 'r!';
    this._command = new Map(
      Object.entries({
        create: create,
        cancel: cancel,
        list: list,
      })
    );
  }

  public handleMessage(
    message: Discord.Message
  ): string | Discord.MessageEmbed {
    const command: string = message.content.slice(this._prefix.length).trim();

    // Split with positive single/double quote lookahead
    const args = command.split(/\s+(?=(?:(?:[^'"]*['"]){2})*[^'"]*$)/);
    const cmd = args.shift();

    if (!cmd) throw new Error();

    const user = message.author;

    let reply: string | Discord.MessageEmbed = '';
    try {
      const func = this._command.get(cmd);
      if (!!func) reply = func(user, args, message.channel);
    } catch (e) {
      if (e instanceof MessageError) throw e;
    }

    return reply;
  }
}

const create: MessageFunction = (
  user: Discord.User,
  args: string[],
  channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel
): string => {
  const repo = container.resolve(Repository);
  let reply = '';
  try {
    reply = repo.createJob(user.id, args, channel);
  } catch (e) {
    if (e instanceof MessageError) throw e;
  }
  return reply;
};

const cancel: MessageFunction = (
  user: Discord.User,
  args: string[]
): string => {
  const repo = container.resolve(Repository);
  let reply = '';
  try {
    reply = repo.cancelJob(user.id, args);
  } catch (e) {
    if (e instanceof MessageError) throw e;
  }
  return reply;
};

const list: MessageFunction = (
  user: Discord.User
): string | Discord.MessageEmbed => {
  const repo = container.resolve(Repository);
  let reply: string | Discord.MessageEmbed = '';
  try {
    reply = repo.listJob(user.id);
  } catch (e) {
    if (e instanceof MessageError) throw e;
  }
  return reply;
};
