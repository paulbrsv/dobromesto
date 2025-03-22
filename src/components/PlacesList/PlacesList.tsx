import React, { useRef, useEffect } from 'react';
import { styled } from 'styled-components';
import { Place, AppConfig } from '../../types/places';

interface PlacesListProps {
  places: Place[];
  config: AppConfig;
  onPlaceSelect: (place: Place) => void;
  selectedPlace?: Place | null;
  isVisible: boolean;
  onClose: () => void;
}

const ListContainer = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 15px;
  width: 350px;
  max-height: calc(100vh - 96px);
  overflow-y: auto;
  background: transparent;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: ${props => props.$isVisible ? 'flex' : 'none'};
  flex-direction: column;
  gap: 10px;
  padding: 10px 0;
  transition: top 0.3s ease;

  @media (max-width: 768px) {
    position: fixed;
    top: 122px !important;
    left: 0;
    width: 100%;
    max-width: 100%;
    background: #f5f5f5;
    z-index: 9999;
    padding: 20px 10px 150px 10px;
    box-sizing: border-box;
  }
`;

const PlaceCard = styled.div<{ $isSelected: boolean }>`
  padding: 15px;
  cursor: pointer;
  background: ${props => props.$isSelected ? '#f5f5f5' : '#fff'};
  border-radius: 4px;
  display: flex;
  align-items: flex-start;
  gap: 10px;

  &:hover {
    background: #f5f5f5;
  }

  @media (max-width: 768px) {
    background: #fff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    margin-bottom: 15px;
    padding: 10px;
  }
`;

const PlaceImage = styled.img`
  flex-shrink: 0;
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  background-color: #eee;

  @media (max-width: 768px) {
    width: 50px;
    height: 60px;
  }
`;

const PlaceContent = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const PlaceTitle = styled.h3`
  margin: 0;
  font-size: 16px;
`;

const PlaceDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${props => props.theme.colors?.textSecondary || '#666'};
`;

const PlaceAttributes = styled.div`
  display: flex;
  gap: 2px;
  margin-top: 5px;
`;

const AttributeIcon = styled.img`
  width: 16px;
  height: 16px;
  object-fit: contain;
`;

const CloseButton = styled.button`
  position: fixed;
  top: 140px;
  right: 20px;
  padding: 8px 16px;
  background: ${props => props.theme.colors?.closeButton || '#ff4444'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  z-index: 9999;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

export const PlacesList: React.FC<PlacesListProps> = ({
  places,
  config,
  onPlaceSelect,
  selectedPlace,
  isVisible,
  onClose
}) => {
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Сбрасываем прокрутку списка в начало при его открытии
  useEffect(() => {
    if (isVisible && listContainerRef.current) {
      listContainerRef.current.scrollTop = 0;
    }
  }, [isVisible]);

  const getFilterIcon = (attribute: string) => {
    const allFilters = [...config.filters.leftFilters, ...config.filters.rightFilters];
    return allFilters.find(filter => filter.key === attribute)?.icon;
  };

  return (
    <>
      <ListContainer $isVisible={isVisible} ref={listContainerRef}>
        {places.map(place => (
          <PlaceCard
            key={`${place.lat}-${place.lng}`}
            $isSelected={selectedPlace?.name === place.name}
            onClick={() => onPlaceSelect(place)}
          >
            <PlaceImage src={place.image} alt={place.name} />
            <PlaceContent>
              <PlaceTitle>{place.name}</PlaceTitle>
              <PlaceDescription>{place.shirt_description}</PlaceDescription>
              <PlaceAttributes>
                {place.attributes.map(attr => {
                  const iconUrl = getFilterIcon(attr);
                  return iconUrl && (
                    <AttributeIcon
                      key={attr}
                      src={iconUrl}
                      alt={attr}
                      title={config.filters.leftFilters.concat(config.filters.rightFilters)
                        .find(f => f.key === attr)?.tooltip}
                    />
                  );
                })}
              </PlaceAttributes>
            </PlaceContent>
          </PlaceCard>
        ))}
      </ListContainer>
      {isVisible && <CloseButton onClick={onClose}>{config.content.buttonLabels.close}</CloseButton>}
    </>
  );
};

export default PlacesList;
