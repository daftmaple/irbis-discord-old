import { singleton } from 'tsyringe';
import schedule from 'node-schedule';
import Discord from 'discord.js';
import getopts from 'getopts';

import { deltaTime } from './delta';

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

    if (!opts['time']) throw new Error('Need time parameter: -t <time>');
    if (!opts['message'] || !opts['message'][0])
      throw new Error("Need message parameter: -m '<message>'");

    const date = deltaTime(opts['time']);
    const message = opts['message'];

    // Add job for user
    try {
      const job = new Job(date, message, channel);
      user.addJob(job);
    } catch (e) {
      throw e;
    }

    return 'Successfully created a job';
  }

  public cancelJob(id: Discord.Snowflake, args: string[]): string {
    // Cancel job for user based on opts

    return '';
  }

  public listJob(id: Discord.Snowflake): string {
    // List all jobs for user

    return '';
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
    if (this._jobs.length < id) throw new Error(`Index ${id} not found`);

    const j = this._jobs.splice(id, 1);
    return j[0];
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
    channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel
  ) {
    this._date = date;
    this._message = message;
    this._chan = channel;
    console.log(date);
    this._job = schedule.scheduleJob(date, () => {
      channel.send(message);
    });
  }

  public reschedule(date: Date) {
    this._job.reschedule(date.getTime());
  }

  public cancel() {
    this._job.cancel();
  }

  public get message(): string {
    return this._message;
  }
}
