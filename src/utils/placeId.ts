import type { Place } from '../types/places';

export const getPlaceId = (place: Place) => `${place.lat}-${place.lng}-${place.name}`;
