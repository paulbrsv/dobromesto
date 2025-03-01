import '../assets/styles/global.css';
import '../assets/styles/components/filters.css';
import '../assets/styles/components/sidebar.css';
import '../assets/styles/components/map.css';
import '../assets/styles/components/popup.css';
import '../assets/styles/components/mobile.css';
import '../assets/styles/components/modal.css';

import { initFilters } from './components/filters.js';
import { initSidebar } from './components/sidebar.js';
import { initMap } from './components/map.js';
import { initMobile } from './components/mobile.js';
import { initModal } from './components/modal.js';
import { showTooltip, hideTooltip } from './utils/helpers.js';
import { filterTooltips, uiTexts, currentLang, filterIcons } from './data/config.js';

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
  moreIcon.src = 'https://paulbrsv.github.io/goodplaces/image/more.svg';
  moreIcon.alt = uiTexts.moreFilters[currentLang];
  moreIcon.className = 'filter-icon';
  moreFiltersBtn.appendChild(moreIcon);
  moreFiltersBtn.appendChild(document.createTextNode(uiTexts.moreFilters[currentLang]));

  initFilters();
  initSidebar();
  initMap();
  initMobile();
  initModal();

  const filters = document.querySelectorAll('.filter');
  filters.forEach(filter => {
    const filterId = filter.dataset.filter;
    if (!filterId) return;
    const tooltipText = filterTooltips[filterId][currentLang] || "Описание отсутствует";
    filter.addEventListener('mouseenter', () => showTooltip(filter, tooltipText));
    filter.addEventListener('mouseleave', () => hideTooltip(filter));
  });
}

document.addEventListener('DOMContentLoaded', init);
