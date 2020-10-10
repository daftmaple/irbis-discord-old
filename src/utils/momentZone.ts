import { zones, links } from 'moment-timezone/data/packed/latest.json';

const validZones = zones.map((i) => i.split('|')[0]);
const validLinks = links.map((i) => i.split('|')[1]);

const valid = [...validZones, ...validLinks];

export const validZoneFormat = (arg?: string): string | null => {
  if (!arg) return 'UTC';
  if (valid.indexOf(arg) === -1) return null;
  return arg;
};
