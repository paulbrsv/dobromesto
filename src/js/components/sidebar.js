import { getMap } from './map.js'; // Заменяем import { map } на getMap
import { highlightMarker, resetHighlight } from '../utils/helpers.js';
import { attributeNames } from '../data/config.js';

export function initSidebar() {
  // Инициализация не требуется, так как обновление происходит через updateSidebar
}

export function updateSidebar(filteredPlaces) {
  const visibleList = document.getElementById("visible-places");
  const outsideList = document.getElementById("outside-places");
  visibleList.innerHTML = "";
  outsideList.innerHTML = "";

  const map = getMap(); // Используем getMap() для получения map
  const bounds = map.getBounds();
  const mapCenter = map.getCenter();

  const sortedPlaces = filteredPlaces
    .map(place => {
      const placeLatLng = L.latLng(place.lat, place.lng);
      const distance = mapCenter.distanceTo(placeLatLng);
      return { ...place, distance };
    })
    .sort((a, b) => a.distance - b.distance);

  let tempMarker = null;

  sortedPlaces.forEach(place => {
    const placeElement = document.createElement("div");
    placeElement.className = "place";
    placeElement.innerHTML = `
      <img src="${place.image}" alt="${place.name}">
      <div class="place-info">
        <h3>${place.name}</h3>
        <p>${place.shirt_description || place.description}</p>
        <p>${place.attributes.map(attr => attributeNames[attr] || attr).join('')}</p>
      </div>
    `;

    placeElement.onclick = () => {
      if (window.innerWidth <= 768) {
        map.setView([place.lat, place.lng], 17, { animate: true });
        showMobilePlaceCard(place);
        closeSidebar();
        highlightMarker(place.name);
      } else {
        if (tempMarker) {
          if (tempMarker.isPopupOpen()) {
            tempMarker.closePopup();
          }
          map.removeLayer(tempMarker);
          tempMarker = null;
        }

        const popupContent = `
          <div class="popup-content">
            <img src="${place.image}" alt="${place.name}">
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

        tempMarker = L.marker([place.lat, place.lng], {
          icon: L.divIcon({
            className: 'highlighted-marker',
            html: '<img src="https://paulbrsv.github.io/goodplaces/image/mark.svg" style="width: 48px; height: 48px;">',
            iconSize: [48, 48],
            iconAnchor: [24, 12]
          })
        });

        tempMarker.bindPopup(popupContent, {
          autoPan: true,
          autoPanPaddingTopLeft: L.point(0, 100),
          autoPanPaddingBottomRight: L.point(0, 50)
        });

        tempMarker.addTo(map).openPopup();
        map.setView([place.lat, place.lng], 17, { animate: true });

        highlightMarker(place.name);

        tempMarker.on('popupclose', () => {
          map.removeLayer(tempMarker);
          tempMarker = null;
          resetHighlight();
        });
      }
    };

    if (bounds.contains([place.lat, place.lng])) {
      visibleList.appendChild(placeElement);
    } else {
      outsideList.appendChild(placeElement);
    }
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

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const closeButton = document.querySelector('.mobile-sidebar-close');
  const toggleButton = document.querySelector('.mobile-list-toggle');

  sidebar.style.transform = 'translateX(-100%)';
  closeButton.style.display = 'none';
  if (window.innerWidth <= 768) {
    toggleButton.style.display = 'block';
  }
  resetHighlight();
}
