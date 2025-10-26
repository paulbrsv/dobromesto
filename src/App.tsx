import React, { useMemo } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from './react-query';
import { useConfigQuery } from './api/config';
import { Layout } from './features/layout/Layout';
import { HomePage } from './pages/HomePage';
import { FeedbackPage } from './pages/FeedbackPage';
import { StaticPage } from './pages/StaticPage';
import { GlobalStyles } from './styles/GlobalStyles';
import { styled } from 'styled-components';

const LoaderOverlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: #fff;
  z-index: 1000;
`;

const LoaderSpinner = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 5px solid #f3f3f3;
  border-top: 5px solid ${(props) => props.theme.colors?.primary || '#333'};
  animation: spin 1.2s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const Message = styled.div`
  margin-top: 16px;
  color: ${(props) => props.theme.colors?.textSecondary || '#666'};
  font-size: 16px;
`;

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { data: config, isLoading, isError } = useConfigQuery();

  const theme = useMemo(
    () => ({
      colors: {
        primary: config?.styleSettings.colors.primary || '#333',
        secondary: config?.styleSettings.colors.secondary || '#3388ff',
        hover: config?.styleSettings.colors.hover || '#555',
        closeButton: config?.styleSettings.colors.closeButton || '#ff4444',
        textSecondary: config?.styleSettings.colors.textSecondary || '#666',
        text: config?.styleSettings.colors.text || '#333',
        background: config?.styleSettings.colors.background || '#ffffff',
      },
    }),
    [config]
  );

  if (isLoading || !config) {
    return (
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <LoaderOverlay>
          <LoaderSpinner />
          <Message>Loading configuration…</Message>
        </LoaderOverlay>
      </ThemeProvider>
    );
  }

  if (isError) {
    return (
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <LoaderOverlay>
          <Message>Failed to load configuration.</Message>
        </LoaderOverlay>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout config={config} />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/pages/:slug" element={<StaticPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AppContent />
  </QueryClientProvider>
);

export default App;
