import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { styled } from 'styled-components';
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from '../../lib/react-leaflet';
import { MarkerClusterGroup } from '../../lib/react-leaflet-cluster';
import { useMapEvents } from '../../lib/react-leaflet';
import type { AppConfig, Place } from '../../types/places';
import type { BoundsArray } from '../../store/placesStore';
import { useIsMobile } from '../../hooks/useIsMobile';
import { getPlaceId } from '../../utils/placeId';

interface MapViewProps {
  config: AppConfig;
  places: Place[];
  selectedPlaceId: string | null;
  onSelectPlace: (placeId: string | null) => void;
  onBoundsChange: (bounds: BoundsArray) => void;
}

const MapWrapper = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
`;

const GeolocateButton = styled.button`
  position: absolute;
  top: 80px;
  right: 20px;
  padding: 8px 14px;
  background: ${(props) => props.theme.colors?.primary || '#333'};
  color: #fff;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 500;
  font-weight: 600;
  font-size: 14px;
  transition: background 0.2s ease;

  &:hover {
    background: ${(props) => props.theme.colors?.hover || '#555'};
  }

  @media (max-width: 768px) {
    top: auto;
    bottom: 20px;
    right: 20px;
  }
`;

const PopupContent = styled.div`
  display: flex;
  background: #fff;

  img {
    width: 120px;
    height: 150px;
    object-fit: cover;
  }

  .place-content {
    display: flex;
    flex-direction: column;
    padding: 0 10px 5px 10px;
    max-width: 320px;
  }

  h3 {
    margin: 0;
    font-size: 16px;
  }

  p {
    margin: 10px 0;
    font-size: 14px;
    color: ${(props) => props.theme.colors?.textSecondary || '#666'};
  }

  .place-links-social {
    display: flex;
    gap: 10px;
    margin-top: auto;

    a {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: ${(props) => props.theme.colors?.background || '#fff'};
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.05);
      }

      img {
        width: 18px;
        height: 18px;
      }
    }
  }
`;

const MobilePopupContainer = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
  align-items: flex-start;
  position: relative;
`;

const MobilePopupClose = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  border: none;
  background: transparent;
  color: ${(props) => props.theme.colors?.closeButton || '#ff4444'};
  font-size: 24px;
  cursor: pointer;
