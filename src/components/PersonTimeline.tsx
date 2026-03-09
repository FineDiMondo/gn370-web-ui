/**
 * PersonTimeline — Timeline SVG per persona con separatori =ERA=
 * GN370 V2.0 · STEP 15 (timeline.js equivalente React)
 *
 * Mostra la vita di una persona su una linea orizzontale con:
 * - Fasce colorate per ogni era storica siciliana
 * - *MARK* nascita (B), morte (D), matrimonio (M)
 * - ~GAP~ come zone tratteggiate
 * - Tooltip al hover
 */

import React, { useState } from 'react';

// ─── Ere storiche (=ERA=) ─────────────────────────────────────────────────────

interface Era {
  id: string;
  label: string;
  from: number;
  to: number;
  color: string;
  symbol: string;
}

const ERAS: Era[] = [
  { id: 'normanna',      label: '=NORMANNA=',      from: 1072, to: 1266, color: 'rgba(139, 26, 26, 0.15)',  symbol: '⚜' },
  { id: 'aragonese',     label: '=ARAGONESE=',      from: 1282, to: 1516, color: 'rgba(110, 26, 74, 0.15)',  symbol: '✦' },
  { id: 'vicereale',     label: '=VICEREALE=',      from: 1516, to: 1816, color: 'rgba(26, 26, 110, 0.15)',  symbol: '☩' },
  { id: 'borbonica',     label: '=BORBONICA=',      from: 1816, to: 1861, color: 'rgba(139, 69, 19, 0.15)',  symbol: '✠' },
  { id: 'risorgimento',  label: '=RISORGIMENTO=',   from: 1848, to: 1870, color: 'rgba(0, 120, 0, 0.15)',    symbol: '★' },
  { id: 'unitaria',      label: '=UNITARIA=',       from: 1861, to: 2026, color: 'rgba(0, 80, 160, 0.12)',   symbol: '★' },
];

// ─── Tipi eventi ─────────────────────────────────────────────────────────────

type EventType = 'BIRT' | 'DEAT' | 'MARR' | 'OCCU' | 'NOTE' | 'GAP' | 'OTHER';

interface TimelineEvent {
  year: number;
  type: EventType;
  label: string;
  source?: string;
  isGap?: boolean;
}

export interface PersonTimelineProps {
  personName: string;
  birthYear?: number | null;
  deathYear?: number | null;
  events?: TimelineEvent[];
  gaps?: Array<{ from: number; to: number; label: string }>;
}

// ─── Costanti layout ─────────────────────────────────────────────────────────

const SVG_HEIGHT = 160;
const TIMELINE_Y = 90;       // y della linea principale
const ERA_H = 40;            // altezza fascia era
const ERA_Y = TIMELINE_Y - ERA_H / 2;
const MARK_RADIUS = 6;
const PADDING_YEARS = 30;    // anni di padding a sx/dx

// ─── Helper ───────────────────────────────────────────────────────────────────

function parseYear(s?: string): number | null {
  if (!s) return null;
  const m = s.match(/\d{4}/);
  return m ? parseInt(m[0]) : null;
}

function parseEvents(rawEvents: string[]): TimelineEvent[] {
  return rawEvents.flatMap(raw => {
    // "BIRT: ABT 1500" | "DEAT: 1580" | "MARR: 1775 Palermo"
    const tagMatch = raw.match(/^(BIRT|DEAT|MARR|OCCU|NOTE)[:\s]+(.*)$/i);
    if (!tagMatch) return [];
    const type = tagMatch[1].toUpperCase() as EventType;
    const rest = tagMatch[2];
    const year = parseYear(rest);
    if (!year) return [];
    return [{ year, type, label: raw }];
  });
}

function eventColor(type: EventType): string {
  switch (type) {
    case 'BIRT': return 'var(--accent-color)';
    case 'DEAT': return 'var(--alert-color)';
    case 'MARR': return 'var(--hint-color)';
    case 'OCCU': return 'var(--secondary-color)';
    default:     return 'var(--text-color)';
  }
}

