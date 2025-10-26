import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ThemeProvider } from 'styled-components';
import { useLocation } from 'react-router-dom';
import { Header } from './components/Header/Header';
import { Map } from './components/Map/Map';
import { PlacesList } from './components/PlacesList/PlacesList';
import { Filters } from './components/Filters/Filters';
import { Place, AppConfig } from './types/places';
import { useUrlFilters } from './hooks/useUrlFilters';
import { styled } from 'styled-components';
import L from 'leaflet';
import { createGlobalStyle } from 'styled-components';
import { FeedbackModal } from './features/feedback/components/FeedbackModal';
import { FeedbackWidget } from './features/feedback/FeedbackWidget';
import { FeedbackPage } from './features/feedback/FeedbackPage';
import { FeedbackMode } from './features/feedback/types';

// Глобальные стили для фиксов маркеров Leaflet
const GlobalStyle = createGlobalStyle`
  .leaflet-marker-icon,
  .leaflet-marker-shadow,
  .leaflet-control {
    will-change: transform;
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
  }

  .marker-default div {
    background-color: #3388ff;
    border-radius: 50%;
    width: 12px;
    height: 12px;
    border: 2px solid #fff;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  }

  .marker-active div {
    background-image: url('/data/images/mark.svg');
    background-size: cover;
    width: 30px;
    height: 40px;
    background-repeat: no-repeat;
    background-position: center;
  }

  .leaflet-popup-content-wrapper {
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    width: 500px;
  }

  .leaflet-popup-content {
    margin: 0;
    max-width: 500px !important;
    width: 500px !important;
    border-radius: 8px;
  }

  /* Фикс для attribution */
  .leaflet-control-attribution {
    position: fixed !important;
    bottom: 0 !important;
    right: 0 !important;
    z-index: 1000 !important;
    background: rgba(255, 255, 255, 0.7);
    padding: 5px;
    font-size: 10px;
    text-align: right;
  }
  
  /* Стили для подписей маркеров */
  .leaflet-tooltip.place-label {
    background-color: transparent;
    border: none;
    box-shadow: none;
    font-size: 10px;
    font-weight: bold;
    color: #4d4d4d;
    padding: 0;
  }
  
  /* Убираем стрелку и остатки фона у подписей */
  .leaflet-tooltip.place-label::before {
    display: none !important;
  }
`;

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  margin: 56px 0 0;
  min-height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
  padding: 0;
`;

const Content = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  padding: 0;
  display: flex;
`;

const ShowListButton = styled.button`
  position: absolute;
  top: 30px;
  right: 50px;
  padding: 10px 18px;
  background: ${props => props.theme.colors?.primary || '#333'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  z-index: 20;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }

  &:hover {
    background: ${props => props.theme.colors?.hover || '#555'};
  }
`;

const NearbyButton = styled.button`
  position: fixed;
  font-size: 18px;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  padding: 15px 30px;
  background: #FF7F50;
  color: white;
  border: 0;
  border-radius: 50px;
  z-index: 9;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  display: none;
  transition: opacity 0.3s ease, visibility 0.3s ease;

  @media (max-width: 768px) {
    display: block;
  }
`;

const LoaderOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999998; /* Чуть ниже, чем HTML-лоадер */
  flex-direction: column;
  opacity: 1;
  visibility: visible;
  pointer-events: all;
  will-change: opacity, visibility;
  transition: opacity 0.8s ease-out, visibility 0.8s ease-out;
  box-sizing: border-box;
`;

const LoaderText = styled.div`
  font-size: 20px;
  margin-top: 20px;
  color: #333;
  font-weight: bold;
