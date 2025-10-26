import React, { useState } from 'react';
import { styled } from 'styled-components';
import { AppConfig } from '../../types/places';
import { FeedbackMode, isFeedbackMode } from '../../features/feedback/types';

interface HeaderProps {
  config: AppConfig;
  onOpenFeedback?: (mode: FeedbackMode) => void;
}

const HeaderContainer = styled.header`
  background: ${props => props.theme.colors?.primary || '#333'};
  color: white;
  padding: 1rem;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  height: 56px;

`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
`;

const TitleCity = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  h1 {
    margin: 0;
    font-size: 24px;
  }
`;

const CitySelect = styled.select`
  padding: 5px;
  background: #444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  option:disabled {
    color: #888;
  }
`;

const BurgerButton = styled.button`
  display: none;
  font-size: 24px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;

  @media (max-width: 768px) {
    display: block;
  }
`;

const Navigation = styled.nav<{ $isOpen: boolean }>`
  display: flex;
  gap: 20px;

  a {
    color: white;
    text-decoration: none;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.8;
    }
  }

  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'flex' : 'none'};
    position: absolute;
    top: 55px;
    left: 0;
    background: #333;
    width: 100%;
    padding: 20px;
    flex-direction: column;
    z-index: 9999;
  }
`;

const parseModeFromHref = (href?: string): FeedbackMode | null => {
  if (!href) {
    return null;
  }

  try {
    const url = new URL(href, window.location.origin);
    const modeParam = url.searchParams.get('mode');
    if (isFeedbackMode(modeParam)) {
      return modeParam;
    }
  } catch (error) {
    const match = href.match(/mode=([^&]+)/);
    if (match && isFeedbackMode(match[1])) {
      return match[1];
    }
  }

  return null;
};

const getModeFromLink = (
  link: AppConfig['content']['navLinks'][number]
): FeedbackMode | null => {
  const derivedMode = parseModeFromHref(link.href);
  if (derivedMode && derivedMode !== 'feedback') {
    return derivedMode;
  }

  const normalizedLabel = link.label.trim().toLowerCase();

  if (normalizedLabel.includes('change')) {
    return 'changes_request';
  }

  if (normalizedLabel.includes('add') && normalizedLabel.includes('place')) {
    return 'add_place';
  }

  return null;
};

export const Header: React.FC<HeaderProps> = ({ config, onOpenFeedback }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    link: AppConfig['content']['navLinks'][number]
  ) => {
    const mode = onOpenFeedback ? getModeFromLink(link) : null;

    if (mode && onOpenFeedback) {
      event.preventDefault();
      setIsMenuOpen(false);
      onOpenFeedback(mode);
      return;
    }

    setIsMenuOpen(false);
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <TitleCity>
          <h1>Places</h1>
          <CitySelect>
            {config.content.cities.map((city, index) => (
              <option key={index} disabled={city.disabled}>
                {city.name}
              </option>
            ))}
          </CitySelect>
        </TitleCity>

        <BurgerButton onClick={toggleMenu}>☰</BurgerButton>

        <Navigation $isOpen={isMenuOpen}>
          {config.content.navLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              onClick={event => handleLinkClick(event, link)}
            >
              {link.label}
            </a>
          ))}
        </Navigation>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