function eventSymbol(type: EventType): string {
  switch (type) {
    case 'BIRT': return '★';
    case 'DEAT': return '✝';
    case 'MARR': return '♥';
    case 'OCCU': return '⚙';
    default:     return '·';
  }
}

// ─── Componente ───────────────────────────────────────────────────────────────

export const PersonTimeline: React.FC<PersonTimelineProps & {
  rawEvents?: string[];
  rawGaps?: Array<{ priority?: string; description?: string; type?: string }>;
}> = ({
  personName,
  birthYear,
  deathYear,
  events: propEvents,
  gaps: propGaps,
  rawEvents = [],
  rawGaps = [],
}) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  // Costruisci lista eventi
  const events: TimelineEvent[] = propEvents ?? parseEvents(rawEvents);

  // Calcola range anni
  const allYears = [
    birthYear,
    deathYear,
    ...events.map(e => e.year),
  ].filter(Boolean) as number[];

  if (allYears.length === 0) {
    return (
      <div style={{ color: 'var(--secondary-color)', padding: '10px', fontSize: '0.9rem' }}>
        ~GAP~ Nessun dato cronologico disponibile per questa persona.
      </div>
    );
  }

  const minYear = Math.min(...allYears) - PADDING_YEARS;
  const maxYear = Math.max(...allYears) + PADDING_YEARS;
  const span = maxYear - minYear;

  // Mappa anno → x (pixel)
  const SVG_W = Math.max(600, span * 2.5);
  function yearToX(year: number): number {
    return ((year - minYear) / span) * (SVG_W - 40) + 20;
  }

  // Gap da props o da rawGaps
  const gaps = propGaps ?? rawGaps.map((g, i) => ({
    from: minYear + 10 + i * 20,
    to: minYear + 50 + i * 20,
    label: g.description ?? `~GAP-${i}~`
  }));

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        width={SVG_W}
        height={SVG_HEIGHT}
        style={{ display: 'block', fontFamily: 'inherit' }}
        aria-label={`Timeline di ${personName}`}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* ── Fasce ERA ── */}
        {ERAS.map(era => {
          if (era.to < minYear || era.from > maxYear) return null;
          const x1 = yearToX(Math.max(era.from, minYear));
          const x2 = yearToX(Math.min(era.to, maxYear));
          if (x2 <= x1) return null;
          return (
            <g key={era.id}>
              <rect
                x={x1} y={ERA_Y} width={x2 - x1} height={ERA_H}
                fill={era.color}
              />
              <text
                x={(x1 + x2) / 2} y={ERA_Y + 13}
                textAnchor="middle"
                fontSize={8}
                fill="var(--secondary-color)"
                opacity={0.7}
              >
                {era.symbol} {era.label}
              </text>
            </g>
          );
        })}

        {/* ── ~GAP~ (zone tratteggiate) ── */}
        {gaps.map((g, i) => {
          const x1 = yearToX(Math.max(g.from, minYear));
          const x2 = yearToX(Math.min(g.to, maxYear));
          return (
            <rect
              key={`gap-${i}`}
              x={x1} y={TIMELINE_Y - 20} width={x2 - x1} height={40}
              fill="rgba(255,80,80,0.07)"
              stroke="var(--alert-color)"
              strokeWidth={0.8}
              strokeDasharray="4,3"
              opacity={0.6}
              onMouseEnter={_e => setTooltip({ x: (x1 + x2) / 2, y: TIMELINE_Y - 25, text: g.label })}
            />
          );
        })}

        {/* ── Linea principale ── */}
        <line
          x1={20} y1={TIMELINE_Y} x2={SVG_W - 20} y2={TIMELINE_Y}
          stroke="var(--text-color)" strokeWidth={1.5} opacity={0.4}
        />

        {/* ── Tacche anni (ogni 50) ── */}
        {Array.from({ length: Math.ceil(span / 50) + 1 }, (_, i) => {
          const year = Math.ceil(minYear / 50) * 50 + i * 50;
          if (year > maxYear) return null;
          const x = yearToX(year);
          return (
            <g key={`tick-${year}`}>
              <line x1={x} y1={TIMELINE_Y - 5} x2={x} y2={TIMELINE_Y + 5}
                stroke="var(--text-color)" strokeWidth={1} opacity={0.3} />
              <text x={x} y={TIMELINE_Y + 18} textAnchor="middle"
                fontSize={8} fill="var(--secondary-color)" opacity={0.5}>
                {year}
              </text>
            </g>
          );
        })}

        {/* ── *MARK* nascita / morte (barre verticali) ── */}
        {birthYear && (
          <line
            x1={yearToX(birthYear)} y1={TIMELINE_Y - 30}
            x2={yearToX(birthYear)} y2={TIMELINE_Y + 30}
            stroke="var(--accent-color)" strokeWidth={2}
          />
        )}
        {deathYear && (
          <line
            x1={yearToX(deathYear)} y1={TIMELINE_Y - 30}
            x2={yearToX(deathYear)} y2={TIMELINE_Y + 30}
            stroke="var(--alert-color)" strokeWidth={2} strokeDasharray="4,2"
          />
        )}

        {/* ── Vita (barra piena tra nascita e morte) ── */}
        {birthYear && deathYear && (
          <rect
            x={yearToX(birthYear)}
            y={TIMELINE_Y - 3}
            width={yearToX(deathYear) - yearToX(birthYear)}
            height={6}
            fill="var(--accent-color)"
            opacity={0.2}
            rx={2}
          />
        )}

        {/* ── Eventi ── */}
        {events.map((ev, i) => {
          const x = yearToX(ev.year);
          const above = i % 2 === 0;
          const cy = TIMELINE_Y;
          const labelY = above ? cy - MARK_RADIUS - 22 : cy + MARK_RADIUS + 22;
          return (
            <g key={`ev-${i}`}
              onMouseEnter={() => setTooltip({ x, y: above ? cy - 40 : cy + 40, text: ev.label })}
              style={{ cursor: 'default' }}
            >
              <line x1={x} y1={cy - MARK_RADIUS - 2} x2={x} y2={above ? labelY + 14 : labelY - 4}
                stroke={eventColor(ev.type)} strokeWidth={0.8} opacity={0.5} />
              <circle cx={x} cy={cy} r={MARK_RADIUS}
                fill={eventColor(ev.type)} opacity={0.85} />
              <text x={x} y={labelY} textAnchor="middle"
                fontSize={9} fill={eventColor(ev.type)}>
                {eventSymbol(ev.type)} {ev.year}
              </text>
            </g>
          );
        })}

        {/* ── Label persona ── */}
        <text x={20} y={20} fontSize={11} fontWeight="bold"
          fill="var(--accent-color)" opacity={0.9}>
          {personName}
        </text>

        {/* ── Tooltip ── */}
        {tooltip && (
          <g>
            <rect x={tooltip.x - 80} y={tooltip.y - 14} width={160} height={20}
              rx={3} fill="rgba(0,0,0,0.8)" stroke="var(--accent-color)" strokeWidth={0.5} />
            <text x={tooltip.x} y={tooltip.y + 1} textAnchor="middle"
              fontSize={9} fill="var(--text-color)">
              {tooltip.text.length > 36 ? tooltip.text.slice(0, 35) + '…' : tooltip.text}
            </text>
          </g>
        )}
      </svg>

      {/* Legenda ere */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '8px',
        marginTop: '6px', fontSize: '0.7rem', color: 'var(--secondary-color)'
      }}>
        {ERAS.filter(e => e.to >= (birthYear ?? minYear) && e.from <= (deathYear ?? maxYear))
          .map(e => (
            <span key={e.id}>{e.symbol} {e.label.replace(/=/g, '')}</span>
          ))}
      </div>
    </div>
  );
};
