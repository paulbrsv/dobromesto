import React from 'react';
import { styled } from 'styled-components';
import type { AppConfig, Filter } from '../../types/places';
import { usePlacesStore } from '../../store/placesStore';

interface FiltersPanelProps {
  config: AppConfig;
  filterCounts: Record<string, number>;
}

const FiltersBlock = styled.div`
  margin: 0;
  padding: 5px 0;
  position: sticky;
  top: 56px;
  z-index: 900;
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const FiltersContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 0 10px;
  }
`;

const FiltersGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const FilterButton = styled.button<{ $isActive: boolean; $isDisabled: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 20px;
  border: 1px solid ${(props) => props.theme.colors?.primary || '#333'};
  background: ${(props) => (props.$isActive ? props.theme.colors?.primary || '#333' : '#fff')};
  color: ${(props) => (props.$isActive ? '#fff' : props.theme.colors?.primary || '#333')};
  padding: 6px 12px;
  font-size: 12px;
  cursor: ${(props) => (props.$isDisabled ? 'not-allowed' : 'pointer')};
  opacity: ${(props) => (props.$isDisabled && !props.$isActive ? 0.5 : 1)};
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    transform: ${(props) => (props.$isDisabled ? 'none' : 'translateY(-1px)')};
  }
`;

const FilterIcon = styled.img`
  width: 16px;
  height: 16px;
`;

const FilterCount = styled.span<{ $isActive: boolean }>`
  background: ${(props) => (props.$isActive ? 'rgba(255,255,255,0.2)' : '#f1f1f1')};
  color: ${(props) => (props.$isActive ? '#fff' : props.theme.colors?.textSecondary || '#666')};
  border-radius: 999px;
  padding: 0 6px;
  font-size: 11px;
`;

const ResetButton = styled.button`
  border: none;
  background: #ffefef;
  color: ${(props) => props.theme.colors?.closeButton || '#ff4444'};
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    background: #ffd6d6;
  }
`;

const renderFilterButton = (
  filter: Filter,
  isActive: boolean,
  isDisabled: boolean,
  count: number,
  onToggle: (key: string) => void
) => (
  <FilterButton
    key={filter.key}
    onClick={() => !isDisabled && onToggle(filter.key)}
    $isActive={isActive}
    $isDisabled={isDisabled}
    title={filter.tooltip}
    type="button"
  >
    {filter.icon && <FilterIcon src={filter.icon} alt={filter.label} />}
    <span>{filter.label}</span>
    <FilterCount $isActive={isActive}>{count ?? 0}</FilterCount>
  </FilterButton>
);

export const FiltersPanel: React.FC<FiltersPanelProps> = ({ config, filterCounts }) => {
  const activeFilters = usePlacesStore((state) => state.activeFilters);
  const toggleFilter = usePlacesStore((state) => state.toggleFilter);
  const resetFilters = usePlacesStore((state) => state.resetFilters);

  return (
    <FiltersBlock>
      <FiltersContainer>
        <FiltersGroup>
          {config.filters.leftFilters.map((filter) => {
            const count = filterCounts[filter.key] ?? 0;
            const isActive = activeFilters.includes(filter.key);
            const isDisabled = count === 0 && !isActive;
            return renderFilterButton(filter, isActive, isDisabled, count, toggleFilter);
          })}
        </FiltersGroup>
        <FiltersGroup>
          {config.filters.rightFilters.map((filter) => {
            const count = filterCounts[filter.key] ?? 0;
            const isActive = activeFilters.includes(filter.key);
            const isDisabled = count === 0 && !isActive;
            return renderFilterButton(filter, isActive, isDisabled, count, toggleFilter);
          })}
        </FiltersGroup>
        {activeFilters.length > 0 && (
          <ResetButton onClick={resetFilters} type="button">
            Reset filters
          </ResetButton>
        )}
      </FiltersContainer>
    </FiltersBlock>
  );
};
