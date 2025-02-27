import { updateMap, map } from './map.js';
import { resetHighlight } from '../utils/helpers.js';

let activeFilters = [];

export function initFilters() {
  document.querySelectorAll('.filter').forEach(filter => {
    filter.addEventListener('click', () => {
      const filterId = filter.dataset.filter;
      if (activeFilters.includes(filterId)) {
        activeFilters = activeFilters.filter(f => f !== filterId);
        filter.classList.remove('active');
      } else {
        activeFilters.push(filterId);
        filter.classList.add('active');
      }
      resetHighlight();
      updateMap(activeFilters);
    });
  });

  document.querySelectorAll('.filter-reset').forEach(resetButton => {
    resetButton.addEventListener('click', () => {
      activeFilters = [];
      document.querySelectorAll('.filter').forEach(filter => filter.classList.remove('active'));
      resetHighlight();
      map.setView([45.25, 19.85], 14);
      updateMap(activeFilters);
    });
  });
}

export function getActiveFilters() {
  return activeFilters;
}
