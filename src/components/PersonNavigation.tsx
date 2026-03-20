import React, { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import './PersonNavigation.module.css';

export interface Person {
  id: string;
  name: string;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  occupation?: string;
  parents?: Person[];
  children?: Person[];
  spouse?: Person;
}

export interface PersonNavigationProps {
  currentPerson: Person;
  onNavigate: (personId: string) => void;
  allPeople?: Person[];
}

/**
 * Person Navigation Component
 *
 * Features:
 * - Breadcrumb trail showing ancestor path
 * - Previous/Next navigation buttons
 * - Related persons sidebar (parents, children, spouse)
 * - Search within tree
 * - Keyboard shortcuts (←→ for prev/next, ↑↓ for parent/child)
 */
export const PersonNavigation: React.FC<PersonNavigationProps> = ({
  currentPerson,
  onNavigate,
  allPeople = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Get breadcrumb trail (ancestors up to root)
  const breadcrumb = useMemo(() => {
    const trail: Person[] = [currentPerson];
    let current = currentPerson;

    while (current.parents && current.parents.length > 0) {
      current = current.parents[0]; // Take first parent
      trail.unshift(current);
    }

    return trail;
  }, [currentPerson]);

  // Get related persons
  const relatedPersons = useMemo(() => {
    const related: { category: string; persons: Person[] }[] = [];

    if (currentPerson.parents && currentPerson.parents.length > 0) {
      related.push({ category: 'Parents', persons: currentPerson.parents });
    }

    if (currentPerson.spouse) {
      related.push({ category: 'Spouse', persons: [currentPerson.spouse] });
    }

    if (currentPerson.children && currentPerson.children.length > 0) {
      related.push({ category: 'Children', persons: currentPerson.children });
    }

    return related;
  }, [currentPerson]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return allPeople.filter(
      (person) =>
        person.name.toLowerCase().includes(query) ||
        person.birthPlace?.toLowerCase().includes(query) ||
        person.occupation?.toLowerCase().includes(query)
    );
  }, [searchQuery, allPeople]);

  // Previous/Next persons in search results
  const previousPerson = useMemo(() => {
    const currentIndex = allPeople.findIndex((p) => p.id === currentPerson.id);
    return currentIndex > 0 ? allPeople[currentIndex - 1] : undefined;
  }, [currentPerson, allPeople]);

  const nextPerson = useMemo(() => {
    const currentIndex = allPeople.findIndex((p) => p.id === currentPerson.id);
    return currentIndex < allPeople.length - 1 ? allPeople[currentIndex + 1] : undefined;
  }, [currentPerson, allPeople]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent) {
        // Allow keyboard navigation even if input is focused
        if (e.key === 'ArrowLeft' && previousPerson) {
          e.preventDefault();
          onNavigate(previousPerson.id);
        } else if (e.key === 'ArrowRight' && nextPerson) {
          e.preventDefault();
          onNavigate(nextPerson.id);
        } else if (e.key === 'ArrowUp' && currentPerson.parents?.[0]) {
          e.preventDefault();
          onNavigate(currentPerson.parents[0].id);
        } else if (e.key === 'ArrowDown' && currentPerson.children?.[0]) {
          e.preventDefault();
          onNavigate(currentPerson.children[0].id);
        }
      }
    },
    [previousPerson, nextPerson, currentPerson, onNavigate]
  );

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const formatDate = (date?: string): string => {
    if (!date) return '';
    // Assuming format YYYY-MM-DD
    const [year, month, day] = date.split('-');
    return `${day || ''} ${['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(month!) || 0]} ${year}`.trim();
  };

  return (
    <div className="person-navigation">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb" role="navigation" aria-label="Ancestor breadcrumb">
        {breadcrumb.map((person, index) => (
          <React.Fragment key={person.id}>
            {index > 0 && <span className="breadcrumb-separator">›</span>}
            <button
              className={`breadcrumb-item ${person.id === currentPerson.id ? 'active' : ''}`}
              onClick={() => onNavigate(person.id)}
              aria-label={`Navigate to ${person.name}`}
            >
              <span className="breadcrumb-name">{person.name}</span>
              {person.birthDate && (
                <span className="breadcrumb-date">({person.birthDate.substring(0, 4)})</span>
              )}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="nav-controls" role="toolbar" aria-label="Person navigation">
        <button
          className="nav-btn nav-btn--prev"
          onClick={() => previousPerson && onNavigate(previousPerson.id)}
          disabled={!previousPerson}
          title="Previous person (← arrow key)"
          aria-label={`Go to previous person${previousPerson ? `: ${previousPerson.name}` : ''}`}
        >
          <ChevronLeft size={20} />
          <span className="nav-btn__label">Prev</span>
        </button>

        <div className="search-container">
          <button
            className="search-btn"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            title="Search tree"
            aria-label="Open search"
          >
            <Search size={18} />
          </button>

          {isSearchOpen && (
            <div className="search-box">
              <input
                type="text"
                placeholder="Cerca per nome, luogo, professione..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                autoFocus
                aria-label="Search people"
              />
              <button
                className="search-close"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                aria-label="Close search"
              >
                <X size={18} />
              </button>

              {searchResults.length > 0 && (
                <div className="search-results" role="list">
                  {searchResults.slice(0, 5).map((person) => (
                    <button
                      key={person.id}
                      className="search-result-item"
                      onClick={() => {
                        onNavigate(person.id);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      role="listitem"
                    >
                      <div className="result-name">{person.name}</div>
                      <div className="result-details">
                        {person.birthDate && `b. ${person.birthDate.substring(0, 4)}`}
                        {person.birthPlace && ` in ${person.birthPlace}`}
                      </div>
                    </button>
                  ))}
                  {searchResults.length > 5 && (
                    <div className="search-results-more">
                      +{searchResults.length - 5} other results
                    </div>
                  )}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && (
                <div className="search-no-results">No results for "{searchQuery}"</div>
              )}
            </div>
          )}
        </div>

        <button
          className="nav-btn nav-btn--next"
          onClick={() => nextPerson && onNavigate(nextPerson.id)}
          disabled={!nextPerson}
          title="Next person (→ arrow key)"
          aria-label={`Go to next person${nextPerson ? `: ${nextPerson.name}` : ''}`}
        >
          <span className="nav-btn__label">Next</span>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Related Persons Sidebar */}
      {relatedPersons.length > 0 && (
        <div className="related-persons" role="navigation" aria-label="Related people">
          {relatedPersons.map(({ category, persons }) => (
            <div key={category} className="related-category">
              <h3 className="related-category__title">{category}</h3>
              <div className="related-cards">
                {persons.map((person) => (
                  <button
                    key={person.id}
                    className="related-card"
                    onClick={() => onNavigate(person.id)}
                    aria-label={`Navigate to ${person.name}`}
                  >
                    <div className="card-name">{person.name}</div>
                    {person.birthDate && (
                      <div className="card-date">
                        b. {formatDate(person.birthDate)}
                      </div>
                    )}
                    {person.birthPlace && (
                      <div className="card-place">{person.birthPlace}</div>
                    )}
                    {person.occupation && (
                      <div className="card-occupation">{person.occupation}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Keyboard Hints */}
      <div className="keyboard-hints" role="complementary">
        <span className="hint">← → Next/Prev</span>
        <span className="hint-separator">•</span>
        <span className="hint">↑ Parent</span>
        <span className="hint-separator">•</span>
        <span className="hint">↓ Child</span>
      </div>
    </div>
  );
};

export default PersonNavigation;
