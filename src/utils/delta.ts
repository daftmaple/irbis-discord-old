import moment from 'moment';

// Format of time is \dd\dh\dm\ds
const parseDelta = (time: string): number => {
  const day_re = /(?:(\d+)d)/.exec(time);
  const hrs_re = /(?:(\d+)h)/.exec(time);
  const min_re = /(?:(\d+)m)/.exec(time);
  const sec_re = /(?:(\d+)s)/.exec(time);

  const d = day_re ? parseInt(day_re[1], 10) : 0;
  const h = hrs_re ? parseInt(hrs_re[1], 10) : 0;
  const m = min_re ? parseInt(min_re[1], 10) : 0;
  const s = sec_re ? parseInt(sec_re[1], 10) : 0;
  const t = (s + m * 60 + h * 3600 + d * 86400) * 1000;

  return t;
};

export const parseDeltaTime = (time: string, start?: Date): Date => {
  if (start) {
    return new Date(start.getTime() + parseDelta(time));
  }

  return new Date(new Date().getTime() + parseDelta(time));
};

export const momentDiffString = (end: Date, start?: Date): string[] => {
  if (!start) {
    start = new Date();
  }

  const endMoment = moment(end);
  const startMoment = moment(start);

  const y = endMoment.diff(startMoment, 'years');
  startMoment.add(y, 'years');
  const m = endMoment.diff(startMoment, 'months');
  startMoment.add(m, 'months');
  const d = endMoment.diff(startMoment, 'days');
  startMoment.add(d, 'days');
  const h = endMoment.diff(startMoment, 'hours');
  startMoment.add(h, 'hours');
  const min = endMoment.diff(startMoment, 'minutes');
  startMoment.add(min, 'minutes');
  const s = endMoment.diff(startMoment, 'seconds');
  startMoment.add(s, 'seconds');

  const sep = [];
  y && sep.push(y === 1 ? '1 year' : `${y} years`);
  m && sep.push(m === 1 ? '1 month' : `${m} months`);
  d && sep.push(d === 1 ? '1 day' : `${d} days`);
  h && sep.push(h === 1 ? '1 hour' : `${h} hours`);
  min && sep.push(min === 1 ? '1 minute' : `${min} minutes`);
  s && sep.push(s === 1 ? '1 second' : `${s} seconds`);

  return sep;
};
