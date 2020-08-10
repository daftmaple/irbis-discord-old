import 'reflect-metadata';

import Discord from 'discord.js';
import { container, singleton } from 'tsyringe';
import dotenv from 'dotenv';

import { Handler } from './handler';
import { MessageError } from './error';

dotenv.config();

class ClientProvider extends Discord.Client {
  constructor(options?: Discord.ClientOptions) {
    super(options);
  }
}

const client: Discord.Client = new ClientProvider({
  retryLimit: 3,
});

const prefix = process.env.BOT_PREFIX || 'r!';

client.on('message', async (message: Discord.Message) => {
  const handler = container.resolve(Handler);
  if (!message.content.startsWith(prefix)) return;
  handler.handleMessage(message);
});

client.login(process.env.BOT_TOKEN!);