`;

const MobilePlacePopup: React.FC<{
  place: Place | null;
  onClose: () => void;
}> = ({ place, onClose }) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const div = document.createElement('div');
    div.className = 'map-popup-mobile';
    document.body.appendChild(div);
    setContainer(div);

    return () => {
      document.body.removeChild(div);
    };
  }, []);

  useEffect(() => {
    if (!container) return;
    if (place) {
      container.classList.add('active');
    } else {
      container.classList.remove('active');
    }
  }, [container, place]);

  if (!container || !place) {
    return null;
  }

  return createPortal(
    <MobilePopupContainer>
      <img src={place.image} alt={place.name} className="place-image" />
      <div className="place-content">
        <h3>{place.name}</h3>
        <p>{place.description}</p>
        <div className="place-links-social">
          {place.instagram && (
            <a href={place.instagram} target="_blank" rel="noreferrer">
              <img src="/data/images/instagram.svg" alt="Instagram" />
            </a>
          )}
          {place.maps_url && (
            <a href={place.maps_url} target="_blank" rel="noreferrer">
              <img src="/data/images/google.svg" alt="Google Maps" />
            </a>
          )}
        </div>
      </div>
      <MobilePopupClose onClick={onClose}>×</MobilePopupClose>
    </MobilePopupContainer>,
    container
  );
};

const MapBoundsWatcher: React.FC<{
  onBoundsChange: (bounds: BoundsArray) => void;
}> = ({ onBoundsChange }) => {
  const map = useMapEvents({
    moveend: (event) => {
      const target = event.target as L.Map;
      const bounds = target.getBounds();
      onBoundsChange([
        [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
        [bounds.getNorthEast().lat, bounds.getNorthEast().lng],
      ]);
    },
    zoomend: (event) => {
      const target = event.target as L.Map;
      const bounds = target.getBounds();
      onBoundsChange([
        [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
        [bounds.getNorthEast().lat, bounds.getNorthEast().lng],
      ]);
    },
  });

  useEffect(() => {
    const bounds = map.getBounds();
    onBoundsChange([
      [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
      [bounds.getNorthEast().lat, bounds.getNorthEast().lng],
    ]);
  }, [map, onBoundsChange]);

  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  config,
  places,
  selectedPlaceId,
  onSelectPlace,
  onBoundsChange,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRefs = useRef<Record<string, L.Marker | null>>({});
  const isMobile = useIsMobile();
  const selectedPlace = useMemo(
    () => places.find((place) => getPlaceId(place) === selectedPlaceId) || null,
    [places, selectedPlaceId]
  );
  const [mobilePlace, setMobilePlace] = useState<Place | null>(null);

  const defaultIcon = useMemo(
    () =>
      L.divIcon({
        className: config.markerSettings.defaultIcon.className || 'marker-default',
        iconSize: config.markerSettings.defaultIcon.iconSize,
        iconAnchor: config.markerSettings.defaultIcon.iconAnchor,
        html: '<div></div>',
      }),
    [config.markerSettings.defaultIcon]
  );

  const activeIcon = useMemo(
    () =>
      L.divIcon({
        className: config.markerSettings.customIcon.className || 'marker-active',
        iconSize: config.markerSettings.customIcon.iconSize,
        iconAnchor: config.markerSettings.customIcon.iconAnchor,
        html: '<div></div>',
      }),
    [config.markerSettings.customIcon]
  );

  const clusterOptions = useMemo<L.MarkerClusterGroupOptions>(
    () => ({
      disableClusteringAtZoom: config.mapSettings.clusterSettings.disableClusteringAtZoom,
      maxClusterRadius: config.mapSettings.clusterSettings.maxClusterRadius,
      spiderfyOnMaxZoom: config.mapSettings.clusterSettings.spiderfyOnMaxZoom,
      iconCreateFunction: (cluster) =>
        L.divIcon({
          html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
          className: 'marker-cluster',
          iconSize: [40, 40],
        }),
    }),
    [config.mapSettings.clusterSettings]
  );

  const tileSubdomains = useMemo(
    () => config.mapSettings.tileLayer.subdomains.split(''),
    [config.mapSettings.tileLayer.subdomains]
  );

  useEffect(() => {
    if (selectedPlace) {
      const marker = markerRefs.current[getPlaceId(selectedPlace)];
      if (marker && mapRef.current) {
        marker.openPopup();
        mapRef.current.flyTo(marker.getLatLng(), Math.max(mapRef.current.getZoom(), 15), {
          duration: 0.6,
        });
      }
      if (isMobile) {
        setMobilePlace(selectedPlace);
      }
    } else {
      Object.values(markerRefs.current).forEach((marker) => {
        marker?.closePopup();
      });
      setMobilePlace(null);
    }
  }, [selectedPlace, isMobile]);

  useEffect(() => {
    return () => {
      mapRef.current = null;
      markerRefs.current = {};
    };
  }, []);

  const handleSelectPlace = (place: Place) => {
    const id = getPlaceId(place);
    onSelectPlace(id);
    if (isMobile) {
      setMobilePlace(place);
    }
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapRef.current) {
          mapRef.current.flyTo([latitude, longitude], Math.max(mapRef.current.getZoom(), 15), {
            duration: 0.6,
          });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <MapWrapper>
      <MapContainer
        center={config.mapSettings.center}
        zoom={config.mapSettings.initialZoom}
        maxZoom={config.mapSettings.maxZoom}
        style={{ width: '100%', height: '100%' }}
        whenCreated={(map) => {
          mapRef.current = map;
          const bounds = map.getBounds();
          onBoundsChange([
            [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
            [bounds.getNorthEast().lat, bounds.getNorthEast().lng],
          ]);
        }}
      >
        <TileLayer
          url={config.mapSettings.tileLayer.url}
          subdomains={tileSubdomains}
          attribution={config.mapSettings.tileLayer.attribution}
        />

        <MarkerClusterGroup options={clusterOptions}>
          {places.map((place) => {
            const id = getPlaceId(place);
            const isSelected = id === selectedPlaceId;
            return (
              <Marker
                key={id}
                position={[place.lat, place.lng]}
                icon={isSelected ? activeIcon : defaultIcon}
                ref={(marker) => {
                  if (marker) {
                    markerRefs.current[id] = marker;
                  } else {
                    delete markerRefs.current[id];
                  }
                }}
                eventHandlers={{
                  click: () => handleSelectPlace(place),
                }}
              >
                <Tooltip direction="top" permanent={false} className="place-label">
                  {place.name}
                </Tooltip>
                <Popup>
                  <PopupContent className="place-card">
                    <img src={place.image} alt={place.name} className="place-image" />
                    <div className="place-content">
                      <h3>{place.name}</h3>
                      <p>{place.description}</p>
                      <div className="place-links-social">
                        {place.instagram && (
                          <a href={place.instagram} target="_blank" rel="noreferrer">
                            <img src="/data/images/instagram.svg" alt="Instagram" />
                          </a>
                        )}
                        {place.maps_url && (
                          <a href={place.maps_url} target="_blank" rel="noreferrer">
                            <img src="/data/images/google.svg" alt="Google Maps" />
                          </a>
                        )}
                      </div>
                    </div>
                  </PopupContent>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>

        <MapBoundsWatcher onBoundsChange={onBoundsChange} />
      </MapContainer>

      <GeolocateButton onClick={handleGeolocate} type="button">
        {config.content.buttonLabels.showNearby}
      </GeolocateButton>

      {isMobile && (
        <MobilePlacePopup
          place={mobilePlace}
          onClose={() => {
            setMobilePlace(null);
            onSelectPlace(null);
          }}
        />
      )}
    </MapWrapper>
  );
};
