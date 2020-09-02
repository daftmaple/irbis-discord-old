import 'reflect-metadata';

import Discord from 'discord.js';
import { container } from 'tsyringe';
import { Handler } from './handler';
import { BotConfig } from './utils/config';

const client: Discord.Client = new Discord.Client({
  retryLimit: 3,
});

const discordConfig = BotConfig.discordConfig;

client.on('message', async (message: Discord.Message) => {
  const handler = container.resolve(Handler);
  if (!message.content.startsWith(discordConfig.prefix)) return;
  handler.handleMessage(message);
});

client.login(discordConfig.token);
client.on('ready', () => {
  if (client.user) {
    client.user.setPresence({
      activity: {
        name: `${discordConfig.prefix}help | version ${process.env.npm_package_version}`,
        type: 'LISTENING',
      },
    });
  }
});
