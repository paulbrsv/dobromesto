import React, { useState, useCallback, useEffect } from 'react';
import { styled } from 'styled-components';
import { Filter, AppConfig } from '../../types/places';

interface FiltersProps {
  config: AppConfig;
  activeFilters: string[];
  onFilterChange: (filters: string[]) => void;
  filterCounts: Record<string, number>;
  toggleFilter: (filter: string) => void;
  isFilterAvailable: (filter: string) => boolean;
  resetFilters: () => void;
}

const FiltersBlock = styled.div`
  margin: 0;
  padding: 5px;
  flex-shrink: 0;
  min-height: 0;
  display: block !important;
  position: sticky;
  top: 56px !important;
  z-index: 9999;
  background: #fff;
  contain: layout paint;
  will-change: transform;
  transform: translateZ(0);
  -webkit-font-smoothing: antialiased;

  @media (max-width: 768px) {
    z-index: 100;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  max-width: 1200px;
  margin: 0 auto;
  gap: 0;
  flex-wrap: wrap;
  align-items: flex-start;
  padding: 0;
  min-height: 0;
  contain: layout style paint;

  @media (max-width: 768px) {
    display: none !important;
    z-index: 100;
  }
`;

const FilterGroup = styled.div<{ $isRight?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  padding: 0 5px;
  margin: 0;
  contain: layout style;
  position: relative;
  max-width: ${props => props.$isRight ? '700px' : '300px'};

  ${props => !props.$isRight && `
    &::after {
      content: '';
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: 1px;
      background: #ccc;
      transform: translateZ(0);
    }
  `}
`;

const FilterButton = styled.div<{ $isActive: boolean; $isDisabled: boolean }>`
  padding: 2px 4px;
  border: 1px solid #ccc;
  border-radius: 20px;
  cursor: ${props => props.$isDisabled ? 'default' : 'pointer'};
  user-select: none;
  background: ${props => props.$isActive ? props.theme.colors?.primary || '#333' : '#fff'};
  color: ${props => props.$isActive ? '#fff' : props.theme.colors?.primary || '#333'};
  text-align: center;
  white-space: nowrap;
  font-size: 11px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  transition: all 0.2s ease-out;
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
  opacity: ${props => props.$isDisabled ? 0.5 : 1};

  &:hover {
    background: ${props => !props.$isDisabled && (props.$isActive ? props.theme.colors?.primary || '#333' : '#f5f5f5')};
  }
`;

const FilterIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 5px;
  vertical-align: middle;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  transform: translateZ(0);
  content-visibility: auto;

  &[src] {
    opacity: 1;
  }
`;

const FilterCount = styled.span<{ $isActive: boolean }>`
  margin-left: 5px;
  font-size: 10px;
  color: ${props => props.$isActive ? '#fff' : props.theme.colors?.textSecondary || '#666'};
  background: ${props => props.$isActive ? props.theme.colors?.hover || '#555' : '#f0f0f0'};
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-out;
  transform: ${props => props.$isActive ? 'scale(1.05)' : 'scale(1)'} translateZ(0);
`;

const ResetButton = styled.button`
  font-size: 14px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 9px;
  background-color: #FFEFEF;
  font-weight: bold;
  border: none;
  align-items: center;
  transition: all 0.2s ease-out;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  will-change: transform, background-color;
  transform: translateZ(0);

  &:hover {
    background-color: #ffbbbb;
    transform: translateY(-1px) translateZ(0);
  }
`;

const MobileFilters = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex !important;
    gap: 3px;
    align-items: center;
    width: 100%;
    flex-wrap: wrap;
    justify-content: space-between;
    position: relative;
    z-index: 50;
    contain: layout style;
    transform: translateZ(0);
    will-change: transform;
    padding: 0 10px;
  }
