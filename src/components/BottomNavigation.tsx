import React, { useState } from 'react';
import {
  Home,
  TreePine,
  User,
  HelpCircle,
  Settings,
  LucideIcon,
} from 'lucide-react';
import './BottomNavigation.module.css';

export type NavItem = 'home' | 'family' | 'person' | 'help' | 'settings';

export interface BottomNavigationProps {
  activeItem: NavItem;
  onNavigate: (item: NavItem) => void;
  showOnDesktop?: boolean;
}

interface NavItemConfig {
  id: NavItem;
  label: string;
  icon: LucideIcon;
  ariaLabel: string;
}

/**
 * BottomNavigation Component
 *
 * Mobile-first navigation bar fixed at bottom of viewport
 *
 * Features:
 * - 5 main sections (Home, Family Tree, Person, Help, Settings)
 * - Touch-friendly (48px minimum height)
 * - Safe area support (notch, home indicator)
 * - Active state indicator
 * - Smooth transitions
 * - WCAG AAA accessible
 *
 * Only visible on mobile (<640px)
 * Can be shown on desktop with showOnDesktop prop
 */
export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeItem,
  onNavigate,
  showOnDesktop = false,
}) => {
  const navItems: NavItemConfig[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      ariaLabel: 'Torna a home - 9 Mondi',
    },
    {
      id: 'family',
      label: 'Family',
      icon: TreePine,
      ariaLabel: 'Albero genealogico',
    },
    {
      id: 'person',
      label: 'Person',
      icon: User,
      ariaLabel: 'Dettagli persona',
    },
    {
      id: 'help',
      label: 'Help',
      icon: HelpCircle,
      ariaLabel: 'Guida e supporto',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      ariaLabel: 'Impostazioni e preferenze',
    },
  ];

  return (
    <nav
      className={`bottom-navigation ${showOnDesktop ? 'show-desktop' : ''}`}
      aria-label="Navigazione principale"
      role="navigation"
    >
      <div className="bottom-navigation__items">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
              onClick={() => onNavigate(item.id)}
              aria-label={item.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
              title={item.ariaLabel}
            >
              <Icon className="nav-item__icon" size={24} aria-hidden="true" />
              <span className="nav-item__label">{item.label}</span>
              {isActive && (
                <span className="nav-item__indicator" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

/**
 * Hook for managing bottom navigation state
 * Integrates with React Router if available
 */
export const useBottomNavigation = (initialActive: NavItem = 'home') => {
  const [activeItem, setActiveItem] = useState<NavItem>(initialActive);

  const handleNavigate = (item: NavItem) => {
    setActiveItem(item);

    // Optionally integrate with React Router
    // navigate(`/${item}`);
  };

  return {
    activeItem,
    handleNavigate,
  };
};

export default BottomNavigation;
