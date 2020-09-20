import Discord from 'discord.js';

import { MessageFunction } from '../types/message';
import { BotConfig } from '../utils/config';
import { systemExec } from '../utils/system';

const prefix = BotConfig.discordConfig.prefix;
const npmVersion = process.env.npm_package_version;

const help: MessageFunction = (message: Discord.Message): void => {
  const embed = new Discord.MessageEmbed();
  embed.setTitle('Commands and args:');

  embed.addFields([
    {
      name: 'job',
      value: `Create/cancel/list user job. Use \`${prefix}job help\` for more details`,
    },
    {
      name: 'role',
      value: `Assign/deassign role. Use \`${prefix}role help\` for more details`,
    },
    { name: 'load', value: 'System load' },
    { name: 'help', value: 'This help embed' },
    { name: 'version', value: 'Bot version' },
  ]);
  embed.setFooter(`Version ${npmVersion}`);
  message.channel.send(embed);
};

const load: MessageFunction = async (message: Discord.Message) => {
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

const version: MessageFunction = async (message: Discord.Message) => {
  message.channel.send(`Version ${npmVersion}`);
};

export const defaultHandler = { help, load, version };
