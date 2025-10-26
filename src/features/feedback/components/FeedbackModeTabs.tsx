import React from 'react';
import { styled } from 'styled-components';
import { FeedbackMode } from '../types';

interface FeedbackModeTabsProps {
  activeMode: FeedbackMode;
  onModeChange: (mode: FeedbackMode) => void;
}

const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 10px 16px;
  border-radius: 24px;
  border: 1px solid ${({ $active }) => ($active ? '#3388ff' : '#d5d7db')};
  background: ${({ $active }) => ($active ? '#3388ff' : 'transparent')};
  color: ${({ $active }) => ($active ? '#fff' : '#333')};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover,
  &:focus {
    border-color: #3388ff;
    color: ${({ $active }) => ($active ? '#fff' : '#3388ff')};
  }
`;

const MODE_LABELS: Record<FeedbackMode, string> = {
  add_place: 'Add place',
  changes_request: 'Request changes',
  feedback: 'Feedback',
};

export const FeedbackModeTabs: React.FC<FeedbackModeTabsProps> = ({
  activeMode,
  onModeChange,
}) => (
  <TabsContainer role="tablist" aria-label="Feedback mode">
    {(Object.keys(MODE_LABELS) as FeedbackMode[]).map(mode => (
      <TabButton
        key={mode}
        type="button"
        role="tab"
        aria-selected={activeMode === mode}
        $active={activeMode === mode}
        onClick={() => onModeChange(mode)}
      >
        {MODE_LABELS[mode]}
      </TabButton>
    ))}
  </TabsContainer>
);
