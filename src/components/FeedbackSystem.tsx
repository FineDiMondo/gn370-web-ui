/**
 * Feedback System Components
 *
 * User feedback states for:
 * - Loading states
 * - Error states
 * - Success messages
 * - Warning messages
 * - Info messages
 *
 * Features:
 * - Accessible ARIA labels
 * - Keyboard dismissible
 * - Auto-dismiss with timeout
 * - Animations
 * - Mobile responsive
 */

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Loader2,
} from 'lucide-react';
import './FeedbackSystem.module.css';

export type FeedbackType = 'loading' | 'success' | 'error' | 'warning' | 'info';

export interface FeedbackSystemProps {
  /** Type of feedback message */
  type: FeedbackType;
  /** Main message text */
  message: string;
  /** Optional subtitle or description */
  description?: string;
  /** Auto-dismiss after (ms) - null = no auto-dismiss */
  autoDismiss?: number | null;
  /** Called when feedback is dismissed */
  onDismiss?: () => void;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Whether to show close button */
  showClose?: boolean;
  /** Custom icon element */
  icon?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}

/**
 * FeedbackSystem Component
 *
 * Displays user feedback for various operations
 */
export const FeedbackSystem: React.FC<FeedbackSystemProps> = ({
  type,
  message,
  description,
  autoDismiss = type === 'loading' ? null : 5000,
  onDismiss,
  action,
  showClose = true,
  icon,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoDismiss && type !== 'loading') {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, autoDismiss);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, type, onDismiss]);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleDismiss();
    }
  };

  return (
    <div
      className={`feedback-system feedback-system--${type} ${className || ''}`}
      role="status"
      aria-live={type === 'loading' ? 'polite' : 'assertive'}
      aria-atomic="true"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Icon */}
      <div className="feedback-system__icon" aria-hidden="true">
        {icon ||
          {
            loading: <Loader2 className="spinner" />,
            success: <CheckCircle />,
            error: <AlertCircle />,
            warning: <AlertTriangle />,
            info: <Info />,
          }[type]}
      </div>

      {/* Content */}
      <div className="feedback-system__content">
        <h3 className="feedback-system__message">{message}</h3>
        {description && (
          <p className="feedback-system__description">{description}</p>
        )}
      </div>

      {/* Actions */}
      {(action || showClose) && (
        <div className="feedback-system__actions">
          {action && (
            <button
              className="feedback-system__action-btn"
              onClick={action.onClick}
              aria-label={action.label}
            >
              {action.label}
            </button>
          )}
          {showClose && type !== 'loading' && (
            <button
              className="feedback-system__close-btn"
              onClick={handleDismiss}
              aria-label="Chiudi messaggio"
              title="Chiudi (ESC)"
            >
              <X size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Loading Component
 *
 * Display loading state with spinner
 */
export interface LoadingProps {
  message?: string;
  description?: string;
  onCancel?: () => void;
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Caricamento in corso...',
  description,
  onCancel,
}) => (
  <FeedbackSystem
    type="loading"
    message={message}
    description={description}
    autoDismiss={null}
    showClose={!!onCancel}
    onDismiss={onCancel}
  />
);

/**
 * Success Component
 *
 * Display success message
 */
export interface SuccessProps {
  message: string;
  description?: string;
  autoDismiss?: number;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const Success: React.FC<SuccessProps> = ({
  message,
  description,
  autoDismiss = 5000,
  onDismiss,
  action,
}) => (
  <FeedbackSystem
    type="success"
    message={message}
    description={description}
    autoDismiss={autoDismiss}
    onDismiss={onDismiss}
    action={action}
    showClose={true}
  />
);

/**
 * Error Component
 *
 * Display error message with recovery options
 */
export interface ErrorProps {
  message: string;
  description?: string;
  autoDismiss?: number | null;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export const Error: React.FC<ErrorProps> = ({
  message,
  description,
  autoDismiss = null,
  onDismiss,
  onRetry,
}) => (
  <FeedbackSystem
    type="error"
    message={message}
    description={description}
    autoDismiss={autoDismiss}
    onDismiss={onDismiss}
    action={onRetry ? { label: 'Riprova', onClick: onRetry } : undefined}
    showClose={true}
  />
);

/**
 * Warning Component
 *
 * Display warning message
 */
export interface WarningProps {
  message: string;
  description?: string;
  autoDismiss?: number | null;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const Warning: React.FC<WarningProps> = ({
  message,
  description,
  autoDismiss = 10000,
  onDismiss,
  action,
}) => (
  <FeedbackSystem
    type="warning"
    message={message}
    description={description}
    autoDismiss={autoDismiss}
    onDismiss={onDismiss}
    action={action}
    showClose={true}
  />
);

/**
 * Info Component
 *
 * Display informational message
 */
export interface InfoProps {
  message: string;
  description?: string;
  autoDismiss?: number;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const Info: React.FC<InfoProps> = ({
  message,
  description,
  autoDismiss = 7000,
  onDismiss,
  action,
}) => (
  <FeedbackSystem
    type="info"
    message={message}
    description={description}
    autoDismiss={autoDismiss}
    onDismiss={onDismiss}
    action={action}
    showClose={true}
  />
);

export default FeedbackSystem;
