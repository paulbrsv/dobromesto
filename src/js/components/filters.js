import { updateMap, getMap } from './map.js';
import { resetHighlight } from '../utils/helpers.js';
import { filterNames, filterIcons, currentLang, mapConfig } from '../data/config.js';

let activeFilters = [];

export function initFilters() {
  document.querySelectorAll('.filter').forEach(filter => {
    const filterId = filter.dataset.filter;
    if (!filterId) return;

    filter.innerHTML = '';

    const iconWrapper = document.createElement('span');
    iconWrapper.className = 'filter-icon-wrapper';
    const icon = document.createElement('img');
    icon.src = filterIcons[filterId] || 'https://via.placeholder.com/16';
    icon.alt = filterNames[filterId]?.[currentLang] || filterId;
    icon.className = 'filter-icon';
    iconWrapper.appendChild(icon);

    filter.appendChild(iconWrapper);
    filter.appendChild(document.createTextNode(filterNames[filterId]?.[currentLang] || filterId));

    filter.addEventListener('click', () => {
      if (activeFilters.includes(filterId)) {
        activeFilters = activeFilters.filter(f => f !== filterId);
        filter.classList.remove('active');
      } else {
        activeFilters.push(filterId);
        filter.classList.add('active');
      }
      resetHighlight();
      updateMap(activeFilters);
      updateUrl();
    });

    // Проверяем начальное состояние из activeFilters
    if (activeFilters.includes(filterId)) {
      filter.classList.add('active');
    }
  });

  document.querySelectorAll('.filter-reset').forEach(resetButton => {
    resetButton.addEventListener('click', () => {
      activeFilters = [];
      document.querySelectorAll('.filter').forEach(filter => filter.classList.remove('active'));
      resetHighlight();
      getMap().setView(mapConfig.initialCoords, mapConfig.initialZoom);
      updateMap(activeFilters);
      updateUrl();
    });
  });
}

export function setActiveFilters(filterIds) {
  activeFilters = filterIds.filter(id => filterIcons[id]);
  console.log('Setting active filters:', activeFilters); // Отладка
  activeFilters.forEach(filterId => {
    const filterElement = document.querySelector(`.filter[data-filter="${filterId}"]`);
    if (filterElement) {
      console.log(`Activating filter: ${filterId}`); // Отладка
      filterElement.classList.add('active');
    } else {
      console.warn(`Filter "${filterId}" not found in DOM`);
    }
  });
  if (activeFilters.length > 0) {
    updateMap(activeFilters);
    updateUrl();
  }
}

// Новая функция для обновления визуального состояния фильтров
export function updateFilterVisualState() {
  document.querySelectorAll('.filter').forEach(filter => {
    const filterId = filter.dataset.filter;
    if (!filterId) return;
    if (activeFilters.includes(filterId)) {
      console.log(`Updating visual state for: ${filterId}`); // Отладка
      filter.classList.add('active');
    } else {
      filter.classList.remove('active');
    }
  });
}

export function getActiveFilters() {
  return activeFilters;
}

export function updateFilterCounts(filteredPlaces) {
  document.querySelectorAll('.filter').forEach(filter => {
    const filterId = filter.dataset.filter;
    if (!filterId) return;

    const count = filteredPlaces.filter(place => place.attributes.includes(filterId)).length;
    let countElement = filter.querySelector('.filter-count');
    if (!countElement) {
      countElement = document.createElement('span');
      countElement.className = 'filter-count';
      filter.appendChild(countElement);
    }
    countElement.textContent = count;
  });
}

function updateUrl() {
  const url = new URL(window.location);
  if (activeFilters.length > 0) {
    url.search = `?filter=${activeFilters.join(',')}`;
  } else {
    url.search = '';
  }
  window.history.pushState({}, document.title, url);
}
