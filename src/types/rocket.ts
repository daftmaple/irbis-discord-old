type Vehicle = {
  id: number;
  name: string;
  company_id: number;
  slug: string;
};

type Provider = {
  id: number;
  name: string;
  slug: string;
};

type Location =
  | {
      id: number;
      name: string;
      state: string | null;
      statename: string | null;
      country: string;
      slug: string;
    }
  | {
      id: number;
      name: string;
      state: null;
      statename: null;
      country: string;
      slug: string;
    };

type Pad = {
  id: number;
  name: string;
  location: Location;
};

type Mission = {
  id: number;
  name: string;
  description: string | null;
};

type EstimatedDate = {
  month: number | null;
  day: number | null;
  year: number | null;
  quarter: null;
};

type Tag = {
  id: number;
  text: string;
};

type ResultValue = -1 | 0 | 1 | 2 | 3;

type ResultValueRecord = {
  [key in ResultValue]: string;
};

export const resultValue: ResultValueRecord = {
  [-1]: 'Not Set',
  [0]: 'Failure',
  [1]: 'Success',
  [2]: 'Partial Failure',
  [3]: 'In-Flight Abort (Crewed)',
};

type BaseResult = {
  id: number;
  cospar_id: string;
  sort_date: string; // Time of launch
  name: string; // Name of mission
  provider: Provider; // Provider info
  vehicle: Vehicle; // Vehicle info
  pad: Pad;
  missions: Mission[];
  mission_description: string | null;
  launch_description: string | null;
  win_open: string | null; // Exact date (if null then sort_date is estimated date)
  t0: string | null;
  win_close: string | null;
  est_date: EstimatedDate; // Estimated date (if exact date / win_open is unknown)
  date_str: string;
  tags: Tag[];
  slug: string;
  quicktext: string;
  media?: unknown[];
  result: ResultValue;
  suborbital: boolean;
  modified: string;
};

type Result =
  | (BaseResult & {
      weather_summary: null;
      weather_temp: null;
      weather_icon: null;
      weather_updated: null;
    })
  | (BaseResult & {
      weather_summary: string;
      weather_temp: number;
      weather_icon: string;
      weather_updated: string;
    });

export type RocketLaunchResponse = {
  valid_auth: boolean;
  count: number;
  limit: number;
  total: number;
  last_page: number;
  result: Result[];
};
