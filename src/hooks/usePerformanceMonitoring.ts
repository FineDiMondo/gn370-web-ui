import { useEffect, useRef } from 'react';

/**
 * Core Web Vitals metrics
 * LCP: Largest Contentful Paint (< 2.5s target)
 * FID: First Input Delay (< 100ms target)
 * CLS: Cumulative Layout Shift (< 0.1 target)
 * TTFB: Time to First Byte (< 600ms target)
 */

interface CoreWebVitals {
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  fcpn?: number;
  inp?: number;
}

interface PerformanceCallbacks {
  onVitalsUpdate?: (vitals: CoreWebVitals) => void;
  onThresholdExceeded?: (metric: string, value: number, threshold: number) => void;
}

const THRESHOLDS = {
  lcp: 2500,      // 2.5 seconds
  fid: 100,       // 100ms
  cls: 0.1,       // 0.1
  ttfb: 600,      // 600ms
  fcpn: 1800,     // 1.8 seconds (First Contentful Paint)
  inp: 200,       // 200ms (Interaction to Next Paint)
};

/**
 * Custom hook for monitoring Core Web Vitals
 *
 * @param callbacks - Callbacks for vitals updates and threshold exceeded
 *
 * @example
 * ```tsx
 * usePerformanceMonitoring({
 *   onVitalsUpdate: (vitals) => console.log('Vitals:', vitals),
 *   onThresholdExceeded: (metric, value, threshold) => {
 *     console.warn(`${metric} exceeded: ${value}ms > ${threshold}ms`);
 *   }
 * });
 * ```
 */
export const usePerformanceMonitoring = (
  callbacks?: PerformanceCallbacks
) => {
  const vitalsRef = useRef<CoreWebVitals>({});
  const observersRef = useRef<PerformanceObserver[]>([]);

  useEffect(() => {
    // LCP: Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          const lcp = lastEntry.renderTime || lastEntry.loadTime;

          vitalsRef.current.lcp = lcp;
          checkThreshold('lcp', lcp);
          callbacks?.onVitalsUpdate?.(vitalsRef.current);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        observersRef.current.push(lcpObserver);
      } catch (e) {
        console.debug('LCP monitoring not supported');
      }
    }

    // CLS: Cumulative Layout Shift
    if ('PerformanceObserver' in window) {
      try {
        let cls = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).hadRecentInput) continue;
            cls += (entry as any).value;
          }
          vitalsRef.current.cls = cls;
          checkThreshold('cls', cls);
          callbacks?.onVitalsUpdate?.(vitalsRef.current);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        observersRef.current.push(clsObserver);
      } catch (e) {
        console.debug('CLS monitoring not supported');
      }
    }

    // FCP: First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            const fcp = entries[entries.length - 1].startTime;
            vitalsRef.current.fcpn = fcp;
            checkThreshold('fcpn', fcp);
            callbacks?.onVitalsUpdate?.(vitalsRef.current);
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        observersRef.current.push(fcpObserver);
      } catch (e) {
        console.debug('FCP monitoring not supported');
      }
    }

    // INP: Interaction to Next Paint (new metric, replaces FID)
    if ('PerformanceObserver' in window) {
      try {
        const inpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1];
            const inp = (lastEntry as any).duration;
            vitalsRef.current.inp = inp;
            checkThreshold('inp', inp);
            callbacks?.onVitalsUpdate?.(vitalsRef.current);
          }
        });
        inpObserver.observe({ entryTypes: ['interaction'] });
        observersRef.current.push(inpObserver);
      } catch (e) {
        console.debug('INP monitoring not supported');
      }
    }

    // TTFB: Time to First Byte (from Navigation Timing API)
    if ('performance' in window) {
      const navigationTiming = performance.timing;
      if (navigationTiming) {
        const ttfb = navigationTiming.responseStart - navigationTiming.fetchStart;
        vitalsRef.current.ttfb = ttfb;
        checkThreshold('ttfb', ttfb);
        callbacks?.onVitalsUpdate?.(vitalsRef.current);
      }
    }

    // Cleanup
    return () => {
      observersRef.current.forEach((observer) => observer.disconnect());
      observersRef.current = [];
    };
  }, [callbacks]);

  const checkThreshold = (metric: keyof typeof THRESHOLDS, value: number) => {
    const threshold = THRESHOLDS[metric];
    if (value > threshold) {
      callbacks?.onThresholdExceeded?.(metric, value, threshold);
    }
  };

  return vitalsRef.current;
};

/**
 * Get current performance metrics
 */
export const getPerformanceMetrics = (): CoreWebVitals & {
  fcp?: number;
  dcl?: number;
  load?: number;
} => {
  const metrics: any = {};

  if ('performance' in window) {
    const perfData = performance.timing;
    const perfEntries = performance.getEntriesByType('navigation')[0] as any;

    if (perfData) {
      metrics.ttfb = perfData.responseStart - perfData.fetchStart;
      metrics.fcp = perfData.responseEnd - perfData.fetchStart;
      metrics.dcl =
        perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;
      metrics.load = perfData.loadEventEnd - perfData.loadEventStart;
    }

    if (perfEntries) {
      metrics.dns = perfEntries.domainLookupEnd - perfEntries.domainLookupStart;
      metrics.tcp =
        perfEntries.connectEnd -
        (perfEntries.secureConnectionStart || perfEntries.connectStart);
      metrics.ttl =
        perfEntries.responseStart - perfEntries.requestStart;
    }
  }

  return metrics;
};

/**
 * Report vitals to external service (e.g., analytics)
 */
export const reportVitals = (vitals: CoreWebVitals) => {
  if (!vitals || Object.keys(vitals).length === 0) {
    return;
  }

  // In production, send to analytics endpoint
  if (process.env.NODE_ENV === 'production') {
    // Example: fetch('/api/metrics', { method: 'POST', body: JSON.stringify(vitals) })
    console.log('[Performance] Vitals:', vitals);
  } else {
    // In development, log to console
    console.group('[Performance Vitals]');
    Object.entries(vitals).forEach(([key, value]) => {
      if (value !== undefined) {
        const unit = ['lcp', 'fid', 'ttfb', 'fcpn', 'inp'].includes(key) ? 'ms' : '';
        console.log(`${key.toUpperCase()}: ${value.toFixed(2)}${unit}`);
      }
    });
    console.groupEnd();
  }
};

/**
 * Measure custom metric
 */
export const measureMetric = (
  name: string,
  callback: () => void | Promise<void>
): number => {
  const start = performance.now();
  callback();
  const end = performance.now();
  const duration = end - start;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Metric] ${name}: ${duration.toFixed(2)}ms`);
  }

  return duration;
};

/**
 * Create a performance mark for profiling
 */
export const createPerfMark = (label: string) => {
  if ('performance' in window && 'mark' in performance) {
    performance.mark(`${label}-start`);
    return () => {
      performance.mark(`${label}-end`);
      try {
        performance.measure(label, `${label}-start`, `${label}-end`);
        const measure = performance.getEntriesByName(label)[0] as PerformanceMeasure;
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Mark] ${label}: ${measure.duration.toFixed(2)}ms`);
        }
      } catch (e) {
        console.debug('Performance mark not supported');
      }
    };
  }
  return () => {};
};

export default usePerformanceMonitoring;
