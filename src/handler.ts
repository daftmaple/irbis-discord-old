import { singleton, container } from 'tsyringe';
import Discord from 'discord.js';

import { Repository } from './repository';
import { MessageError } from './error';
import { systemExec } from './system';

type MessageFunction = (
  user: Discord.User,
  args: string[],
  message: Discord.Message
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
        help: help,
        load: load,
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

    try {
      const func = this._command.get(cmd);
      if (!!func) func(user, args, message);
    } catch (e) {
      if (e instanceof MessageError) message.channel.send(e.message);
    }
  }
}

const create: MessageFunction = (
  user: Discord.User,
  args: string[],
  message: Discord.Message
): void => {
  const repo = container.resolve(Repository);
  try {
    repo.createJob(user.id, args, message);
  } catch (e) {
    if (e instanceof MessageError) throw e;
  }
};

const cancel: MessageFunction = (
  user: Discord.User,
  args: string[],
  message: Discord.Message
): void => {
  const repo = container.resolve(Repository);
  try {
    repo.cancelJob(user.id, args, message);
  } catch (e) {
    if (e instanceof MessageError) throw e;
  }
};

const list: MessageFunction = (
  user: Discord.User,
  args: string[],
  message: Discord.Message
): void => {
  const repo = container.resolve(Repository);
  try {
    repo.listJob(user.id, message);
  } catch (e) {
    if (e instanceof MessageError) throw e;
  }
};

const help: MessageFunction = (
  user: Discord.User,
  args: string[],
  message: Discord.Message
): void => {
  const embed = new Discord.MessageEmbed();
  embed.setTitle('Commands and args:');
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
  embed.addFields([
    {
      name: 'Create',
      value: 'Create a job. Options:\n' + opts.join('\n'),
    },
    { name: 'cancel', value: 'Cancel currently running job' },
    { name: 'list', value: 'List all of your currently running job' },
    { name: 'help', value: 'This help embed' },
    { name: 'load', value: 'System load' },
  ]);
  message.channel.send(embed);
};

const load: MessageFunction = async (
  user: Discord.User,
  args: string[],
  message: Discord.Message
) => {
  try {
    const cpuLoad = (
      await systemExec(
        "grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$4+$5)} END {print usage }'"
      )
    ).replace('\n', '');
    const mem = (await systemExec('free -t -m')).split('\n');
    const tmem = mem.filter((line) => !line.match(/^\s*$/)).slice(-1)[0];
    const totalMem = tmem.split(/\s+/).slice(1);
    const memUsage = [
      `Total: ${totalMem[0]} MB`,
      `Used: ${totalMem[1]} MB`,
      `Free: ${totalMem[2]} MB`,
    ];

    const embed = new Discord.MessageEmbed();
    embed.setTitle('System load');
    embed.addFields([
      { name: 'CPU usage', value: `${parseFloat(cpuLoad).toFixed(2)}%` },
      { name: 'Memory', value: memUsage.join('\n') },
    ]);
    message.channel.send(embed);
  } catch (e) {
    console.log(e);
  }
};
