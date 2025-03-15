import '../assets/styles/global.css';
import '../assets/styles/components/filters.css';
import '../assets/styles/components/sidebar.css';
import '../assets/styles/components/map.css';
import '../assets/styles/components/popup.css';
import '../assets/styles/components/mobile.css';
import '../assets/styles/components/modal.css';

import { initFilters, setActiveFilters, updateFilterVisualState } from './components/filters.js';
import { initSidebar } from './components/sidebar.js';
import { initMap } from './components/map.js';
import { initMobile } from './components/mobile.js';
import { initModal } from './components/modal.js';
import { showTooltip, hideTooltip } from './utils/helpers.js';
import { filterTooltips, uiTexts, currentLang } from './data/config.js';

import headerHtml from '../html/components/header.html?raw';
import filtersHtml from '../html/components/filters.html?raw';
import sidebarHtml from '../html/components/sidebar.html?raw';
import mapHtml from '../html/components/map.html?raw';
import mobileHtml from '../html/components/mobile.html?raw';
import modalHtml from '../html/components/modal.html?raw';

function loadComponent(containerId, htmlContent) {
  document.getElementById(containerId).innerHTML = htmlContent;
}

async function init() {
  loadComponent('header-container', headerHtml);
  loadComponent('filters-container', filtersHtml);
  loadComponent('sidebar-container', sidebarHtml);
  loadComponent('map-container', mapHtml);
  loadComponent('mobile-container', mobileHtml);
  loadComponent('modal-container', modalHtml);

  const filtersContainer = document.getElementById('filters-container');
  const filtersPlaceholder = document.getElementById('filters-placeholder');
  filtersPlaceholder.appendChild(filtersContainer.querySelector('.filters'));
  filtersContainer.innerHTML = '';

  document.querySelector('h1').textContent = uiTexts.headerTitle[currentLang];
  document.querySelector('.mobile-list-toggle').lastChild.textContent = uiTexts.showListButton[currentLang];
  document.querySelector('.mobile-sidebar-close').lastChild.textContent = uiTexts.closeButton[currentLang];

  const moreFiltersBtn = document.querySelector('.more-filters-btn');
  moreFiltersBtn.innerHTML = '';
  const moreIcon = document.createElement('img');
  moreIcon.src = '/images/more.svg';
  moreIcon.alt = uiTexts.moreFilters[currentLang];
  moreIcon.className = 'filter-icon';
  moreFiltersBtn.appendChild(moreIcon);
  moreFiltersBtn.appendChild(document.createTextNode(uiTexts.moreFilters[currentLang]));

  initFilters();
  initSidebar();
  await initMap(); // Ждём карту
  initMobile();
  initModal();

  const urlParams = new URLSearchParams(window.location.search);
  const filterParam = urlParams.get('filter');
  if (filterParam) {
    const filterIds = filterParam.split(',');
    setActiveFilters(filterIds);
  }

  updateFilterVisualState(); // Синхронизируем визуальное состояние

  const filters = document.querySelectorAll('.filter');
  filters.forEach(filter => {
    const filterId = filter.dataset.filter;
    if (!filterId) return;
    const tooltipData = filterTooltips[filterId] || {};
    const tooltipText = tooltipData[currentLang] || "Description unavailable";
    filter.addEventListener('mouseenter', () => showTooltip(filter, tooltipText));
    filter.addEventListener('mouseleave', () => hideTooltip(filter));
  });
}

// Инициализация приложения при загрузке DOM
document.addEventListener('DOMContentLoaded', init);

// Регистрация Service Worker после полной загрузки страницы
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log('Service Worker зарегистрирован:', registration.scope);
      })
      .catch(error => {
        console.error('Ошибка регистрации Service Worker:', error);
      });
  });
}
