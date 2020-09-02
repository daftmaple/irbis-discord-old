import * as botConfig from '../../config.json';

interface IAssignableRole {
  name: string;
  id: string;
}

interface IDiscordConfig {
  token: string;
  prefix: string;
}

interface ITwitchNotificationConfig {
  discordRoleId: string;
  discordChannelId: string;
  twitchChannelId: string;
  twitchClientId: string;
  twitchClientSecret: string;
}

interface IConfig {
  assignableRoles: IAssignableRole[];
  discordConfig: IDiscordConfig;
  twitchNotificationConfig: ITwitchNotificationConfig;
}

const BotConfig: IConfig = botConfig;

if (BotConfig.discordConfig.prefix.length < 1) {
  // Defaults the prefix
  BotConfig.discordConfig.prefix = 'r!';
}

if (BotConfig.discordConfig.token.length === 0) {
  // Alert user
  console.error('Invalid Discord token');
}

export { BotConfig };
