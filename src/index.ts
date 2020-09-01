import 'reflect-metadata';

import Discord from 'discord.js';
import { container, singleton } from 'tsyringe';
import dotenv from 'dotenv';

import { Handler } from './handler';
dotenv.config();

const client: Discord.Client = new Discord.Client({
  retryLimit: 3,
});

const prefix = process.env.DISCORD_BOT_PREFIX || 'r!';

client.on('message', async (message: Discord.Message) => {
  const handler = container.resolve(Handler);
  if (!message.content.startsWith(prefix)) return;
  handler.handleMessage(message);
});

client.login(process.env.DISCORD_BOT_TOKEN!);
client.on('ready', () => {
  if (client.user) {
    client.user.setPresence({
      activity: {
        name: `${prefix}help | version ${process.env.npm_package_version}`,
        type: 'LISTENING',
      },
    });
  }
});
