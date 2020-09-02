import { singleton, container } from 'tsyringe';
import Discord from 'discord.js';

import { MessageError } from './types/error';
import { MessageFunction } from './types/message';
import { defaultHandler } from './handler/default';
import { jobHandler } from './handler/job';
import { roleHandler } from './handler/role';
import { BotConfig } from './utils/config';

@singleton()
export class Handler {
  private _prefix: string;
  private _command: Map<string, MessageFunction>;

  constructor() {
    this._prefix = BotConfig.discordConfig.prefix;
    this._command = new Map(
      Object.entries({
        help: defaultHandler.help,
        load: defaultHandler.load,
        version: defaultHandler.version,
        job: jobHandler.job,
        role: roleHandler.role,
      })
    );
  }

  // Take the prefix out as args, and split args into [cmd|...args]
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

    try {
      const func = this._command.get(cmd);
      if (!!func) func(message, user, args);
    } catch (e) {
      if (e instanceof MessageError) message.channel.send(e.message);
    }
  }
}
