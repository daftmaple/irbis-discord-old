import * as botConfig from '../../config.json';

interface IAssignableRole {
  name: string;
  id: string;
}

interface IConfig {
  assignableRoles: IAssignableRole[];
}

const BotConfig: IConfig = botConfig;

export { BotConfig };
