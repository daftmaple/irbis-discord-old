import { singleton } from 'tsyringe';
import schedule from 'node-schedule';
import Discord from 'discord.js';
import getopts from 'getopts';

import { parseDeltaTime, momentDiffString } from './delta';
import { MessageError } from './error';

@singleton()
export class Repository {
  private _users: Map<Discord.Snowflake, User>;
  constructor() {
    this._users = new Map();
  }

  public createJob(
    id: Discord.Snowflake,
    args: string[],
    channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel
  ): string {
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
      },
    });

    if (!opts['time']) throw new MessageError('Need time parameter: -t <time>');
    if (!opts['message'] || !opts['message'][0])
      throw new MessageError("Need message parameter: -m '<message>'");

    const date = parseDeltaTime(opts['time']);
    const message = (opts['message'] as string)
      .replace(/^['"]/, '')
      .replace(/['"]$/, '');

    // Add job for user
    try {
      const job = new Job(date, message, channel, user);
      user.addJob(job);
    } catch (e) {
      throw e;
    }

    return 'Successfully created a job';
  }

  public cancelJob(id: Discord.Snowflake, args: string[]): string {
    // Cancel job for user based on opts
    let user = this._users.get(id);
    if (!user) {
      throw new MessageError("User doesn't have any job");
    }

    if (!args[0]) throw new MessageError('Need an argument: index of job');

    const index = parseInt(args[0], 10);
    if (isNaN(index))
      throw new MessageError(`Invalid argument ${args[0]}. Need index of job`);

    const job = user.removeJob(index);

    return `Job has been removed: ${job.toString()}`;
  }

  public listJob(id: Discord.Snowflake): string | Discord.MessageEmbed {
    let user = this._users.get(id);
    if (!user) {
      throw new MessageError("User doesn't have any job");
    }

    const jobs = user.listJob();

    if (jobs.length === 0) return "User doesn't have any job";

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

    return embed;
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
