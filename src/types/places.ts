export interface Place {
  name: string;
  lat: number;
  lng: number;
  shirt_description: string;
  description: string;
  link: string;
  instagram: string;
  maps_url: string;
  image: string;
  attributes: string[];
  verified: boolean;
}

export interface Filter {
  key: string;
  label: string;
  tooltip: string;
  icon: string;
}

export interface FilterGroup {
  leftFilters: Filter[];
  rightFilters: Filter[];
}

export interface MapSettings {
  center: [number, number];
  initialZoom: number;
  maxZoom: number;
  clusterSettings: {
    disableClusteringAtZoom: number;
    maxClusterRadius: number;
    spiderfyOnMaxZoom: boolean;
    clusterIconTemplate: string;
  };
  tileLayer: {
    url: string;
    attribution: string;
    subdomains: string;
  };
}

export interface MarkerSettings {
  defaultIcon: {
    className: string;
    iconSize: [number, number];
    iconAnchor: [number, number];
  };
  customIcon: {
    className: string;
    iconSize: [number, number];
    iconAnchor: [number, number];
    popupAnchor: [number, number];
  };
}

export interface StyleSettings {
  socialIconSize: [number, number];
  filterIconSize: [number, number];
  placeLinksFilterIconSize: [number, number];
  popupMinHeight: {
    desktop: number;
    mobile: number;
  };
  colors: {
    primary: string;
    secondary: string;
    hover: string;
    closeButton: string;
    textSecondary: string;
    text: string;
    background: string;
  };
}

export interface AppConfig {
  filters: FilterGroup;
  templates: {
    placeCardList: string;
    placeCardPopup: string;
  };
  mapSettings: MapSettings;
  markerSettings: MarkerSettings;
  styleSettings: StyleSettings;
  content: {
    cities: Array<{
      name: string;
      disabled: boolean;
    }>;
    navLinks: Array<{
      label: string;
      href: string;
    }>;
    buttonLabels: {
      showList: string;
      close: string;
      showNearby: string;
    };
    footerText: string;
  };
}

export default Place;