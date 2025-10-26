import React, { useEffect, useMemo, useRef } from 'react';
import { styled } from 'styled-components';
import type { AppConfig, Place } from '../../types/places';
import { getPlaceId } from '../../utils/placeId';

interface PlacesListProps {
  places: Place[];
  config: AppConfig;
  selectedPlaceId: string | null;
  onSelectPlace: (place: Place) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ListContainer = styled.aside<{ $isOpen: boolean }>`
  position: absolute;
  top: 0;
  left: 15px;
  width: 360px;
  max-height: calc(100vh - 96px);
  overflow-y: auto;
  display: ${(props) => (props.$isOpen ? 'flex' : 'none')};
  flex-direction: column;
  gap: 10px;
  padding: 10px 0;
  z-index: 10;

  @media (max-width: 768px) {
    position: fixed;
    top: 122px;
    left: 0;
    width: 100%;
    max-height: calc(100vh - 150px);
    padding: 20px 10px 140px 10px;
    background: #f5f5f5;
    box-sizing: border-box;
  }
`;

const PlaceCard = styled.div<{ $isSelected: boolean }>`
  padding: 15px;
  cursor: pointer;
  background: ${(props) => (props.$isSelected ? '#f5f5f5' : '#fff')};
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: ${(props) => (props.$isSelected ? '0 2px 6px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.08)')};
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    background: #fff;
  }
`;

const PlaceImage = styled.img`
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
`;

const PlaceContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const PlaceTitle = styled.h3`
  margin: 0;
  font-size: 16px;
`;

const PlaceDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${(props) => props.theme.colors?.textSecondary || '#666'};
`;

const PlaceAttributes = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const AttributeIcon = styled.img`
  width: 16px;
  height: 16px;
`;

const CloseButton = styled.button`
  position: fixed;
  top: 140px;
  right: 20px;
  padding: 8px 16px;
  background: ${(props) => props.theme.colors?.closeButton || '#ff4444'};
  color: #fff;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  z-index: 100;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const getFilterIcon = (config: AppConfig, attribute: string) => {
  const filters = [...config.filters.leftFilters, ...config.filters.rightFilters];
  return filters.find((filter) => filter.key === attribute)?.icon;
};

export const PlacesList: React.FC<PlacesListProps> = ({
  places,
  config,
  selectedPlaceId,
  onSelectPlace,
  isOpen,
  onClose,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [isOpen, places.length]);

  useEffect(() => {
    if (selectedRef.current && listRef.current) {
      const node = selectedRef.current;
      const container = listRef.current;
      const { offsetTop } = node;
      if (offsetTop < container.scrollTop || offsetTop > container.scrollTop + container.clientHeight - node.clientHeight) {
        container.scrollTo({ top: offsetTop - 20, behavior: 'smooth' });
      }
    }
  }, [selectedPlaceId]);

  const renderedPlaces = useMemo(
    () => {
      selectedRef.current = null;
      return places.map((place) => {
        const id = getPlaceId(place);
        const isSelected = id === selectedPlaceId;
        return (
          <PlaceCard
            key={id}
            $isSelected={isSelected}
            onClick={() => onSelectPlace(place)}
            ref={isSelected ? (node) => (selectedRef.current = node) : undefined}
          >
            <PlaceImage src={place.image} alt={place.name} />
            <PlaceContent>
              <PlaceTitle>{place.name}</PlaceTitle>
              <PlaceDescription>{place.shirt_description || place.description}</PlaceDescription>
              <PlaceAttributes>
                {place.attributes.map((attribute) => {
                  const icon = getFilterIcon(config, attribute);
                  if (!icon) return null;
                  return <AttributeIcon key={`${place.name}-${attribute}`} src={icon} alt={attribute} />;
                })}
              </PlaceAttributes>
            </PlaceContent>
          </PlaceCard>
        );
      });
    },
    [config, onSelectPlace, places, selectedPlaceId]
  );

  return (
    <>
      <ListContainer $isOpen={isOpen} ref={listRef}>
        {renderedPlaces}
      </ListContainer>
      {isOpen && (
        <CloseButton type="button" onClick={onClose}>
          {config.content.buttonLabels.close}
        </CloseButton>
      )}
    </>
  );
};
