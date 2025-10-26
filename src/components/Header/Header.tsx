import React, { useState } from 'react';
import { styled } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { AppConfig } from '../../types/places';
import { FeedbackMode } from '../../features/feedback/types';

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

  a,
  button {
    color: white;
    text-decoration: none;
    transition: opacity 0.2s ease;
    background: none;
    border: none;
    font: inherit;
    padding: 0;
    cursor: pointer;

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

export const Header: React.FC<HeaderProps> = ({ config, onOpenFeedback }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigate = (href: string) => {
    setIsMenuOpen(false);
    navigate(href);
  };

  const handleLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    label: string,
    href: string
  ) => {
    const normalized = label.trim().toLowerCase();

    if (onOpenFeedback && normalized.includes('add') && normalized.includes('place')) {
      event.preventDefault();
      setIsMenuOpen(false);
      onOpenFeedback('add_place');
      return;
    }

    if (normalized.includes('feedback')) {
      event.preventDefault();
      handleNavigate(href || '/feedback');
      return;
    }

    if (href) {
      event.preventDefault();
      handleNavigate(href);
    }
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
            <button
              key={index}
              type="button"
              onClick={event => handleLinkClick(event, link.label, link.href)}
            >
              {link.label}
            </button>
          ))}
        </Navigation>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
