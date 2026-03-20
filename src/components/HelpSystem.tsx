/**
 * Help System Component - Task #5
 *
 * Comprehensive help center with:
 * - FAQ section
 * - Search functionality
 * - Contact support
 * - Knowledge base
 * - Video tutorials
 */

import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, MessageCircle, Play } from 'lucide-react';
import './HelpSystem.module.css';

export interface HelpArticle {
  id: string;
  category: 'faq' | 'guide' | 'tutorial' | 'troubleshoot';
  question: string;
  answer: string;
  keywords: string[];
  videoUrl?: string;
}

export interface HelpSystemProps {
  articles?: HelpArticle[];
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_ARTICLES: HelpArticle[] = [
  {
    id: 'faq-1',
    category: 'faq',
    question: 'Come importo un file GEDCOM?',
    answer:
      'Fai clic su "Importa" nel menu principale, seleziona il file GEDCOM dal tuo computer, e segui la procedura guidata di validazione.',
    keywords: ['importare', 'gedcom', 'file', 'upload'],
  },
  {
    id: 'faq-2',
    category: 'faq',
    question: 'Qual è il formato GEDCOM supportato?',
    answer:
      'Supportiamo GEDCOM 5.5 e versioni precedenti. I file non devono superare 100MB. Contatta il supporto per file più grandi.',
    keywords: ['gedcom', 'formato', 'versione', 'size'],
  },
  {
    id: 'guide-1',
    category: 'guide',
    question: 'Guida: Visualizzazione dell\'albero genealogico',
    answer:
      'Usa i controlli di zoom e pan per esplorare. Clicca su una persona per vederne i dettagli. I colori indicano diversi tipi di relazioni.',
    keywords: ['albero', 'visualizzazione', 'zoom', 'pan'],
  },
  {
    id: 'tutorial-1',
    category: 'tutorial',
    question: 'Video Tutorial: Primi passi',
    answer:
      'Guarda il nostro video tutorial per imparare le basi di GN370 in 5 minuti.',
    keywords: ['video', 'tutorial', 'beginner', 'start'],
    videoUrl: 'https://example.com/video1',
  },
  {
    id: 'troubleshoot-1',
    category: 'troubleshoot',
    question: 'Errore: File GEDCOM non valido',
    answer:
      'Questo errore si verifica quando il file non rispetta lo standard GEDCOM. Verifica che il file sia codificato in UTF-8 e non danneggiato.',
    keywords: ['errore', 'gedcom', 'non valido', 'damaged'],
  },
];

export const HelpSystem: React.FC<HelpSystemProps> = ({
  articles = DEFAULT_ARTICLES,
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredArticles = useMemo(() => {
    if (!searchQuery) return articles;

    const query = searchQuery.toLowerCase();
    return articles.filter(
      (article) =>
        article.question.toLowerCase().includes(query) ||
        article.answer.toLowerCase().includes(query) ||
        article.keywords.some((k) => k.toLowerCase().includes(query))
    );
  }, [searchQuery, articles]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'faq':
        return '❓';
      case 'guide':
        return '📖';
      case 'tutorial':
        return '🎥';
      case 'troubleshoot':
        return '🔧';
      default:
        return '📚';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'faq':
        return 'Domande Frequenti';
      case 'guide':
        return 'Guide';
      case 'tutorial':
        return 'Tutorial';
      case 'troubleshoot':
        return 'Risoluzione Problemi';
      default:
        return 'Altro';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="help-system" role="dialog" aria-labelledby="help-title">
      <div className="help-system__header">
        <h1 id="help-title" className="help-system__title">
          Centro di Aiuto
        </h1>
        <button
          className="help-system__close"
          onClick={onClose}
          aria-label="Chiudi aiuto"
        >
          ✕
        </button>
      </div>

      <div className="help-system__search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Cerca aiuto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="help-system__search-input"
          aria-label="Ricerca articoli di aiuto"
        />
      </div>

      <div className="help-system__articles">
        {filteredArticles.map((article) => (
          <div key={article.id} className="help-article">
            <button
              className="help-article__header"
              onClick={() =>
                setExpandedId(expandedId === article.id ? null : article.id)
              }
              aria-expanded={expandedId === article.id}
            >
              <span className="help-article__icon">
                {getCategoryIcon(article.category)}
              </span>
              <span className="help-article__question">{article.question}</span>
              <ChevronDown
                size={18}
                className={expandedId === article.id ? 'rotated' : ''}
              />
            </button>

            {expandedId === article.id && (
              <div className="help-article__content">
                <p className="help-article__answer">{article.answer}</p>
                {article.videoUrl && (
                  <a
                    href={article.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="help-article__video-link"
                  >
                    <Play size={16} /> Guarda video
                  </a>
                )}
              </div>
            )}

            <span className="help-article__category">
              {getCategoryLabel(article.category)}
            </span>
          </div>
        ))}

        {filteredArticles.length === 0 && (
          <div className="help-system__empty">
            <p>Nessun risultato trovato per "{searchQuery}"</p>
          </div>
        )}
      </div>

      <div className="help-system__footer">
        <button className="help-system__contact">
          <MessageCircle size={18} /> Contatta il Supporto
        </button>
      </div>
    </div>
  );
};

export default HelpSystem;
