import React, { useState } from 'react';
import { usePerformanceMonitoring, getPerformanceMetrics } from '../hooks/usePerformanceMonitoring';
import { BarChart3 } from 'lucide-react';

interface MetricStatus {
  value: number;
  threshold: number;
  status: 'good' | 'needs-improvement' | 'poor';
  unit: string;
}

/**
 * Development-only Performance Monitor
 * Shows Core Web Vitals and performance metrics in real-time
 *
 * Only visible in development mode (process.env.NODE_ENV === 'development')
 */
export const PerformanceMonitor: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [vitals, setVitals] = useState<Record<string, number>>({});

  usePerformanceMonitoring({
    onVitalsUpdate: (newVitals) => {
      setVitals((prev) => ({ ...prev, ...newVitals }));
    },
    onThresholdExceeded: (metric, value, threshold) => {
      console.warn(
        `⚠️ [Performance] ${metric.toUpperCase()} exceeded: ${value.toFixed(2)} > ${threshold}`
      );
    },
  });

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getStatus = (metric: string, value: number): MetricStatus => {
    const thresholds: Record<string, { good: number; needs: number; unit: string }> = {
      lcp: { good: 2500, needs: 4000, unit: 'ms' },
      fid: { good: 100, needs: 300, unit: 'ms' },
      cls: { good: 0.1, needs: 0.25, unit: '' },
      ttfb: { good: 600, needs: 1200, unit: 'ms' },
      fcpn: { good: 1800, needs: 3000, unit: 'ms' },
      inp: { good: 200, needs: 500, unit: 'ms' },
    };

    const config = thresholds[metric] || { good: value, needs: value * 1.5, unit: 'ms' };
    const threshold = config.good;

    let status: 'good' | 'needs-improvement' | 'poor' = 'good';
    if (value > config.needs) status = 'poor';
    else if (value > config.good) status = 'needs-improvement';

    return { value, threshold, status, unit: config.unit };
  };

  const metrics = [
    { key: 'lcp', label: 'LCP (Largest Contentful Paint)', description: '< 2.5s' },
    { key: 'fid', label: 'FID (First Input Delay)', description: '< 100ms' },
    { key: 'cls', label: 'CLS (Cumulative Layout Shift)', description: '< 0.1' },
    { key: 'ttfb', label: 'TTFB (Time to First Byte)', description: '< 600ms' },
    { key: 'fcpn', label: 'FCP (First Contentful Paint)', description: '< 1.8s' },
    { key: 'inp', label: 'INP (Interaction to Next Paint)', description: '< 200ms' },
  ];

  const navMetrics = getPerformanceMetrics();

  const getStatusColor = (status: 'good' | 'needs-improvement' | 'poor'): string => {
    switch (status) {
      case 'good':
        return '#32FF00'; // Green
      case 'needs-improvement':
        return '#FFD700'; // Yellow
      case 'poor':
        return '#FF0000'; // Red
    }
  };

  const getStatusText = (status: 'good' | 'needs-improvement' | 'poor'): string => {
    switch (status) {
      case 'good':
        return '✓ Good';
      case 'needs-improvement':
        return '⚠ Needs Improvement';
      case 'poor':
        return '✗ Poor';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '20px',
        zIndex: 999,
        fontFamily: 'monospace',
      }}
    >
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '50px',
            left: '0',
            backgroundColor: 'rgba(10, 14, 39, 0.95)',
            border: '2px solid #00D9FF',
            borderRadius: '8px',
            padding: '16px',
            maxWidth: '400px',
            maxHeight: '500px',
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0, 217, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            animation: 'slideUp 300ms ease-out',
          }}
        >
          <h3 style={{ color: '#00D9FF', margin: '0 0 12px 0', fontSize: '14px' }}>
            📊 Core Web Vitals
          </h3>

          {metrics.map(({ key, label, description }) => {
            const value = vitals[key];
            if (value === undefined) {
              return (
                <div key={key} style={{ marginBottom: '8px', color: '#6B7A8C', fontSize: '12px' }}>
                  <div>{label}</div>
                  <div style={{ fontSize: '11px', color: '#4A5568' }}>Measuring...</div>
                </div>
              );
            }

            const { status, unit } = getStatus(key, value);
            const color = getStatusColor(status);
            const statusText = getStatusText(status);

            return (
              <div
                key={key}
                style={{
                  marginBottom: '8px',
                  fontSize: '11px',
                  borderLeft: `3px solid ${color}`,
                  paddingLeft: '8px',
                }}
              >
                <div style={{ color: '#A8B5C8' }}>
                  {label}
                  <br />
                  <span style={{ color }}>
                    {value.toFixed(2)}
                    {unit} - {statusText}
                  </span>
                  <br />
                  <span style={{ color: '#6B7A8C' }}>{description}</span>
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: '12px', borderTop: '1px solid #1A1F3A', paddingTop: '8px' }}>
            <h4 style={{ color: '#32FF00', margin: '0 0 8px 0', fontSize: '12px' }}>
              Navigation Timing
            </h4>
            {Object.entries(navMetrics).map(([key, value]) => {
              if (value === undefined) return null;
              return (
                <div key={key} style={{ color: '#A8B5C8', fontSize: '11px', marginBottom: '4px' }}>
                  {key.toUpperCase()}: {value.toFixed(2)}ms
                </div>
              );
            })}
          </div>

          <p
            style={{
              color: '#6B7A8C',
              fontSize: '10px',
              margin: '12px 0 0 0',
              lineHeight: '1.4',
            }}
          >
            💡 Tip: Open DevTools &gt; Performance tab to record traces
          </p>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#00D9FF',
          color: '#000000',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0, 217, 255, 0.3)',
          fontSize: '20px',
          fontWeight: 'bold',
          transition: 'all 150ms ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
        }}
        title="Toggle Performance Monitor"
        aria-label="Performance metrics"
      >
        <BarChart3 size={24} />
      </button>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default PerformanceMonitor;
