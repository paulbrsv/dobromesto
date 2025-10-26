import React from 'react';
import { styled } from 'styled-components';
import { FeedbackWidget } from './FeedbackWidget';
import { FeedbackMode } from './types';

interface FeedbackPageProps {
  initialMode?: FeedbackMode;
}

const PageWrapper = styled.div`
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 16px 64px;

  @media (max-width: 768px) {
    padding: 24px 16px 48px;
  }
`;

export const FeedbackPage: React.FC<FeedbackPageProps> = ({ initialMode = 'add_place' }) => (
  <PageWrapper>
    <FeedbackWidget initialMode={initialMode} title="Обратная связь" />
  </PageWrapper>
);
