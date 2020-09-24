import Discord from 'discord.js';
import { singleton } from 'tsyringe';
import getopts from 'getopts';
import schedule from 'node-schedule';

import { parseDeltaTime, momentDiffString } from './utils/delta';
import { MessageError } from './types/error';

@singleton()
export class Repository {
  private _users: Map<Discord.Snowflake, User>;
  constructor() {
    this._users = new Map();
  }

  public createJob(
    id: Discord.Snowflake,
    args: string[],
    message: Discord.Message
  ): void {
    let user = this._users.get(id);
    if (!user) {
      user = new User(id);
      this._users.set(id, user);
    }

    const opts = getopts(args, {
      alias: {
        message: 'm',
        time: 't',
        channel: ['c', 'chan'],
        silent: 's',
        delete: 'd',
        self: 'i',
        everyone: 'e',
        user: 'u',
      },
    });

    if (!opts['time']) throw new MessageError('Need time parameter: -t <time>');
    if (typeof opts['message'] !== 'string')
      throw new MessageError("Need message parameter: -m '<message>'");

    const date = parseDeltaTime(opts['time']);
    let parsedMessage = (opts['message'] as string)
      .replace(/^['"]/, '')
      .replace(/['"]$/, '');

    if (opts['self'])
      parsedMessage = `<@${message.author.id}> ${parsedMessage}`;

    if (typeof opts['user'] === 'string' && opts['user'].match(/^<@!\d+>$/)) {
      parsedMessage = `${opts['user'].toString()} ${parsedMessage}`;
    } else if (typeof opts['user'] === 'boolean') {
      throw new MessageError('Need valid parameter for user: -u @user');
    }

    if (opts['everyone']) parsedMessage = `@everyone ${parsedMessage}`;

    // Add job for user
    const job = new Job(date, parsedMessage, message.channel, user);
    user.addJob(job);

    if (opts['delete']) message.delete();
    if (!opts['silent']) message.channel.send('Successfully created a job');
  }

  public cancelJob(
    id: Discord.Snowflake,
    args: string[],
    message: Discord.Message
  ): void {
    // Cancel job for user based on opts
    const user = this._users.get(id);
    if (!user) {
      throw new MessageError("User doesn't have any job");
    }

    if (!args[0]) throw new MessageError('Need an argument: index of job');

    const index = parseInt(args[0], 10);
    if (isNaN(index))
      throw new MessageError(`Invalid argument ${args[0]}. Need index of job`);

    const job = user.removeJob(index);

    message.channel.send(`Job has been removed: ${job.toString()}`);
  }

  public listJob(id: Discord.Snowflake, message: Discord.Message): void {
    const user = this._users.get(id);
    if (!user) {
      throw new MessageError("User doesn't have any job");
    }

    const jobs = user.listJob();

    if (jobs.length === 0) {
      message.channel.send("User doesn't have any job");
      return;
    }
    const embed = new Discord.MessageEmbed();
    embed.setTitle('List of scheduled jobs');
    embed.addFields([
      {
        name: 'Jobs',
        value: jobs
          .map((job, index) => {
            return `${index}: ${job.toString()}`;
          })
          .join('\n'),
      },
    ]);

    message.channel.send(embed);
  }
}

class User {
  private _id: Discord.Snowflake;
  private _jobs: Job[];
  constructor(id: Discord.Snowflake) {
    this._id = id;
    this._jobs = [];
  }

  public addJob(job: Job): void {
    this._jobs.push(job);
  }

  public removeJob(id: number): Job {
    if (this._jobs.length < id) throw new MessageError(`Index ${id} not found`);

    const j = this._jobs.splice(id, 1);
    j[0].cancel();
    return j[0];
  }

  public removeJobCallback(job: Job): void {
    const index = this._jobs.indexOf(job);
    if (index === -1) return;

    this._jobs.splice(index, 1);
  }

  public listJob(): Job[] {
    return this._jobs;
  }
}

class Job {
  private _date: Date;
  private _message: string;
  private _job: schedule.Job;
  private _chan: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel;

  public constructor(
    date: Date,
    message: string,
    channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel,
    user: User
  ) {
    this._date = date;
    this._message = message;
    this._chan = channel;
    this._job = schedule.scheduleJob(date, () => {
      channel.send(message);
      user.removeJobCallback(this);
    });
  }

  public reschedule(date: Date) {
    this._job.reschedule(date.getTime());
  }

  public cancel() {
    this._job.cancel();
  }

  // public get message(): string {
  //   return this._message;
  // }

  private timeDiffString(): string {
    return momentDiffString(this._date).join(', ');
  }

  public toString(): string {
    return `(in ${this.timeDiffString()}) ${this._message}`;
  }
}
