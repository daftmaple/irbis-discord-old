// Format of time is \dd\dh\dm\ds
const delta = (time: string): number => {
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

export const deltaTime = (time: string, start?: Date): Date => {
  if (start) {
    return new Date(start.getTime() + delta(time));
  }

  return new Date(new Date().getTime() + delta(time));
};
