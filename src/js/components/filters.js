import { updateMap, getMap } from './map.js';
import { resetHighlight } from '../utils/helpers.js';
import { filterNames, filterIcons, currentLang, mapConfig } from '../data/config.js';

let activeFilters = [];

export function initFilters() {
  document.querySelectorAll('.filter').forEach(filter => {
    const filterId = filter.dataset.filter;
    if (!filterId) return; // Пропускаем, если нет data-filter (например, more-filters-btn)

    // Очищаем содержимое
    filter.innerHTML = '';

    // Создаем иконку
    const iconWrapper = document.createElement('span');
    iconWrapper.className = 'filter-icon-wrapper';
    const icon = document.createElement('img');
    icon.src = filterIcons[filterId];
    icon.alt = filterNames[filterId][currentLang];
    icon.className = 'filter-icon';
    iconWrapper.appendChild(icon);

    // Добавляем иконку и текст в правильном порядке
    filter.appendChild(iconWrapper);
    filter.appendChild(document.createTextNode(filterNames[filterId][currentLang]));

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
    });
  });

  document.querySelectorAll('.filter-reset').forEach(resetButton => {
    resetButton.addEventListener('click', () => {
      activeFilters = [];
      document.querySelectorAll('.filter').forEach(filter => filter.classList.remove('active'));
      resetHighlight();
      getMap().setView(mapConfig.initialCoords, mapConfig.initialZoom);
      updateMap(activeFilters);
    });
  });
}

export function getActiveFilters() {
  return activeFilters;
}
