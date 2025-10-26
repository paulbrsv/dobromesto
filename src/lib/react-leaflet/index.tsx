import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from 'react';
import { createPortal } from 'react-dom';
import L, {
  LatLngExpression,
  LeafletEvent,
  LeafletEventHandlerFnMap,
  Map as LeafletMap,
  MapOptions,
  Marker as LeafletMarker,
  MarkerOptions,
  TileLayerOptions,
  Tooltip as LeafletTooltip,
  TooltipOptions,
  Popup as LeafletPopup,
  PopupOptions,
  Layer as LeafletLayer,
  LayerGroup as LeafletLayerGroup,
} from 'leaflet';

export type MapContainerProps = PropsWithChildren<
  {
    center: LatLngExpression;
    zoom: number;
    className?: string;
    style?: React.CSSProperties;
    whenCreated?: (map: LeafletMap) => void;
  } & MapOptions
>;

const MapContext = createContext<LeafletMap | null>(null);
export const LayerContainerContext = createContext<LeafletMap | LeafletLayerGroup<any> | null>(null);
const LayerContext = createContext<LeafletLayer | null>(null);

export const MapContainer: React.FC<MapContainerProps> = ({
  children,
  center,
  zoom,
  className,
  style,
  whenCreated,
  ...options
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<LeafletMap | null>(null);

  useEffect(() => {
    if (containerRef.current && !map) {
      const mapInstance = L.map(containerRef.current, options);
      mapInstance.setView(center, zoom);
      setMap(mapInstance);
      whenCreated?.(mapInstance);

      return () => {
        mapInstance.remove();
      };
    }

    return () => undefined;
  }, [center, zoom, map, options, whenCreated]);

  useEffect(() => {
    if (map) {
      map.setView(center, map.getZoom());
    }
  }, [map, center]);

  useEffect(() => {
    if (map && typeof zoom === 'number') {
      map.setZoom(zoom);
    }
  }, [map, zoom]);

  const mergedStyle = useMemo(() => ({ width: '100%', height: '100%', ...style }), [style]);

  return (
    <MapContext.Provider value={map}>
      <LayerContainerContext.Provider value={map}>
        <div ref={containerRef} className={className} style={mergedStyle} />
        {map ? children : null}
      </LayerContainerContext.Provider>
    </MapContext.Provider>
  );
};

export const useMap = (): LeafletMap => {
  const map = useContext(MapContext);
  if (!map) {
    throw new Error('useMap must be used inside a MapContainer');
  }

  return map;
};

export const useMapEvents = (handlers: Partial<Record<string, (event: LeafletEvent) => void>>): LeafletMap => {
  const map = useMap();
  const handlersRef = useRef(handlers);

  handlersRef.current = handlers;

  useEffect(() => {
    const currentHandlers = handlersRef.current;
    Object.entries(currentHandlers).forEach(([event, handler]) => {
      if (handler) {
        map.on(event as any, handler);
      }
    });

    return () => {
      Object.entries(currentHandlers).forEach(([event, handler]) => {
        if (handler) {
          map.off(event as any, handler);
        }
      });
    };
  }, [map]);

  return map;
};

export type TileLayerProps = PropsWithChildren<{
  url: string;
} & TileLayerOptions>;

export const TileLayer: React.FC<TileLayerProps> = ({ url, children, ...options }) => {
  const map = useMap();
  const layerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!layerRef.current) {
      const layer = L.tileLayer(url, options);
      layer.addTo(map);
      layerRef.current = layer;

      return () => {
        layer.remove();
      };
    }

    return () => undefined;
  }, [map, url, options]);

  useEffect(() => {
    if (layerRef.current) {
      layerRef.current.setUrl(url);
    }
  }, [url]);

  return <>{children}</>;
};

export interface MarkerProps extends PropsWithChildren<{
  position: LatLngExpression;
  icon?: L.Icon | L.DivIcon;
  eventHandlers?: Partial<LeafletEventHandlerFnMap>;
}> {
  options?: Omit<MarkerOptions, 'icon'>;
}

