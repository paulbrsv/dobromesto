import { useCallback, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { Place, AppConfig } from '../types/places';

export const useMapMarkers = (config: AppConfig) => {
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);
  const activeMarkerRef = useRef<L.Marker | null>(null);

  const createDefaultIcon = useCallback(() => {
    return L.divIcon({
      className: config.markerSettings.defaultIcon.className,
      iconSize: config.markerSettings.defaultIcon.iconSize,
      iconAnchor: config.markerSettings.defaultIcon.iconAnchor
    });
  }, [config]);

  const createCustomIcon = useCallback(() => {
    return L.divIcon({
      className: config.markerSettings.customIcon.className,
      iconSize: config.markerSettings.customIcon.iconSize,
      iconAnchor: config.markerSettings.customIcon.iconAnchor,
      popupAnchor: config.markerSettings.customIcon.popupAnchor
    });
  }, [config]);

  const createMarkerClusterGroup = useCallback(() => {
    return L.markerClusterGroup({
      iconCreateFunction: (cluster) => {
        return L.divIcon({
          html: config.mapSettings.clusterSettings.clusterIconTemplate.replace(
            '${cluster.getChildCount()}',
            cluster.getChildCount().toString()
          ),
          className: 'marker-cluster',
          iconSize: [30, 30]
        });
      },
      disableClusteringAtZoom: config.mapSettings.clusterSettings.disableClusteringAtZoom,
      spiderfyOnMaxZoom: false,
      maxClusterRadius: config.mapSettings.clusterSettings.maxClusterRadius,
      zoomToBoundsOnClick: false
    });
  }, [config]);

  const createMarkers = useCallback((places: Place[], map: L.Map, onMarkerClick: (place: Place) => void) => {
    if (markersRef.current) {
      markersRef.current.clearLayers();
    } else {
      markersRef.current = createMarkerClusterGroup();
    }

    const defaultIcon = createDefaultIcon();
    const customIcon = createCustomIcon();

    places.forEach(place => {
      const marker = L.marker([place.lat, place.lng], { icon: defaultIcon });
      
      marker.bindTooltip(place.name, {
        permanent: true,
        direction: 'bottom',
        offset: [0, 5],
        className: 'place-label',
        opacity: 0
      });

      marker.on('click', () => {
        if (activeMarkerRef.current && activeMarkerRef.current !== marker) {
          activeMarkerRef.current.setIcon(defaultIcon);
        }

        marker.setIcon(customIcon);
        activeMarkerRef.current = marker;
        onMarkerClick(place);
      });

      markersRef.current?.addLayer(marker);
    });

    markersRef.current.on('clusterclick', (e: L.LeafletEvent) => {
      const cluster = e.layer as L.MarkerCluster;
      const childMarkers = cluster.getAllChildMarkers();

      if (childMarkers.length === 1) {
        childMarkers[0].fire('click');
      } else {
        map.setView(cluster.getLatLng(), 16, { animate: true });
      }
    });

    return markersRef.current;
  }, [config, createDefaultIcon, createCustomIcon, createMarkerClusterGroup]);

  const updateMarkers = useCallback((places: Place[], map: L.Map, onMarkerClick: (place: Place) => void) => {
    createMarkers(places, map, onMarkerClick);
  }, [createMarkers]);

  return {
    markers: markersRef.current,
    createMarkers,
    updateMarkers
  };
};

export default useMapMarkers; 