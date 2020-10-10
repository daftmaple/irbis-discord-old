import axios from 'axios';
import type { RocketLaunchResponse } from '../types/rocket';

export const rocketLaunches = async (): Promise<RocketLaunchResponse> => {
  const response = await axios.get(
    'https://fdo.rocketlaunch.live/json/launches/next/5'
  );
  return response.data;
};
