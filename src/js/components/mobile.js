import { resetHighlight } from '../utils/helpers.js';

export function initMobile() {
  document.querySelector('.mobile-list-toggle').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    const closeButton = document.querySelector('.mobile-sidebar-close');
    const isHidden = sidebar.style.transform === 'translateX(-100%)' || sidebar.classList.contains('hidden-mobile');

    if (isHidden) {
      sidebar.style.transform = 'translateX(0)';
      sidebar.classList.remove('hidden-mobile');
      sidebar.scrollTop = 0;
      if (window.innerWidth <= 768) {
        closeButton.style.display = 'flex';
        document.querySelector('.mobile-list-toggle').style.display = 'none';
      }
    } else {
      closeSidebar();
    }
  });

  document.querySelector('.mobile-sidebar-close').addEventListener('click', closeSidebar);

  document.getElementById('mobile-place-card').addEventListener('click', (e) => {
    if (e.target.classList.contains('close-card')) {
      const card = document.getElementById('mobile-place-card');
      card.classList.remove('active');
      setTimeout(() => {
        card.classList.add('hidden');
        resetHighlight();
      }, 300);
    }
  });

  const toggleButton = document.querySelector('.mobile-list-toggle');
  const updateToggleVisibility = () => {
    if (window.innerWidth > 768) {
      toggleButton.style.display = 'none';
    } else {
      toggleButton.style.display = 'block';
    }
  };

  updateToggleVisibility();
  window.addEventListener('resize', updateToggleVisibility);
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