`;

const LoaderSpinner = styled.div`
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3388ff;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1.5s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const App: React.FC = () => {
  const location = useLocation();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isListVisible, setIsListVisible] = useState(window.innerWidth > 768);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [isFeedbackWidgetOpen, setIsFeedbackWidgetOpen] = useState(false);
  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>('add_place');

  const isFeedbackRoute = location.pathname.startsWith('/feedback');

  const handleOpenFeedback = useCallback((mode: FeedbackMode) => {
    setFeedbackMode(mode);
    setIsFeedbackWidgetOpen(true);
  }, []);

  const handleCloseFeedback = useCallback(() => {
    setIsFeedbackWidgetOpen(false);
  }, []);

  useEffect(() => {
    if (isFeedbackRoute) {
      setIsFeedbackWidgetOpen(false);
    }
  }, [isFeedbackRoute]);

  // Вычисляем отфильтрованные места с помощью useMemo
  const filteredPlaces = useMemo(() => {
    if (!places || activeFilters.length === 0) return places;

    // Применяем каждый фильтр последовательно (AND логика)
    return activeFilters.reduce((filteredList, currentFilter) => {
      return filteredList.filter(place => 
        place.attributes.includes(currentFilter)
      );
    }, places);
  }, [places, activeFilters]);

  // Сортируем места - сначала те, что в области видимости карты
  const sortedPlaces = useMemo(() => {
    if (!filteredPlaces || !mapBounds) return filteredPlaces;

    return [...filteredPlaces].sort((a, b) => {
      // Проверяем, находится ли место в границах карты
      const aInBounds = mapBounds.contains(L.latLng(a.lat, a.lng));
      const bInBounds = mapBounds.contains(L.latLng(b.lat, b.lng));

      if (aInBounds && !bInBounds) return -1; // 'a' в границах, 'b' - нет, 'a' должно быть первым
      if (!aInBounds && bInBounds) return 1;  // 'b' в границах, 'a' - нет, 'b' должно быть первым
      return 0; // оба в границах или оба за границами - порядок не меняется
    });
  }, [filteredPlaces, mapBounds]);

  // Вычисляем количество мест для каждого фильтра с учетом последовательной фильтрации
  const filterCounts = useMemo(() => {
    if (!places || !places.length) return {};

    // Получаем отфильтрованные места на основе активных фильтров
    let filteredPlacesForCounts = [...places];
    
    // Применяем каждый активный фильтр последовательно
    activeFilters.forEach(filter => {
      filteredPlacesForCounts = filteredPlacesForCounts.filter(place => 
        place.attributes.includes(filter)
      );
    });

    // Собираем все доступные атрибуты для подсчета
    const allAttributes = new Set<string>();
    places.forEach(place => {
      place.attributes.forEach(attr => allAttributes.add(attr));
    });

    // Считаем количество мест для каждого атрибута
    const counts: Record<string, number> = {};
    
    allAttributes.forEach(attr => {
      // Если атрибут уже в активных фильтрах, подсчитываем его на основе текущей выборки
      if (activeFilters.includes(attr)) {
        counts[attr] = filteredPlacesForCounts.length;
      } else {
        // Для остальных атрибутов проверяем, сколько мест останется, если их добавить
        counts[attr] = filteredPlacesForCounts.filter(place => 
          place.attributes.includes(attr)
        ).length;
      }
    });

    return counts;
  }, [places, activeFilters]);

  // Изменяем useEffect для загрузки данных
  useEffect(() => {
    // Флаг isLoading уже установлен в true по умолчанию
    
    // Сразу начинаем загрузку данных, HTML-лоадер уже отображается
    fetch('/data/config.json')
      .then(response => response.json())
      .then(configData => {
        setConfig(configData);

        // Загружаем данные о местах
        return fetch('/data/places.json');
      })
      .then(response => response.json())
      .then(placesData => {
        setPlaces(placesData);
        // Устанавливаем места в глобальной переменной для работы фильтров
        window.places = placesData;
        
        // Добавляем искусственную задержку для более плавного перехода
        setTimeout(() => {
          setIsLoading(false);
        }, 1000); // Увеличиваем задержку до 1 секунды для более плавного перехода
      })
      .catch(error => {
        console.error('Error loading data:', error);
        // В случае ошибки тоже завершаем загрузку
        setIsLoading(false);
      });
  }, []);

  // Обработка изменения размера окна
  useEffect(() => {
    const handleResize = () => {
      setIsListVisible(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Обработчик изменения фильтров
  const handleFilterChange = useCallback((newFilters: string[]) => {
    console.log('📍 Изменение фильтров:', newFilters);
    setActiveFilters(newFilters);
  }, []);

  // Получаем функции для работы с фильтрами
  const { toggleFilter, isFilterAvailable, resetFilters } = useUrlFilters(
    activeFilters,
    handleFilterChange,
    filterCounts
  );

  // Обработчик сброса фильтров
  const handleReset = useCallback(() => {
    resetFilters();
    setSelectedPlace(null); // Сбрасываем выбранное место
  }, [resetFilters]);

  const handlePlaceSelect = useCallback((place: Place) => {


    // Если выбрали то же место, которое уже выбрано, то сбрасываем выбор
    if (selectedPlace && selectedPlace.name === place.name) {
      setSelectedPlace(null);
    } else {
      // Иначе устанавливаем новое выбранное место
      setSelectedPlace(place);
    }

    // Скрываем список мест на мобильных устройствах
    if (window.innerWidth <= 768) {
      setIsListVisible(false);
    }
  }, [mapRef, selectedPlace]);

  const handleShowNearby = useCallback(() => {
    // Геолокация только для мобильных устройств
    if (window.innerWidth > 768) return;

    // Начинаем загрузку
    setIsLoading(true);

    // Запрашиваем геолокацию
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Центрируем карту по координатам пользователя
        if (mapRef.current) {
          // Сбрасываем выбранное место при использовании геолокации
          setSelectedPlace(null);

          mapRef.current.setView([userLat, userLng], 16, {
            animate: true,
            duration: 0.5
          });

          // Удаляем предыдущий маркер пользователя
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
            userMarkerRef.current = null;
          }

          // Создаем новый маркер пользователя
          const userMarker = L.marker([userLat, userLng], {
            icon: L.icon({
              iconUrl: '/data/images/pin.svg',
              iconSize: [30, 40],
              iconAnchor: [15, 40]
            })
          }).addTo(mapRef.current);

          // Сохраняем ссылку на маркер пользователя
          userMarkerRef.current = userMarker;
        }

        // Завершаем загрузку
        setIsLoading(false);
      },
      error => {
        console.error('Error getting location:', error);
        alert('Unable to get your location');
        setIsLoading(false);
      }
    );
  }, [mapRef]);

  const handlePopupClose = useCallback(() => {
    // При закрытии попапа через крестик сбрасываем выбранное место
    setSelectedPlace(null);


  }, [mapRef]);

  // Обработчик изменения границ карты
  const handleBoundsChange = useCallback((bounds: L.LatLngBounds) => {
    setMapBounds(bounds);
  }, []);

  // Добавим useEffect для отслеживания изменений isLoading
  useEffect(() => {
    if (!isLoading) {
      console.log('Загрузка завершена, скрытие лоадера');
      
      // Задержка перед скрытием HTML-лоадера, чтобы убедиться, что React-лоадер уже показан
      setTimeout(() => {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
      }, 100); // Уменьшаем эту задержку, так как мы уже добавили задержку выше
    }
  }, [isLoading]);

  return (
    <ThemeProvider theme={config?.styleSettings || {}}>
      <GlobalStyle />
      {/* React-лоадер убран, теперь используется только HTML-лоадер */}
      {/* Отображаем основной контент в любом случае, но только показываем после загрузки */}
      <AppContainer
        style={{
          opacity: !isLoading && config ? 1 : 0,
          visibility: !isLoading && config ? 'visible' : 'hidden',
        }}
      >
        {config && (
          <>
            <Header config={config} onOpenFeedback={handleOpenFeedback} />
            <Main>
              {isFeedbackRoute ? (
                <FeedbackPage initialMode="feedback" />
              ) : (
                <>
                  <Filters
                    config={config}
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                    filterCounts={filterCounts}
                    toggleFilter={toggleFilter}
                    isFilterAvailable={isFilterAvailable}
                    resetFilters={handleReset}
                  />
                  <Content>
                    <Map
                      places={filteredPlaces}
                      config={config}
                      onMarkerClick={handlePlaceSelect}
                      selectedPlace={selectedPlace}
                      mapRef={mapRef}
                      onPopupClose={handlePopupClose}
                      onBoundsChange={handleBoundsChange}
                    />
                    {isListVisible && (
                      <PlacesList
                        config={config}
                        places={sortedPlaces}
                        onPlaceSelect={handlePlaceSelect}
                        selectedPlace={selectedPlace}
                        isVisible={isListVisible}
                        onClose={() => setIsListVisible(false)}
                      />
                    )}
                    <ShowListButton onClick={() => setIsListVisible(true)}>
                      {config.content.buttonLabels.showList}
                    </ShowListButton>
                    {/* Кнопка "Показать ближайшие" отображается только на мобильных устройствах */}
                    <NearbyButton onClick={handleShowNearby}>
                      {config.content.buttonLabels.showNearby}
                    </NearbyButton>
                  </Content>
                </>
              )}
            </Main>
            <FeedbackModal isOpen={isFeedbackWidgetOpen} onClose={handleCloseFeedback}>
              <FeedbackWidget
                initialMode={feedbackMode}
                onClose={handleCloseFeedback}
                title="Добавить место"
              />
            </FeedbackModal>
          </>
        )}
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;
