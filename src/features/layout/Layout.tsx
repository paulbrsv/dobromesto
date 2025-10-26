import React, { createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { styled } from 'styled-components';
import type { AppConfig } from '../../types/places';
import { Header } from '../header/Header';

interface LayoutProps {
  config: AppConfig;
}

interface LayoutContextValue {
  config: AppConfig;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

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

export const Layout: React.FC<LayoutProps> = ({ config }) => {
  return (
    <LayoutContext.Provider value={{ config }}>
      <AppContainer>
        <Header config={config} />
        <Main>
          <Outlet />
        </Main>
      </AppContainer>
    </LayoutContext.Provider>
  );
};

export const useLayoutConfig = (): LayoutContextValue => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutConfig must be used within Layout');
  }
  return context;
};
