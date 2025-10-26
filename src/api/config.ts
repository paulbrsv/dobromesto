import { useQuery } from '../react-query';
import type { AppConfig } from '../types/places';

const CONFIG_ENDPOINT = '/data/config.json';

export const fetchConfig = async (): Promise<AppConfig> => {
  const response = await fetch(CONFIG_ENDPOINT);
  if (!response.ok) {
    throw new Error('Failed to load configuration');
  }

  return response.json();
};

export const useConfigQuery = () =>
  useQuery<AppConfig, Error>(['config'], fetchConfig, {
    staleTime: 5 * 60 * 1000,
  });
