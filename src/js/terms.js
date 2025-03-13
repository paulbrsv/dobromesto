

import '../assets/styles/global.css';
import '../assets/styles/components/terms.css';

import headerHtml from '../html/components/header.html?raw';
import { uiTexts, currentLang } from '../js/data/config.js'; // uiTexts и currentLang из config.js
import { termsText } from '../js/data/texts.js'; // termsText из texts.js

function loadComponent(containerId, htmlContent) {
  document.getElementById(containerId).innerHTML = htmlContent;
}

function initTerms() {
  loadComponent('header-container', headerHtml);
  document.querySelector('h1').textContent = uiTexts.headerTitle[currentLang];

  const termsContainer = document.getElementById('terms-container');
  termsContainer.innerHTML = `
    ${termsText[currentLang].map(paragraph => `<p>${paragraph}</p>`).join('')}
  `;

  const logoLink = document.querySelector('.header-logo a');
  if (logoLink) logoLink.href = '/';
}

document.addEventListener('DOMContentLoaded', initTerms);
