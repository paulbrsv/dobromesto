import React, { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { styled } from 'styled-components';
import type { AppConfig } from '../../types/places';

interface HeaderProps {
  config: AppConfig;
}

const HeaderContainer = styled.header`
  background: ${(props) => props.theme.colors?.primary || '#333'};
  color: #fff;
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
  gap: 12px;

  h1 {
    margin: 0;
    font-size: 20px;
    letter-spacing: 0.02em;
  }
`;

const CitySelect = styled.select`
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  option:disabled {
    color: #999;
  }
`;

const BurgerButton = styled.button`
  display: none;
  font-size: 24px;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 0;

  @media (max-width: 768px) {
    display: block;
  }
`;

const Navigation = styled.nav<{ $isOpen: boolean }>`
  display: flex;
  gap: 16px;
  align-items: center;

  a {
    color: #fff;
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.2s ease;

    &.active {
      opacity: 0.75;
    }

    &:hover {
      opacity: 0.75;
    }
  }

  @media (max-width: 768px) {
    display: ${(props) => (props.$isOpen ? 'flex' : 'none')};
    position: absolute;
    top: 56px;
    left: 0;
    right: 0;
    background: ${(props) => props.theme.colors?.primary || '#333'};
    flex-direction: column;
    padding: 16px;
    gap: 12px;
  }
`;

const ExternalLink = styled.a`
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.75;
  }
`;

export const Header: React.FC<HeaderProps> = ({ config }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const links = useMemo(() => {
    const baseLinks = [
      { label: 'Map', href: '/' },
      { label: 'Feedback', href: '/feedback' },
      { label: 'About', href: '/pages/about' },
    ];

    const dynamicLinks = config.content.navLinks || [];

    const merged = [...baseLinks, ...dynamicLinks];

    const seen = new Set<string>();
    return merged.filter((link) => {
      const key = link.href.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [config.content.navLinks]);

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  return (
    <HeaderContainer>
      <HeaderContent>
        <TitleCity>
          <h1>Dobro Mesto</h1>
          <CitySelect aria-label="City selector">
            {config.content.cities.map((city) => (
              <option key={city.name} disabled={city.disabled}>
                {city.name}
              </option>
            ))}
          </CitySelect>
        </TitleCity>

        <BurgerButton onClick={toggleMenu} aria-label="Toggle navigation">
          ☰
        </BurgerButton>

        <Navigation $isOpen={isMenuOpen}>
          {links.map((link) => {
            const isInternal = link.href.startsWith('/');

            if (isInternal) {
              const target = link.href.replace(/\/$/, '') || '/';
              return (
                <NavLink
                  key={link.href}
                  to={target}
                  end={target === '/'}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              );
            }

            return (
              <ExternalLink key={link.href} href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </ExternalLink>
            );
          })}
        </Navigation>
      </HeaderContent>
    </HeaderContainer>
  );
};
