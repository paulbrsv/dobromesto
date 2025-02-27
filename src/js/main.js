import { initFilters } from './components/filters.js';
import { initSidebar } from './components/sidebar.js';
import { initMap } from './components/map.js';
import { initMobile } from './components/mobile.js';
import { initModal } from './components/modal.js';

async function loadComponent(containerId, filePath) {
  const response = await fetch(filePath);
  const html = await response.text();
  document.getElementById(containerId).innerHTML = html;
}

async function init() {
  await Promise.all([
    loadComponent('header-container', '../html/components/header.html'),
    loadComponent('filters-container', '../html/components/filters.html'),
    loadComponent('sidebar-container', '../html/components/sidebar.html'),
    loadComponent('map-container', '../html/components/map.html'),
    loadComponent('mobile-container', '../html/components/mobile.html'),
    loadComponent('modal-container', '../html/components/modal.html')
  ]);

  // Вставляем фильтры в header после загрузки
  document.getElementById('filters-placeholder').innerHTML = document.getElementById('filters-container').innerHTML;
  document.getElementById('filters-container').innerHTML = ''; // Очищаем исходный контейнер

  initFilters();
  initSidebar();
  initMap();
  initMobile();
  initModal();
}

document.addEventListener('DOMContentLoaded', init);
