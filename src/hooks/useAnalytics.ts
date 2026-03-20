import { useCallback, useContext } from 'react';

export interface AnalyticsEvent {
  eventName: string;
  eventData?: Record<string, any>;
  timestamp?: number;
  sessionId?: string;
  userId?: string;
}

export interface AnalyticsConfig {
  enabled: boolean;
  trackingId?: string;
  anonymizeIp?: boolean;
  dataRetention?: number;
  consentRequired?: boolean;
  privacyMode?: boolean;
}

const AnalyticsContext = React.createContext<{
  trackEvent: (event: AnalyticsEvent) => void;
  config: AnalyticsConfig;
  setConsent: (consent: boolean) => void;
}>({
  trackEvent: () => {},
  config: { enabled: false },
  setConsent: () => {},
});

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    return {
      trackEvent: () => {},
      config: { enabled: false },
      setConsent: () => {},
    };
  }
  return context;
}

export function trackAnalyticsEvent(
  eventName: string,
  eventData?: Record<string, any>,
) {
  const analytics = useAnalytics();
  useCallback(() => {
    if (analytics.config.enabled) {
      analytics.trackEvent({ eventName, eventData, timestamp: Date.now() });
    }
  }, [analytics, eventName, eventData])();
}

export const analyticsEvents = {
  // Page views
  PAGE_VIEW: 'page_view',
  SCREEN_VIEW: 'screen_view',

  // User actions
  IMPORT_GEDCOM: 'import_gedcom',
  EXPORT_FAMILY: 'export_family',
  SEARCH_PERSON: 'search_person',
  VIEW_PERSON: 'view_person',
  NAVIGATE_TREE: 'navigate_tree',
  ZOOM_TREE: 'zoom_tree',

  // Feature usage
  ONBOARDING_START: 'onboarding_start',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  ONBOARDING_SKIP: 'onboarding_skip',
  HELP_OPENED: 'help_opened',
  HELP_SEARCH: 'help_search',
  HELP_ARTICLE_VIEW: 'help_article_view',

  // Settings
  THEME_CHANGED: 'theme_changed',
  LANGUAGE_CHANGED: 'language_changed',
  SETTINGS_UPDATED: 'settings_updated',

  // Errors
  ERROR_OCCURRED: 'error_occurred',
  VALIDATION_ERROR: 'validation_error',

  // Performance
  PERFORMANCE_METRIC: 'performance_metric',
  API_CALL: 'api_call',

  // User engagement
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  USER_IDLE: 'user_idle',
};

export default useAnalytics;
