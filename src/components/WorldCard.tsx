import React from 'react';
import {
  Users,
  Clock,
  Briefcase,
  AlertCircle,
  BookOpen,
  Dna,
  Home,
  Search,
  Globe,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import './WorldCard.module.css';

export type WorldName =
  | 'origini'
  | 'cicli'
  | 'doni'
  | 'ombre'
  | 'contesto'
  | 'struttura'
  | 'eredita'
  | 'nebbia'
  | 'radici';

export type WorldStatus = 'complete' | 'partial' | 'empty';

interface WorldCardProps {
  mondo: WorldName;
  isActive?: boolean;
  status?: WorldStatus;
  dataCount?: number;
  onClick?: () => void;
}

/**
 * WorldCard component representing one of the 9 Mondi in GN370
 *
 * Each mondo has:
 * - Number (1-9)
 * - Title in Italian
 * - Subtitle with user-friendly description
 * - Icon for visual recognition
 * - Status indicator (complete/partial/empty)
 */

const WORLD_CONFIG: Record<
  WorldName,
  {
    number: number;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    color: 'turq' | 'green' | 'amber' | 'red' | 'yellow' | 'cyan' | 'purple' | 'grey' | 'gold';
  }
> = {
  origini: {
    number: 1,
    title: 'ORIGINI',
    subtitle: 'Famiglia & Fonte',
    description: 'Cognome, genitori, fonti documentali. Identità della persona e collegamento ai documenti primari.',
    icon: <Users size={40} strokeWidth={1.5} />,
    color: 'turq',
  },
  cicli: {
    number: 2,
    title: 'CICLI',
    subtitle: 'Vita',
    description: 'Timeline biologica: nascita, matrimonio, morte. Età esatta e luoghi principali.',
    icon: <Clock size={40} strokeWidth={1.5} />,
    color: 'green',
  },
  doni: {
    number: 3,
    title: 'DONI',
    subtitle: 'Professione & Talenti',
    description: 'Occupazione, competenze, istruzione, talenti. Progressione sociale e tradizioni lavorative familiari.',
    icon: <Briefcase size={40} strokeWidth={1.5} />,
    color: 'cyan',
  },
  ombre: {
    number: 4,
    title: 'OMBRE',
    subtitle: 'Difficoltà',
    description: 'Eventi critici: divorzi, morti premature, traumi. Aspetti difficili della storia familiare.',
    icon: <AlertCircle size={40} strokeWidth={1.5} />,
    color: 'red',
  },
  contesto: {
    number: 5,
    title: 'CONTESTO',
    subtitle: 'Storia',
    description: 'Era storica, eventi paralleli. Microstoria (individuo) vs Macrostoria (mondo).',
    icon: <BookOpen size={40} strokeWidth={1.5} />,
    color: 'yellow',
  },
  struttura: {
    number: 6,
    title: 'STRUTTURA',
    subtitle: 'Genetica',
    description: 'DNA patrilineare (Y-DNA) e matrilineare (mtDNA). Catena cromosomica e aplogruppi.',
    icon: <Dna size={40} strokeWidth={1.5} />,
    color: 'purple',
  },
  eredita: {
    number: 7,
    title: 'EREDITÀ',
    subtitle: 'Patrimoni',
    description: 'Proprietà, testamenti, titoli nobiliari. Passaggio di beni e ruoli attraverso le generazioni.',
    icon: <Home size={40} strokeWidth={1.5} />,
    color: 'gold',
  },
  nebbia: {
    number: 8,
    title: 'NEBBIA',
    subtitle: 'Lacune',
    description: 'Informazioni mancanti, record incompleti, vicoli ciechi genealogici. Suggerimenti per ricerca.',
    icon: <Search size={40} strokeWidth={1.5} />,
    color: 'grey',
  },
  radici: {
    number: 9,
    title: 'RADICI',
    subtitle: 'Origine Nome',
    description: 'Etimologia cognome, provenance geografica. Origini remote prima della documentazione certa.',
    icon: <Globe size={40} strokeWidth={1.5} />,
    color: 'amber',
  },
};

const STATUS_CONFIG = {
  complete: {
    icon: <CheckCircle size={20} />,
    label: 'Completo',
    color: 'var(--secondary)', // Green
  },
  partial: {
    icon: <AlertTriangle size={20} />,
    label: 'Parziale',
    color: 'var(--warning)', // Amber
  },
  empty: {
    icon: <HelpCircle size={20} />,
    label: 'Mancante',
    color: 'var(--text-tertiary)', // Grey
  },
};

export const WorldCard: React.FC<WorldCardProps> = ({
  mondo,
  isActive = false,
  status = 'empty',
  dataCount = 0,
  onClick,
}) => {
  const config = WORLD_CONFIG[mondo];
  const statusConfig = STATUS_CONFIG[status];

  const colorClass = `world-card--${config.color}`;

  return (
    <article
      className={`world-card ${colorClass} ${isActive ? 'world-card--active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`${config.number}. ${config.title} - ${config.subtitle}`}
      aria-description={config.description}
    >
      {/* Number Badge */}
      <div className="world-card__number">{config.number}</div>

      {/* Icon */}
      <div className="world-card__icon">{config.icon}</div>

      {/* Header */}
      <div className="world-card__header">
        <h3 className="world-card__title">{config.title}</h3>
        <p className="world-card__subtitle">{config.subtitle}</p>
      </div>

      {/* Description */}
      <p className="world-card__description">{config.description}</p>

      {/* Footer with Status */}
      <div className="world-card__footer">
        <div className="world-card__status" style={{ color: statusConfig.color }}>
          {statusConfig.icon}
          <span className="world-card__status-label">{statusConfig.label}</span>
          {dataCount > 0 && <span className="world-card__count">({dataCount})</span>}
        </div>

        {/* Tooltip trigger */}
        <div className="world-card__tooltip" role="tooltip">
          {config.description}
        </div>
      </div>

      {/* Focus ring for accessibility */}
      <div className="world-card__focus-ring" />
    </article>
  );
};

export default WorldCard;
