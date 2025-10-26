import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import type { AppConfig, Place } from './types/places';
import { useConfigQuery } from './api/config';
import { usePlacesQuery } from './api/places';

jest.mock('./features/map/MapView', () => ({
  MapView: () => <div data-testid="map-view" />,
}));

jest.mock('./api/config');
jest.mock('./api/places');

describe('App', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('renders header after loading configuration and places', async () => {
    const mockConfig: AppConfig = {
      filters: {
        leftFilters: [],
        rightFilters: [],
      },
      templates: {
        placeCardList: '',
        placeCardPopup: '',
      },
      mapSettings: {
        center: [0, 0],
        initialZoom: 12,
        maxZoom: 18,
        clusterSettings: {
          disableClusteringAtZoom: 15,
          maxClusterRadius: 80,
          spiderfyOnMaxZoom: true,
          clusterIconTemplate: '',
        },
        tileLayer: {
          url: 'https://example.com/{z}/{x}/{y}.png',
          attribution: '',
          subdomains: 'abc',
        },
      },
      markerSettings: {
        defaultIcon: {
          className: 'marker-default',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        },
        customIcon: {
          className: 'marker-active',
          iconSize: [30, 40],
          iconAnchor: [15, 40],
          popupAnchor: [0, -40],
        },
      },
      styleSettings: {
        socialIconSize: [24, 24],
        filterIconSize: [16, 16],
        placeLinksFilterIconSize: [16, 16],
        popupMinHeight: {
          desktop: 100,
          mobile: 80,
        },
        colors: {
          primary: '#333',
          secondary: '#3388ff',
          hover: '#555',
          closeButton: '#ff4444',
          textSecondary: '#666',
        },
      },
      content: {
        cities: [{ name: 'Test City', disabled: false }],
        navLinks: [],
        buttonLabels: {
          showList: 'Show list',
          close: 'Close',
          showNearby: 'Locate me',
        },
        footerText: '',
      },
    };

    const mockPlaces: Place[] = [];

    (useConfigQuery as jest.Mock).mockReturnValue({
      data: mockConfig,
      isLoading: false,
      isError: false,
      error: null,
    });

    (usePlacesQuery as jest.Mock).mockReturnValue({
      data: mockPlaces,
      isLoading: false,
      isError: false,
      error: null,
      isFetching: false,
      refetch: jest.fn(),
    });

    render(<App />);

    await waitFor(() => expect(screen.getByText(/Dobro Mesto/i)).toBeInTheDocument());
  });
});
