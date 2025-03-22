import React, { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Place, AppConfig } from '../../types/places';
import { styled } from 'styled-components';

// Fix for default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface MapProps {
  places: Place[];
  config: AppConfig;
  onMarkerClick: (place: Place) => void;
  selectedPlace?: Place | null;
  mapRef: React.MutableRefObject<L.Map | null>;
  onPopupClose?: () => void;
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
}

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;

  /* Дополнительные фиксы для iOS устройств */
  @supports (-webkit-touch-callout: none) {
    position: fixed !important;
    top: 56px !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    height: calc(100vh - 56px) !important;
  }

  /* Фикс для всех мобильных устройств */
  @media (max-width: 768px) {
    position: fixed !important;
    top: 56px !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    height: calc(100vh - 56px) !important;
  }
`;

// Создаем стиль для контейнера контента на мобильных устройствах
const ContentContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  /* Дополнительные фиксы для iOS устройств */
  @supports (-webkit-touch-callout: none) {
    position: fixed !important;
    top: 56px !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    height: calc(100vh - 56px) !important;
    overflow: hidden !important;
  }

  /* Фикс для всех мобильных устройств */
  @media (max-width: 768px) {
    position: fixed !important;
    top: 56px !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    height: calc(100vh - 56px) !important;
    overflow: hidden !important;
  }
`;

// Расширяем интерфейс MapOptions для поддержки дополнительных свойств
declare module 'leaflet' {
  interface MapOptions {
    tap?: boolean;
  }

  interface TileLayerOptions {
    preferCanvas?: boolean;
  }
}

const createPopupContent = (place: Place) => `
  <div class="place-card">
    <img src="${place.image}" alt="${place.name}" class="place-image" style="width: 100%; height: 200px; object-fit: cover;" />
    <div class="place-content" style="padding: 15px;">
      <h3 style="margin: 0; font-size: 18px;">${place.name}</h3>
      <p style="margin: 10px 0; font-size: 14px;">${place.description}</p>
      <div class="place-links-social" style="margin-top: 10px;">
        ${place.instagram ? `<a href="${place.instagram}" target="_blank"><img src="/data/images/instagram.svg" alt="Instagram" style="width: 27px; height: 27px;" /></a>` : ''}
        ${place.maps_url ? `<a href="${place.maps_url}" target="_blank"><img src="/data/images/google.svg" alt="Google Maps" style="width: 27px; height: 27px;" /></a>` : ''}
      </div>
    </div>
  </div>
`;

