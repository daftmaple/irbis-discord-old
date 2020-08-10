import { singleton, container } from 'tsyringe';
import Discord from 'discord.js';

import { Repository } from './repository';
import { MessageError } from './error';

type MessageFunction = (
  user: Discord.User,
  args: string[],
  channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel
) => void;

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

  public handleMessage(message: Discord.Message) {
    const command: string = message.content.slice(this._prefix.length).trim();

    // Split with positive single/double quote lookahead
    const args = command
      .split(
        /("[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|\/[^\/\\]*(?:\\[\S\s][^\/\\]*)*\/[gimy]*(?=\s|$)|(?:\\\s|\S)+)/
      )
      .filter((char) => !char.match(/^\s*$/));
    const cmd = args.shift();

    if (!cmd) throw new Error();

    const user = message.author;

    let reply: string | Discord.MessageEmbed = '';
    try {
      const func = this._command.get(cmd);
      if (!!func) func(user, args, message.channel);
    } catch (e) {
      if (e instanceof MessageError) message.channel.send(e.message);
    }
  }
}

const create: MessageFunction = (
  user: Discord.User,
  args: string[],
  channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel
): void => {
  const repo = container.resolve(Repository);
  try {
    repo.createJob(user.id, args, channel);
  } catch (e) {
    if (e instanceof MessageError) throw e;
  }
};

const cancel: MessageFunction = (
  user: Discord.User,
  args: string[],
  channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel
): void => {
  const repo = container.resolve(Repository);
  try {
    repo.cancelJob(user.id, args, channel);
  } catch (e) {
    if (e instanceof MessageError) throw e;
  }
};

const list: MessageFunction = (
  user: Discord.User,
  args: string[],
  channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel
): void => {
  const repo = container.resolve(Repository);
  try {
    repo.listJob(user.id, channel);
  } catch (e) {
    if (e instanceof MessageError) throw e;
  }
};
