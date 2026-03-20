/**
 * Onboarding Tutorial Component - Task #3
 *
 * Interactive tutorial for first-time users
 * Features:
 * - Multi-step guided tour
 * - Skip/complete options
 * - Progress tracking
 * - Keyboard navigation
 * - Mobile responsive
 * - WCAG AA accessible
 */

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, X, Check } from 'lucide-react';
import './OnboardingTutorial.module.css';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface OnboardingTutorialProps {
  steps: OnboardingStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onSkip?: () => void;
  startAtStep?: number;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  steps,
  isOpen,
  onClose,
  onComplete,
  onSkip,
  startAtStep = 0,
}) => {
  const [currentStep, setCurrentStep] = useState(startAtStep);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(startAtStep);
      setCompleted(false);
    }
  }, [isOpen, startAtStep]);

  if (!isOpen || completed) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  const handleNext = () => {
    if (isLast) {
      setCompleted(true);
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setCompleted(true);
    onSkip?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' && !isLast) handleNext();
    if (e.key === 'ArrowLeft' && !isFirst) handlePrev();
    if (e.key === 'Escape') handleSkip();
  };

  return (
    <>
      {/* Overlay */}
      <div className="onboarding__overlay" onClick={handleSkip} />

      {/* Tutorial Box */}
      <div
        className="onboarding__box"
        role="dialog"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-description"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Close Button */}
        <button
          className="onboarding__close"
          onClick={onClose}
          aria-label="Chiudi tutorial"
          title="Chiudi (ESC)"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="onboarding__content">
          <h2 id="onboarding-title" className="onboarding__title">
            {step.title}
          </h2>
          <p id="onboarding-description" className="onboarding__description">
            {step.description}
          </p>

          {/* Action Button */}
          {step.action && (
            <button className="onboarding__action" onClick={step.action.onClick}>
              {step.action.label}
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="onboarding__progress">
          <div className="onboarding__dots">
            {steps.map((_, index) => (
              <button
                key={index}
                className={`onboarding__dot ${index === currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(index)}
                aria-label={`Vai al passo ${index + 1}`}
                aria-current={index === currentStep ? 'step' : undefined}
              />
            ))}
          </div>
          <span className="onboarding__counter">
            {currentStep + 1} di {steps.length}
          </span>
        </div>

        {/* Controls */}
        <div className="onboarding__controls">
          <button
            className="onboarding__btn onboarding__btn--ghost"
            onClick={handleSkip}
            aria-label="Salta tutorial"
          >
            Salta
          </button>

          <div className="onboarding__nav">
            <button
              className="onboarding__btn onboarding__btn--nav"
              onClick={handlePrev}
              disabled={isFirst}
              aria-label="Passo precedente"
              title="Freccia sinistra"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              className="onboarding__btn onboarding__btn--primary"
              onClick={handleNext}
              aria-label={isLast ? 'Completa tutorial' : 'Passo successivo'}
              title={isLast ? 'Invio per completare' : 'Freccia destra per continuare'}
            >
              {isLast ? (
                <>
                  <Check size={18} /> Completa
                </>
              ) : (
                <>
                  Avanti <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Default onboarding steps for GN370
 */
export const DEFAULT_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Benvenuto in GN370',
    description:
      'La piattaforma per esplorare e gestire alberi genealogici. In questo tutorial ti mostreremo le funzioni principali.',
    position: 'bottom',
  },
  {
    id: 'import-gedcom',
    title: 'Importa un file GEDCOM',
    description:
      'Carica il tuo file genealogico in formato GEDCOM per iniziare. Supporta file fino a 100MB.',
    target: '[data-tutorial="import"]',
    action: {
      label: 'Apri Importazione',
      onClick: () => console.log('Open import'),
    },
  },
  {
    id: 'view-tree',
    title: 'Visualizza il tuo albero genealogico',
    description:
      'Esplora le relazioni familiari con una visualizzazione interattiva. Zoom, pan, e clicca su una persona per i dettagli.',
    target: '[data-tutorial="tree"]',
    position: 'left',
  },
  {
    id: 'person-details',
    title: 'Dettagli della persona',
    description:
      'Visualizza informazioni complete su ogni persona: date di nascita/morte, luogo, foto, e relazioni familiari.',
    target: '[data-tutorial="person"]',
    position: 'left',
  },
  {
    id: 'navigation',
    title: 'Navigazione mobile',
    description:
      'Usa il menu in basso per navigare tra le diverse sezioni: Home, Albero, Persone, Aiuto e Impostazioni.',
    target: '[data-tutorial="nav"]',
    position: 'top',
  },
  {
    id: 'help-system',
    title: 'Centro di aiuto',
    description:
      'Accedi alla sezione Aiuto per tutorial, domande frequenti, e contattare il supporto.',
    target: '[data-tutorial="help"]',
    position: 'left',
  },
  {
    id: 'settings',
    title: 'Impostazioni',
    description:
      'Personalizza le tue preferenze: tema scuro, lingua, privacy, e gestione account.',
    target: '[data-tutorial="settings"]',
    position: 'left',
  },
  {
    id: 'complete',
    title: 'Pronto per iniziare!',
    description:
      'Hai imparato le funzioni principali. Ora puoi esplorare il tuo albero genealogico. Divertiti!',
    position: 'bottom',
  },
];

export default OnboardingTutorial;
