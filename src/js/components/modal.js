export function initModal() {
  document.querySelector('.more-filters-btn').addEventListener('click', () => {
    document.getElementById('more-filters-modal').classList.remove('hidden');
  });

  document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('more-filters-modal').classList.add('hidden');
  });
}
