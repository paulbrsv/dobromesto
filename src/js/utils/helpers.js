import { getMarkers, getMap } from '../components/map.js';

let highlightedMarker = null;

export function highlightMarker(placeName) {
  if (highlightedMarker) {
    resetHighlight();
  }
  const markers = getMarkers();
  if (markers[placeName]) {
    const marker = markers[placeName];
    const highlightedIcon = L.divIcon({
      className: 'highlighted-marker',
      html: '<img src="/images/mark.svg" style="width: 48px; height: 64px;">',
      iconSize: [48, 48],
      iconAnchor: [24, 48]
    });
    marker.setIcon(highlightedIcon);
    highlightedMarker = marker;
    getMap().setView(marker.getLatLng(), getMap().getZoom(), { animate: true }); // Используем getMap()
  }
}

export function resetHighlight() {
  if (highlightedMarker) {
    const defaultIcon = L.divIcon({
      className: 'default-marker',
      html: '<div style="background-color: #3388ff; width: 10px; height: 10px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 0 2px #3388ff;"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    highlightedMarker.setIcon(defaultIcon);
    highlightedMarker = null;
  }
}

export function showTooltip(element, text) {
  let tooltip = element.querySelector('.custom-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.textContent = text;
    element.appendChild(tooltip);
  }

  const rect = element.getBoundingClientRect();
  const tooltipWidth = tooltip.offsetWidth;
  const windowWidth = window.innerWidth;

  tooltip.style.top = `-${tooltip.offsetHeight + 5}px`;

  let leftPos = (element.offsetWidth - tooltipWidth) / 2;
  const elementLeft = rect.left;

  if (elementLeft + leftPos < 0) {
    leftPos = -elementLeft + 5;
  } else if (elementLeft + leftPos + tooltipWidth > windowWidth) {
    leftPos = windowWidth - elementLeft - tooltipWidth - 5;
  }

  tooltip.style.left = `${leftPos}px`;
  tooltip.style.visibility = 'visible';

  setTimeout(() => {
    tooltip.style.visibility = 'hidden';
  }, 3000);
}

export function hideTooltip(element) {
  const tooltip = element.querySelector('.custom-tooltip');
  if (tooltip) {
    tooltip.style.visibility = 'hidden';
  }
}
