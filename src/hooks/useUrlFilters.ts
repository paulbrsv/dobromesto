import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Place } from '../types/places';

// Глобальная Map для хранения состояния фильтров в UI
if (!window.filterStates) {
  window.filterStates = new Map<string, boolean>();
}

export const useUrlFilters = (
  activeFilters: string[],
  onFilterChange: (filters: string[]) => void,
  filterCounts: Record<string, number>
) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Функция для подсчета базовых счетчиков
  const calculateBaseCounts = (places: Place[]) => {
    const counts: Record<string, number> = {};
    
    places.forEach(place => {
      place.attributes.forEach(attr => {
        counts[attr] = (counts[attr] || 0) + 1;
      });
    });
    
    return counts;
  };

  // Функция для проверки фильтров из URL и удаления невалидных
  const validateUrlFilters = useCallback(() => {
    if (!window.places || window.places.length === 0) return;

    const filtersFromUrl = searchParams.get('filter');
    
    if (!filtersFromUrl) {
      // Если нет фильтров в URL, сбрасываем активные фильтры
      onFilterChange([]);
      return;
    }

    const allFilters = filtersFromUrl.split(',');
    
    // Проверяем фильтры последовательно
    const validFilters: string[] = [];
    let currentFilteredPlaces = [...window.places];

    for (const filter of allFilters) {
      // Проверяем, останутся ли места после применения этого фильтра
      const placesWithFilter = currentFilteredPlaces.filter(place => 
        place.attributes.includes(filter)
      );

      if (placesWithFilter.length > 0) {
        // Фильтр валидный - добавляем его и обновляем текущий список мест
        validFilters.push(filter);
        currentFilteredPlaces = placesWithFilter;
      }
    }

    // Если список валидных фильтров изменился, обновляем URL
    if (validFilters.length !== allFilters.length) {
      if (validFilters.length === 0) {
        // Если не осталось валидных фильтров, удаляем параметр filter из URL
        const path = window.location.pathname;
        window.history.pushState({}, '', path);
        // Вызываем событие для React Router
        window.dispatchEvent(new Event('popstate'));
      } else {
        // Обновляем URL только с валидными фильтрами
        const path = window.location.pathname;
        const newURL = `${path}?filter=${validFilters.join(',')}`;
        window.history.pushState({}, '', newURL);
        // Вызываем событие для React Router
        window.dispatchEvent(new Event('popstate'));
      }
    }

    // Обновляем активные фильтры в UI
    onFilterChange(validFilters);
  }, [searchParams, onFilterChange, setSearchParams]);

  // Проверяем фильтры при изменении URL или загрузке данных
  useEffect(() => {
    validateUrlFilters();
  }, [searchParams, validateUrlFilters, window.places?.length]);

  // Проверка доступности фильтра
  const isFilterAvailable = useCallback((filter: string) => {
    if (!window.places || window.places.length === 0) return false;

    // Если фильтр уже активен, он всегда доступен
    if (activeFilters.includes(filter)) return true;

    // Получаем текущий отфильтрованный список мест
    let currentPlaces = [...window.places];
    
    // Применяем все активные фильтры последовательно
    for (const activeFilter of activeFilters) {
      currentPlaces = currentPlaces.filter(place => 
        place.attributes.includes(activeFilter)
      );
    }

    // Проверяем, останутся ли места после применения нового фильтра
    const placesWithNewFilter = currentPlaces.filter(place => 
      place.attributes.includes(filter)
    );

    return placesWithNewFilter.length > 0;
  }, [activeFilters]);

  // Переключение фильтра
  const toggleFilter = useCallback((filter: string) => {
    if (!window.places || window.places.length === 0) return;

    // Получаем текущий список фильтров из URL
    const currentFilters = searchParams.get('filter')?.split(',').filter(Boolean) || [];
    
    if (currentFilters.includes(filter)) {
      // Если фильтр уже активен, удаляем его
      const newFilters = currentFilters.filter(f => f !== filter);
      
      if (newFilters.length === 0) {
        // Если не осталось фильтров, удаляем параметр filter из URL
        const path = window.location.pathname;
        window.history.pushState({}, '', path);
        // Вызываем событие для React Router
        window.dispatchEvent(new Event('popstate'));
      } else {
        // Обновляем URL с оставшимися фильтрами
        const path = window.location.pathname;
        const newURL = `${path}?filter=${newFilters.join(',')}`;
        window.history.pushState({}, '', newURL);
        // Вызываем событие для React Router
        window.dispatchEvent(new Event('popstate'));
      }
    } else {
      // Если фильтр неактивен, проверяем, можно ли его добавить
      if (isFilterAvailable(filter)) {
        // Добавляем фильтр к текущим
        const newFilters = [...currentFilters, filter];
        const path = window.location.pathname;
        const newURL = `${path}?filter=${newFilters.join(',')}`;
        window.history.pushState({}, '', newURL);
        // Вызываем событие для React Router
        window.dispatchEvent(new Event('popstate'));
      }
    }
  }, [searchParams, isFilterAvailable]);

  // Сброс всех фильтров
  const resetFilters = useCallback(() => {
    const path = window.location.pathname;
    window.history.pushState({}, '', path);
    // Вызываем событие для React Router
    window.dispatchEvent(new Event('popstate'));
  }, []);

  return {
    toggleFilter,
    isFilterAvailable,
    resetFilters
  };
};

// Добавляем типы для window
declare global {
  interface Window {
    filterStates: Map<string, boolean>;
    places: Place[];
  }
}

export default useUrlFilters; 