`;

const MoreFiltersButton = styled.button`
  font-size: 13px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  border: none;
  background-color: #f0f0f0;
  color: #333;
  font-weight: 500;
  transition: all 0.2s ease-out;
  display: none;
  align-items: center;
  justify-content: center;
  margin: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  will-change: transform, background-color;
  transform: translateZ(0);

  &:hover {
    background-color: #e0e0e0;
    transform: translateY(-1px) translateZ(0);
  }

  &:active {
    background-color: #d0d0d0;
    transform: translateY(0) translateZ(0);
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const FilterPopup = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease-out;
  will-change: opacity;
  backdrop-filter: blur(2px);

  &.active {
    display: flex;
  }
`;

const PopupContent = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  opacity: 0;
  transform: scale(0.95) translateY(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &.active {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const PopupFilters = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
`;

const PopupFilterGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const PopupTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
`;

const PopupCloseButton = styled.button`
  padding: 5px 10px;
  background-color: #90EE90;
  border: none;
  border-radius: 9px;
  cursor: pointer;
  font-size: 14px;
  color: #fff;
  transition: all 0.2s ease-out;
  will-change: transform;
  transform: translateZ(0);

  &:hover {
    background-color: #7CFC00;
    transform: translateY(-1px) translateZ(0);
  }
`;

export const Filters: React.FC<FiltersProps> = ({
  config,
  activeFilters,
  onFilterChange,
  filterCounts,
  toggleFilter,
  isFilterAvailable,
  resetFilters
}) => {
  const [isPopupActive, setIsPopupActive] = useState(false);

  const handleReset = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  const handleMoreClick = () => {
    setIsPopupActive(true);
  };

  const handleClosePopup = () => {
    setIsPopupActive(false);
  };

  const renderFilterButton = (filter: Filter) => {
    const isFilterActive = activeFilters.includes(filter.key);
    const isAvailable = isFilterAvailable(filter.key);
    const count = filterCounts[filter.key] || 0;

    // Если счетчик равен 0 и фильтр не активен, его нельзя выбрать
    const isDisabled = !isAvailable || (!isFilterActive && count === 0);

    return (
      <FilterButton
        key={filter.key}
        $isActive={isFilterActive}
        $isDisabled={isDisabled}
        onClick={() => isDisabled ? null : toggleFilter(filter.key)}
        title={filter.tooltip}
      >
        <FilterIcon src={filter.icon} alt={filter.label} />
        {filter.label}
        <FilterCount $isActive={isFilterActive}>
          {count}
        </FilterCount>
      </FilterButton>
    );
  };

  const renderPopupFilterButton = (filter: Filter) => {
    const isFilterActive = activeFilters.includes(filter.key);
    const isAvailable = isFilterAvailable(filter.key);
    const count = filterCounts[filter.key] || 0;

    // Если счетчик равен 0 и фильтр не активен, его нельзя выбрать
    const isDisabled = !isAvailable || (!isFilterActive && count === 0);

    return (
      <FilterButton
        key={filter.key}
        $isActive={isFilterActive}
        $isDisabled={isDisabled}
        onClick={() => {
          if (!isDisabled) {
            toggleFilter(filter.key);
          }
        }}
        title={filter.tooltip}
      >
        <FilterIcon src={filter.icon} alt={filter.label} />
        {filter.label}
        <FilterCount $isActive={isFilterActive}>
          {count}
        </FilterCount>
      </FilterButton>
    );
  };

  useEffect(() => {
    console.log('📊 Обновились счетчики фильтров:', filterCounts);

    // Можно добавить дополнительную логику обработки счетчиков здесь

  }, [filterCounts]);

  return (
    <div>
      <FiltersBlock>
        <FiltersContainer>
          <FilterGroup>
            {config.filters.leftFilters.map(renderFilterButton)}
          </FilterGroup>
          <FilterGroup $isRight>
            {config.filters.rightFilters.map(renderFilterButton)}
          </FilterGroup>
          <ResetButton onClick={handleReset}>
            <img src="/data/images/reset.svg" alt="Reset" style={{ width: '16px', height: '16px', marginRight: '5px' }} />
          </ResetButton>
          <MoreFiltersButton onClick={handleMoreClick}>More</MoreFiltersButton>
        </FiltersContainer>

        <MobileFilters>
          <div style={{ display: 'flex', gap: '3px' }}>
            <FilterGroup>
              {config.filters.leftFilters.slice(0, 2).map(renderFilterButton)}
            </FilterGroup>
          </div>

          <div style={{ display: 'flex', gap: '3px' }}>
            <MoreFiltersButton onClick={handleMoreClick}>More</MoreFiltersButton>
            <ResetButton onClick={handleReset}>
              <img src="/data/images/reset.svg" alt="Reset" style={{ width: '16px', height: '16px', marginRight: '5px' }} />
            </ResetButton>
          </div>

          <div style={{ display: 'flex', gap: '3px' }}>
            <FilterGroup $isRight>
              {config.filters.rightFilters.slice(0, 3).map(renderFilterButton)}
            </FilterGroup>
          </div>
        </MobileFilters>
      </FiltersBlock>

      <FilterPopup className={isPopupActive ? 'active' : ''} onClick={handleClosePopup}>
        <PopupContent className={isPopupActive ? 'active' : ''} onClick={e => e.stopPropagation()}>
          <PopupFilters>
            {config.filters.leftFilters.length > 2 && (
              <>
                <PopupFilterGroup>
                  {config.filters.leftFilters.slice(2).map(renderPopupFilterButton)}
                </PopupFilterGroup>
              </>
            )}

            {config.filters.rightFilters.length > 3 && (
              <>
                <PopupFilterGroup>
                  {config.filters.rightFilters.slice(3).map(renderPopupFilterButton)}
                </PopupFilterGroup>
              </>
            )}
          </PopupFilters>
          <PopupCloseButton onClick={handleClosePopup}>OK</PopupCloseButton>
        </PopupContent>
      </FilterPopup>
    </div>
  );
};

export default Filters;
