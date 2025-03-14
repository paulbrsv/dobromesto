import { updateSidebar } from './sidebar.js';
import { highlightMarker, resetHighlight } from '../utils/helpers.js';
import { attributeNames, mapConfig } from '../data/config.js';
import { getActiveFilters } from './filters.js';


let map;
let markerCluster = L.markerClusterGroup();
let markers = {};
let placesData = [];

export function initMap() {
  return new Promise((resolve, reject) => {
    map = L.map('map').setView(mapConfig.initialCoords, mapConfig.initialZoom);
    L.tileLayer(mapConfig.tileLayerUrl, {
      attribution: mapConfig.attribution
    }).addTo(map);
    map.addLayer(markerCluster);

    fetch('/places.json')
      .then(response => response.json())
      .then(data => {
        placesData = data;
        updateMap(getActiveFilters()); // Применяем текущие фильтры
        resolve(); // Карта и данные готовы
      })
      .catch(error => {
        console.error('Ошибка загрузки данных:', error);
        reject(error);
      });

    map.on('moveend', () => {
      if (!placesData.length) return;
      updateSidebar(placesData.filter(place => {
        const activeFilters = getActiveFilters();
        if (activeFilters.length === 0) return true;
        return place.attributes.some(attr => activeFilters.includes(attr));
      }));
    });
  });
}

export function updateMap(activeFilters) {
  if (!map || !placesData.length) {
    console.warn('Map or places data not ready yet, skipping updateMap');
    return;
  }

  markerCluster.clearLayers();

  const filteredPlaces = placesData.filter(place => {
    if (activeFilters.length === 0) return true;
    return activeFilters.every(filter => place.attributes.includes(filter));
  });

  filteredPlaces.forEach(place => {
    const popupContent = `
      <div class="popup-content">
        <img src="${place.image}" alt="${place.name}" loading="lazy">
        <div class="popup-text">
          <div class="popup-text-content">
            <h3>${place.name}</h3>
            <p>${place.description}</p>
            <div class="popup-attributes">${place.attributes.map(attr => attributeNames[attr] || attr).join('')}</div>
          </div>
          <div class="popup-links">
            <a href="${place.instagram}" target="_blank">
              <img src="https://paulbrsv.github.io/goodplaces/image/instagram.svg" alt="Instagram" class="icon">
            </a>
            <a href="${place.maps_url}" target="_blank">
              <img src="https://paulbrsv.github.io/goodplaces/image/google.svg" alt="Google Maps" class="icon">
            </a>
          </div>
        </div>
      </div>
    `;

    const marker = L.marker([place.lat, place.lng], {
      icon: L.divIcon({
        className: 'default-marker',
        html: '<div style="background-color: #3388ff; width: 10px; height: 10px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 0 2px #3388ff;"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })
    });

    if (window.innerWidth > 768) {
      marker.bindPopup(popupContent, {
        autoPan: true,
        autoPanPaddingTopLeft: L.point(0, 100),
        autoPanPaddingBottomRight: L.point(0, 50),
        offset: L.point(0, -25) // Смещаем попап на 25 пикселей вверх
      });
      marker.on('popupopen', () => highlightMarker(place.name));
      marker.on('popupclose', () => resetHighlight());
    } else {
      marker.on('click', () => {
        showMobilePlaceCard(place);
        highlightMarker(place.name);
      });
    }
    markerCluster.addLayer(marker);
    markers[place.name] = marker;
  });

  map.addLayer(markerCluster);

  updateSidebar(filteredPlaces);
  updateFilterCounts(filteredPlaces);
}

function updateFilterCounts(filteredPlaces) {
  document.querySelectorAll('.filter').forEach(filter => {
    const filterId = filter.dataset.filter;
    if (!filterId) return;
    const count = filteredPlaces.filter(place => place.attributes.includes(filterId)).length;

    let countElement = filter.querySelector('.filter-count');
    if (!countElement) {
      countElement = document.createElement('div');
      countElement.classList.add('filter-count');
      filter.appendChild(countElement);
    }
    countElement.textContent = count;
  });
}

function showMobilePlaceCard(place) {
  const card = document.getElementById('mobile-place-card');
  const header = card.querySelector('.mobile-place-card-header');
  const content = card.querySelector('.mobile-place-card-content');

  const attributesHtml = place.attributes.map(attr => attributeNames[attr] || attr).join('');
  header.innerHTML = `
    <div class="mobile-place-card-attributes">${attributesHtml}</div>
    <span class="close-card">✕</span>
  `;

  content.innerHTML = `
    <img src="${place.image}" alt="${place.name}">
    <div class="popup-text">
      <div class="popup-text-content">
        <h3>${place.name}</h3>
        <p>${place.description}</p>
      </div>
      <div class="popup-links">
        <a href="${place.instagram}" target="_blank"><img src="https://paulbrsv.github.io/goodplaces/image/instagram.svg" alt="Instagram" class="icon"></a>
        <a href="${place.maps_url}" target="_blank"><img src="https://paulbrsv.github.io/goodplaces/image/google.svg" alt="Google Maps" class="icon"></a>
      </div>
    </div>
  `;
  card.classList.remove('hidden');
  card.classList.add('active');
}

export function getMarkers() {
  return markers;
}

export function getMap() {
  return map;
}
