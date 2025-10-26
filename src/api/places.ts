import { useQuery } from '../react-query';
import type { Place } from '../types/places';

const PLACES_ENDPOINT = '/data/places.json';

export const fetchPlaces = async (): Promise<Place[]> => {
  const response = await fetch(PLACES_ENDPOINT);
  if (!response.ok) {
    throw new Error('Failed to load places');
  }

  return response.json();
};

export const usePlacesQuery = () =>
  useQuery<Place[], Error>(['places'], fetchPlaces, {
    staleTime: 5 * 60 * 1000,
  });