export const Marker = forwardRef<LeafletMarker | null, MarkerProps>(
  ({ position, icon, eventHandlers, options, children }, ref) => {
    const map = useMap();
    const parentLayer = useContext(LayerContainerContext);
    const markerRef = useRef<LeafletMarker | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
      const marker = L.marker(position, { ...(options || {}), icon });
      const container = parentLayer ?? map;

      if ('addLayer' in container) {
        container.addLayer(marker);
      }

      markerRef.current = marker;
      setReady(true);

      return () => {
        if ('removeLayer' in container) {
          container.removeLayer(marker);
        }
        marker.remove();
        markerRef.current = null;
        setReady(false);
      };
    }, [map, parentLayer]);

    useEffect(() => {
      const marker = markerRef.current;
      if (!marker) return;

      marker.setLatLng(position);
    }, [position]);

    useEffect(() => {
      if (icon && markerRef.current) {
        markerRef.current.setIcon(icon);
      }
    }, [icon]);

    useEffect(() => {
      const marker = markerRef.current;
      if (!marker || !eventHandlers) return;

      Object.entries(eventHandlers).forEach(([event, handler]) => {
        if (handler) {
          marker.on(event as any, handler);
        }
      });

      return () => {
        Object.entries(eventHandlers).forEach(([event, handler]) => {
          if (handler) {
            marker.off(event as any, handler);
          }
        });
      };
    }, [eventHandlers]);

    useImperativeHandle(ref, () => markerRef.current);

    return ready && markerRef.current ? (
      <LayerContext.Provider value={markerRef.current}>{children}</LayerContext.Provider>
    ) : null;
  }
);

Marker.displayName = 'Marker';

export interface PopupProps extends PropsWithChildren<PopupOptions> {
  eventHandlers?: Partial<LeafletEventHandlerFnMap>;
}

export const Popup: React.FC<PopupProps> = ({ children, eventHandlers, ...options }) => {
  const layer = useContext(LayerContext);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const popupRef = useRef<LeafletPopup | null>(null);

  useEffect(() => {
    if (!layer) {
      return;
    }

    const popup = L.popup(options);
    const content = document.createElement('div');
    popup.setContent(content);
    (layer as any).bindPopup(popup);

    popupRef.current = popup;
    setContainer(content);

    if (eventHandlers) {
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        if (handler) {
          popup.on(event as any, handler);
        }
      });
    }

    return () => {
      if (eventHandlers) {
        Object.entries(eventHandlers).forEach(([event, handler]) => {
          if (handler) {
            popup.off(event as any, handler);
          }
        });
      }

      (layer as any).unbindPopup();
      popupRef.current = null;
      setContainer(null);
    };
  }, [layer, options, eventHandlers]);

  if (!container) {
    return null;
  }

  return createPortal(children, container);
};

export interface TooltipProps extends PropsWithChildren<TooltipOptions> {
  eventHandlers?: Partial<LeafletEventHandlerFnMap>;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, eventHandlers, ...options }) => {
  const layer = useContext(LayerContext);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const tooltipRef = useRef<LeafletTooltip | null>(null);

  useEffect(() => {
    if (!layer) {
      return;
    }

    const tooltip = L.tooltip(options);
    const content = document.createElement('div');
    tooltip.setContent(content);
    (layer as any).bindTooltip(tooltip);

    tooltipRef.current = tooltip;
    setContainer(content);

    if (eventHandlers) {
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        if (handler) {
          tooltip.on(event as any, handler);
        }
      });
    }

    return () => {
      if (eventHandlers) {
        Object.entries(eventHandlers).forEach(([event, handler]) => {
          if (handler) {
            tooltip.off(event as any, handler);
          }
        });
      }

      (layer as any).unbindTooltip();
      tooltipRef.current = null;
      setContainer(null);
    };
  }, [layer, options, eventHandlers]);

  if (!container) {
    return null;
  }

  return createPortal(children, container);
};

export const useLayer = () => useContext(LayerContext);