export const Map: React.FC<MapProps> = ({ places, config, onMarkerClick, selectedPlace, mapRef, onPopupClose, onBoundsChange }) => {
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);
  const activeMarkerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mobilePopupRef = useRef<HTMLDivElement | null>(null);
  // Флаг для отслеживания программного закрытия попапа
  const isProgrammaticClose = useRef(false);

  // Создаем мобильный попап
  useEffect(() => {
    if (!mobilePopupRef.current) {
      const popupDiv = document.createElement('div');
      popupDiv.className = 'map-popup-mobile';
      document.body.appendChild(popupDiv);
      mobilePopupRef.current = popupDiv;

      return () => {
        document.body.removeChild(popupDiv);
        mobilePopupRef.current = null;
      };
    }
  }, []);

  const showMobilePopup = useCallback((place: Place) => {
    if (!mobilePopupRef.current) return;

    const popupContent = `
      <div class="place-card">
        <img src="${place.image}" alt="${place.name}" class="place-image" />
        <div class="place-content">
          <h3>${place.name}</h3>
          <p>${place.description}</p>
          <div class="place-links-social">
            ${place.instagram ? `<a href="${place.instagram}" target="_blank"><img src="/data/images/instagram.svg" alt="Instagram" /></a>` : ''}
            ${place.maps_url ? `<a href="${place.maps_url}" target="_blank"><img src="/data/images/google.svg" alt="Google Maps" /></a>` : ''}
          </div>
        </div>
        <button class="close-btn-mobile">×</button>
      </div>
    `;

    mobilePopupRef.current.innerHTML = popupContent;
    mobilePopupRef.current.classList.add('active');

    const closeBtn = mobilePopupRef.current.querySelector('.close-btn-mobile');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (mobilePopupRef.current) {
          mobilePopupRef.current.classList.remove('active');
          if (activeMarkerRef.current) {
            activeMarkerRef.current.setIcon(createDefaultIcon());
            activeMarkerRef.current = null;
          }

          // Сообщаем, что попап закрыт, чтобы сбросить selectedPlace
          if (onPopupClose) {
            onPopupClose();
          }
        }
      });
    }
  }, [onPopupClose]);

  const createDefaultIcon = useCallback(() => {
    console.log('Creating default icon');
    return L.divIcon({
      className: 'marker-default',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      html: '<div></div>'
    });
  }, []);

  const createCustomIcon = useCallback(() => {
    console.log('Creating custom icon');
    return L.divIcon({
      className: 'marker-active',
      iconSize: [30, 40],
      iconAnchor: [15, 40],
      popupAnchor: [0, -40],
      html: '<div></div>'
    });
  }, []);

  const createMarkerClusterGroup = useCallback(() => {
    console.log('Creating marker cluster group with settings:', config.mapSettings.clusterSettings);
    return L.markerClusterGroup({
      iconCreateFunction: (cluster: L.MarkerCluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div class="cluster-icon">${count}</div>`,
          className: 'marker-cluster',
          iconSize: L.point(40, 40)
        });
      },
      disableClusteringAtZoom: config.mapSettings.clusterSettings.disableClusteringAtZoom,
      spiderfyOnMaxZoom: false,
      maxClusterRadius: config.mapSettings.clusterSettings.maxClusterRadius,
      zoomToBoundsOnClick: false,
      showCoverageOnHover: false,
      animate: true,
      animateAddingMarkers: false
    });
  }, [config.mapSettings.clusterSettings]);

  const updateMarkers = useCallback(() => {
    console.log('Updating markers');
    if (!mapRef.current || !markersRef.current) return;

    // Очищаем все слои, включая предыдущие маркеры
    markersRef.current.clearLayers();

    // Сбрасываем активный маркер
    activeMarkerRef.current = null;

    const defaultIcon = createDefaultIcon();
    const customIcon = createCustomIcon();

    // Создаем маркеры с tooltips
    const markers: L.Marker[] = [];
    places.forEach(place => {
      const marker = L.marker([place.lat, place.lng], {
        icon: defaultIcon,
        riseOnHover: true,
        riseOffset: 250
      });

      if (window.innerWidth > 768) {
        const popup = L.popup({
          maxWidth: 500,
          className: 'place-popup',
          closeButton: true,
          closeOnClick: false,
          autoPan: true,
          autoPanPadding: [50, 50]
        }).setContent(createPopupContent(place));

        marker.bindPopup(popup);
      }

      // Создаем tooltip и делаем его невидимым по умолчанию
      marker.bindTooltip(place.name, {
        permanent: true,
        direction: 'bottom',
        offset: [0, 5],
        className: 'place-label',
        opacity: 0
      });

      // Добавляем место в данные маркера для доступа в дальнейшем
      (marker as any).place = place;

      marker.on('click', () => {
        console.log('Marker clicked:', place.name);

        // При клике на тот же маркер, отменяем выбор
        if (activeMarkerRef.current === marker) {
          marker.setIcon(defaultIcon);
          if (window.innerWidth > 768) {
            isProgrammaticClose.current = true;
            marker.closePopup();
          }
          activeMarkerRef.current = null;
          onMarkerClick(place); // Передаем повторный клик для отмены выбора
          return;
        }

        // При клике на другой маркер
        if (activeMarkerRef.current && activeMarkerRef.current !== marker) {
          activeMarkerRef.current.setIcon(defaultIcon);
          if (window.innerWidth > 768) {
            isProgrammaticClose.current = true;
            activeMarkerRef.current.closePopup();
          }
        }

        marker.setIcon(customIcon);
        activeMarkerRef.current = marker;

        // Центрируем карту с проверкой зума
        const currentZoom = mapRef.current?.getZoom() || 0;
        const targetZoom = currentZoom >= 16 ? currentZoom : 16;

        mapRef.current?.setView(marker.getLatLng(), targetZoom, {
          animate: true,
          duration: 0.5
        });

        if (window.innerWidth > 768) {
          marker.openPopup();
        } else {
          showMobilePopup(place);
        }

        onMarkerClick(place);
      });

      markers.push(marker);
      markersRef.current?.addLayer(marker);

      // Устанавливаем активный маркер для выбранного места
      if (selectedPlace && selectedPlace.name === place.name) {
        console.log('Setting active marker for selected place:', place.name);
        marker.setIcon(customIcon);
        activeMarkerRef.current = marker;

        if (window.innerWidth > 768) {
          marker.openPopup();
        } else {
          showMobilePopup(place);
        }
      }
    });

    // Функция для проверки наложения меток
    const shouldShowLabel = (marker: L.Marker, visibleMarkers: L.Marker[]): boolean => {
      // Одиночные метки всегда показываем
      if (visibleMarkers.length <= 1) return true;

      const markerPoint = mapRef.current?.latLngToContainerPoint(marker.getLatLng());
      if (!markerPoint) return false;

      // Минимальное расстояние между метками в пикселях
      const minDistance = 100;

      // Проверяем расстояние до других видимых меток
      for (const otherMarker of visibleMarkers) {
        if (marker === otherMarker) continue;

        const otherPoint = mapRef.current?.latLngToContainerPoint(otherMarker.getLatLng());
        if (!otherPoint) continue;

        const distance = markerPoint.distanceTo(otherPoint);
        if (distance < minDistance) {
          // Если метки слишком близко, показываем только ту, что ближе к центру экрана
          const center = mapRef.current?.getCenter();
          if (!center) continue;

          const centerPoint = mapRef.current?.latLngToContainerPoint(center);
          if (!centerPoint) continue;

          const distToCenter = markerPoint.distanceTo(centerPoint);
          const otherDistToCenter = otherPoint.distanceTo(centerPoint);

          // Если эта метка дальше от центра, скрываем её
          if (distToCenter > otherDistToCenter) {
            return false;
          }
        }
      }

      return true;
    };

    // Обновляем видимость названий меток при изменении зума или видимых маркеров
    const updateLabelsVisibility = () => {
      if (!mapRef.current || !markersRef.current) return;

      const zoom = mapRef.current.getZoom();
      const allMarkers = markers;

      // Для небольшого зума скрываем все названия
      if (zoom < 14) {
        allMarkers.forEach(marker => {
          const tooltip = marker.getTooltip();
          if (tooltip) tooltip.setOpacity(0);
        });
        return;
      }

      // Получаем все маркеры, которые видны на экране (не в кластерах)
      const visibleMarkers: L.Marker[] = [];
      allMarkers.forEach(marker => {
        // Проверяем, является ли родитель маркера кластером
        const parent = markersRef.current?.getVisibleParent(marker);
        if (parent === marker) {
          visibleMarkers.push(marker);
        }
      });

      // Обновляем видимость для каждого видимого маркера
      visibleMarkers.forEach(marker => {
        const tooltip = marker.getTooltip();
        if (!tooltip) return;

        if (shouldShowLabel(marker, visibleMarkers)) {
          tooltip.setOpacity(1);
        } else {
          tooltip.setOpacity(0);
        }
      });

      // Скрываем названия для маркеров в кластерах
      allMarkers.forEach(marker => {
        if (!visibleMarkers.includes(marker)) {
          const tooltip = marker.getTooltip();
          if (tooltip) tooltip.setOpacity(0);
        }
      });
    };

    // Добавляем обработчик клика на кластер
    markersRef.current.on('clusterclick', (e: L.LeafletEvent) => {
      const cluster = e.layer as L.MarkerCluster;
      const childMarkers = cluster.getAllChildMarkers();

      if (childMarkers.length === 1) {
        childMarkers[0].fire('click');
      } else {
        mapRef.current?.setView(cluster.getLatLng(), 16, { animate: true });
      }

      // Обновляем видимость названий после раскрытия кластера
      setTimeout(updateLabelsVisibility, 300);
    });

    // События, при которых нужно обновлять видимость названий
    mapRef.current.on('zoomend', updateLabelsVisibility);
    mapRef.current.on('moveend', updateLabelsVisibility);
    markersRef.current.on('animationend', updateLabelsVisibility);

    // Обновляем сразу после создания маркеров
    setTimeout(updateLabelsVisibility, 100);
  }, [places, selectedPlace, createDefaultIcon, createCustomIcon, onMarkerClick, showMobilePopup]);

  useEffect(() => {
    console.log('Initializing map');
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: config.mapSettings.center,
      zoom: config.mapSettings.initialZoom,
      scrollWheelZoom: true,
      closePopupOnClick: true,
      tap: true,
      attributionControl: false,
      zoomControl: false,
      maxZoom: config.mapSettings.maxZoom,
      minZoom: config.mapSettings.initialZoom - 2,
      bounceAtZoomLimits: false,
      touchZoom: 'center',
      doubleClickZoom: 'center'
    });

    L.tileLayer(config.mapSettings.tileLayer.url, {
      attribution: config.mapSettings.tileLayer.attribution,
      subdomains: config.mapSettings.tileLayer.subdomains,
      maxZoom: config.mapSettings.maxZoom,
      minZoom: config.mapSettings.initialZoom - 2,
      preferCanvas: true
    }).addTo(map);

    L.control.attribution({
      position: 'bottomright',
      prefix: false
    }).addTo(map);

    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    mapRef.current = map;
    markersRef.current = createMarkerClusterGroup();
    map.addLayer(markersRef.current);

    const handleResize = () => {
      console.log('Window resized, updating map size');
      map.invalidateSize({ animate: false, pan: false });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    setTimeout(handleResize, 100);

    return () => {
      console.log('Cleaning up map');
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, [config, createMarkerClusterGroup]);

  useEffect(() => {
    if (mapRef.current && markersRef.current) {
      console.log('Updating markers after dependency change');
      updateMarkers();

      // Добавляем обработчик события закрытия попапа
      const popupCloseHandler = () => {
        // Обрабатываем только если закрытие не программное
        if (!isProgrammaticClose.current) {
          if (activeMarkerRef.current) {
            // Только если закрытие инициировано пользователем
            activeMarkerRef.current.setIcon(createDefaultIcon());
            activeMarkerRef.current = null;

            // Сообщаем, что попап закрыт пользователем
            if (onPopupClose) {
              onPopupClose();
            }
          }
        }
        // Сбрасываем флаг после использования
        isProgrammaticClose.current = false;
      };

      // Удаляем старый обработчик, если он есть, и добавляем новый
      mapRef.current.off('popupclose');
      mapRef.current.on('popupclose', popupCloseHandler);

      return () => {
        if (mapRef.current) {
          mapRef.current.off('popupclose', popupCloseHandler);
        }
      };
    }
  }, [updateMarkers, createDefaultIcon, onPopupClose]);

  // Обрабатываем изменение selectedPlace
  useEffect(() => {
    if (!mapRef.current || !selectedPlace) return;

    // Пытаемся найти маркер для выбранного места
    const allLayers = markersRef.current?.getLayers() || [];
    const allMarkers = allLayers as L.Marker[];

    // Маркер не найден, обновляем все маркеры
    if (allMarkers.length === 0) {
      updateMarkers();
      return;
    }

    // Центрируем карту на выбранном месте если selectedPlace изменился
    const currentZoom = mapRef.current.getZoom();
    const targetZoom = currentZoom >= 16 ? currentZoom : 16;

    mapRef.current.setView([selectedPlace.lat, selectedPlace.lng], targetZoom, {
      animate: true,
      duration: 0.5
    });
  }, [selectedPlace, updateMarkers]);

  // Отслеживаем изменения границ карты
  useEffect(() => {
    if (!mapRef.current || !onBoundsChange) return;

    const handleMove = () => {
      const bounds = mapRef.current?.getBounds();
      if (bounds) {
        onBoundsChange(bounds);
      }
    };

    mapRef.current.on('moveend', handleMove);
    mapRef.current.on('zoomend', handleMove);

    // Вызываем handleMove сразу для установки начальных границ
    handleMove();

    return () => {
      if (mapRef.current) {
        mapRef.current.off('moveend', handleMove);
        mapRef.current.off('zoomend', handleMove);
      }
    };
  }, [mapRef, onBoundsChange]);

  // Предотвращаем скроллинг страницы при взаимодействии с картой на мобильных устройствах
  useEffect(() => {
    if (!mapRef.current) return;

    const preventBodyScrolling = (e: Event) => {
      e.preventDefault();
    };

    const handleMapTouch = () => {
      document.body.style.overflow = 'hidden';
      document.addEventListener('touchmove', preventBodyScrolling, { passive: false });
    };

    const handleMapTouchEnd = () => {
      document.body.style.overflow = '';
      document.removeEventListener('touchmove', preventBodyScrolling);
    };

    const mapElement = mapRef.current.getContainer();
    mapElement.addEventListener('touchstart', handleMapTouch);
    mapElement.addEventListener('touchend', handleMapTouchEnd);
    mapElement.addEventListener('touchcancel', handleMapTouchEnd);

    return () => {
      mapElement.removeEventListener('touchstart', handleMapTouch);
      mapElement.removeEventListener('touchend', handleMapTouchEnd);
      mapElement.removeEventListener('touchcancel', handleMapTouchEnd);
    };
  }, [mapRef]);

  return (
    <ContentContainer>
      <MapContainer ref={containerRef} />
    </ContentContainer>
  );
};

export default Map;
