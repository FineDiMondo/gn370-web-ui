import React, { useState } from 'react';
import { Menu, Home, Search, Calendar, Map, Image, BookOpen, Heart, BarChart3, BookMarked, Moon, Sun, HelpCircle, Settings } from 'lucide-react';
import { GoogleLoginButton } from './GoogleLoginButton';
import './MainLayout.module.css';

export interface MainLayoutProps { children: React.ReactNode; }

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState('dark');
  const worlds = [
    { id: 'tree', label: 'Albero Genealogico', icon: Home, path: '/tree' },
    { id: 'search', label: 'Ricerca Persone', icon: Search, path: '/search' },
    { id: 'timeline', label: 'Timeline', icon: Calendar, path: '/timeline' },
    { id: 'maps', label: 'Mappe Geografiche', icon: Map, path: '/maps' },
    { id: 'album', label: 'Album Fotografico', icon: Image, path: '/album' },
    { id: 'stories', label: 'Storie Familiari', icon: BookOpen, path: '/stories' },
    { id: 'relations', label: 'Relazioni', icon: Heart, path: '/relations' },
    { id: 'stats', label: 'Statistiche', icon: BarChart3, path: '/stats' },
    { id: 'resources', label: 'Risorse', icon: BookMarked, path: '/resources' }
  ];

  return (
    <div className={`main-layout theme-${theme}`}>
      <header className="main-header">
        <div className="header-left">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
            <Menu size={24} />
          </button>
          <h1 className="app-title">🧬 GN370</h1>
        </div>
        <div className="header-center">
          <input type="search" placeholder="Ricerca persone, luoghi..." className="search-input" aria-label="Search people and places" />
        </div>
        <div className="header-right">
          <button aria-label="Help" title="Help (?)"><HelpCircle size={20} /></button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button aria-label="Settings"><Settings size={20} /></button>
          <div className="user-menu-wrapper" style={{ marginLeft: '10px' }}>
            <GoogleLoginButton />
          </div>
        </div>
      </header>
      <div className="main-container">
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`} role="navigation">
          <nav className="worlds-menu">
            <p className="menu-title">I 9 Mondi</p>
            {worlds.map(world => {
              const Icon = world.icon;
              return (
                <a key={world.id} href={world.path} className="world-item" aria-label={world.label}>
                  <Icon size={20} />
                  <span>{world.label}</span>
                </a>
              );
            })}
          </nav>
          <div className="sidebar-footer">
            <div className="filter-section">
              <p className="filter-title">Filtri</p>
              <label><input type="checkbox" />Maschi</label>
              <label><input type="checkbox" />Femmine</label>
              <label><input type="checkbox" />Con foto</label>
            </div>
          </div>
        </aside>
        <main className="main-content" role="main">{children}</main>
      </div>
    </div>
  );
};
