import { create } from '../zustand';

type BoundsArray = [[number, number], [number, number]] | null;

type PlacesState = {
  activeFilters: string[];
  selectedPlaceId: string | null;
  isListOpen: boolean;
  bounds: BoundsArray;
  setFilters: (filters: string[]) => void;
  toggleFilter: (filter: string) => void;
  resetFilters: () => void;
  setSelectedPlace: (placeId: string | null) => void;
  openList: () => void;
  closeList: () => void;
  setBounds: (bounds: BoundsArray) => void;
};

const initialListState = typeof window !== 'undefined' ? window.innerWidth > 768 : true;

export const usePlacesStore = create<PlacesState>((set) => ({
  activeFilters: [],
  selectedPlaceId: null,
  isListOpen: initialListState,
  bounds: null,
  setFilters: (filters) => set({ activeFilters: filters }),
  toggleFilter: (filter) =>
    set((state) => {
      const exists = state.activeFilters.includes(filter);
      return {
        activeFilters: exists
          ? state.activeFilters.filter((item) => item !== filter)
          : [...state.activeFilters, filter],
      };
    }),
  resetFilters: () => set({ activeFilters: [] }),
  setSelectedPlace: (placeId) => set({ selectedPlaceId: placeId }),
  openList: () => set({ isListOpen: true }),
  closeList: () => set({ isListOpen: false }),
  setBounds: (bounds) => set({ bounds }),
}));

export type { BoundsArray };
