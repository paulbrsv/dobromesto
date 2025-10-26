import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { LayerContainerContext, useMap } from 'react-leaflet';

export interface MarkerClusterGroupProps {
  options?: L.MarkerClusterGroupOptions;
  children?: React.ReactNode;
}

export const MarkerClusterGroup: React.FC<MarkerClusterGroupProps> = ({ children, options }) => {
  const map = useMap();
  const [clusterGroup, setClusterGroup] = useState<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    const group = L.markerClusterGroup(options);
    map.addLayer(group);
    setClusterGroup(group);

    return () => {
      map.removeLayer(group);
      setClusterGroup(null);
    };
  }, [map, options]);

  if (!clusterGroup) {
    return null;
  }

  return (
    <LayerContainerContext.Provider value={clusterGroup}>
      {children}
    </LayerContainerContext.Provider>
  );
};
