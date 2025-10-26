import React, { useMemo } from 'react';
import { styled } from 'styled-components';
import { useLayoutConfig } from '../features/layout/Layout';
import { FiltersPanel } from '../features/filters/FiltersPanel';
import { MapView } from '../features/map/MapView';
import { PlacesList } from '../features/places-list/PlacesList';
import { usePlacesQuery } from '../api/places';
import { usePlacesStore } from '../store/placesStore';
import type { BoundsArray } from '../store/placesStore';
import { getPlaceId } from '../utils/placeId';
import type { Place } from '../types/places';
import { useIsMobile } from '../hooks/useIsMobile';

const Content = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  min-height: 0;
`;

const MapSection = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
`;

const ShowListButton = styled.button`
  position: absolute;
  top: 30px;
  right: 20px;
  padding: 10px 18px;
  background: ${(props) => props.theme.colors?.primary || '#333'};
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  z-index: 20;
  display: none;
  font-weight: 600;

  @media (max-width: 768px) {
    display: block;
  }
`;

const LoaderOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: #fff;
  z-index: 1000;
`;

const LoaderSpinner = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 5px solid #f3f3f3;
  border-top: 5px solid ${(props) => props.theme.colors?.primary || '#333'};
  animation: spin 1.2s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const Message = styled.div`
  padding: 32px;
  text-align: center;
  color: ${(props) => props.theme.colors?.textSecondary || '#666'};
`;

const getFilteredPlaces = (places: Place[], activeFilters: string[]) => {
  if (activeFilters.length === 0) return places;

  return places.filter((place) =>
    activeFilters.every((filter) => place.attributes.includes(filter))
  );
};

const getFilterCounts = (places: Place[], activeFilters: string[]) => {
  if (places.length === 0) return {} as Record<string, number>;

  const filtered = getFilteredPlaces(places, activeFilters);
  const counts: Record<string, number> = {};
  const attributes = new Set<string>();
  places.forEach((place) => {
    place.attributes.forEach((attribute) => attributes.add(attribute));
  });

  attributes.forEach((attribute) => {
    if (activeFilters.includes(attribute)) {
      counts[attribute] = filtered.length;
    } else {
      counts[attribute] = filtered.filter((place) => place.attributes.includes(attribute)).length;
    }
  });

  return counts;
};

const sortPlacesByBounds = (places: Place[], bounds: BoundsArray) => {
  if (!bounds) return places;

  const [[south, west], [north, east]] = bounds;

  const inBounds = (place: Place) =>
    place.lat >= south &&
    place.lat <= north &&
    place.lng >= west &&
    place.lng <= east;

  return [...places].sort((a, b) => {
    const aIn = inBounds(a);
    const bIn = inBounds(b);
    if (aIn && !bIn) return -1;
    if (!aIn && bIn) return 1;
    return 0;
  });
};

export const HomePage: React.FC = () => {
  const { config } = useLayoutConfig();
  const { data: placesData, isLoading, isError } = usePlacesQuery();
  const activeFilters = usePlacesStore((state) => state.activeFilters);
  const selectedPlaceId = usePlacesStore((state) => state.selectedPlaceId);
  const setSelectedPlace = usePlacesStore((state) => state.setSelectedPlace);
  const isListOpen = usePlacesStore((state) => state.isListOpen);
  const openList = usePlacesStore((state) => state.openList);
  const closeList = usePlacesStore((state) => state.closeList);
  const bounds = usePlacesStore((state) => state.bounds);
  const setBounds = usePlacesStore((state) => state.setBounds);
  const isMobile = useIsMobile();

  const places = placesData ?? [];

  const filteredPlaces = useMemo(
    () => getFilteredPlaces(places, activeFilters),
    [places, activeFilters]
  );

  const sortedPlaces = useMemo(
    () => sortPlacesByBounds(filteredPlaces, bounds),
    [filteredPlaces, bounds]
  );

  const filterCounts = useMemo(
    () => getFilterCounts(places, activeFilters),
    [places, activeFilters]
  );

  const handleSelectPlaceFromList = (place: Place) => {
    setSelectedPlace(getPlaceId(place));
  };

  const handleBoundsChange = (nextBounds: BoundsArray) => {
    setBounds(nextBounds);
  };

  const handleMapSelectPlace = (placeId: string | null) => {
    setSelectedPlace(placeId);
    if (placeId && isMobile) {
      openList();
    }
  };

  return (
    <>
      <FiltersPanel config={config} filterCounts={filterCounts} />
      <Content>
        <MapSection>
          {isLoading && (
            <LoaderOverlay>
              <LoaderSpinner />
              <Message>Loading places…</Message>
            </LoaderOverlay>
          )}
          {isError && !isLoading && (
            <LoaderOverlay>
              <Message>Failed to load places data.</Message>
            </LoaderOverlay>
          )}

          {!isLoading && !isError && (
            <>
              <MapView
                config={config}
                places={sortedPlaces}
                selectedPlaceId={selectedPlaceId}
                onSelectPlace={handleMapSelectPlace}
                onBoundsChange={handleBoundsChange}
              />
              <ShowListButton type="button" onClick={openList}>
                {config.content.buttonLabels.showList}
              </ShowListButton>
            </>
          )}
        </MapSection>

        <PlacesList
          places={sortedPlaces}
          config={config}
          selectedPlaceId={selectedPlaceId}
          onSelectPlace={handleSelectPlaceFromList}
          isOpen={isListOpen}
          onClose={closeList}
        />
      </Content>
    </>
  );
};
