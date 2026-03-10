/**
 * PersonSelector — Selezione persona con filtri tematici
 * GN370 V2.0
 *
 * Filtri: era storica · casata · ricerca testo
 * Display: nome · anni nascita-morte · simbolo era
 */

import React, { useState, useMemo } from 'react';

// ─── Ere storiche ────────────────────────────────────────────────────────────

const ERA_ORDER = [
    'PRE-NORMANNA', '=NORMANNA=', '=ARAGONESE=',
    '=VICEREALE=', '=BORBONICA=', '=UNITARIA=', '=REPUBBLICANA=',
];

const ERA_SYMBOL: Record<string, string> = {
    'PRE-NORMANNA':  '⚔',
    '=NORMANNA=':    '⚜',
    '=ARAGONESE=':   '✦',
    '=VICEREALE=':   '☩',
    '=BORBONICA=':   '✠',
    '=UNITARIA=':    '★',
    '=REPUBBLICANA=':'★',
};

const ERA_COLOR: Record<string, string> = {
    'PRE-NORMANNA':  '#888',
    '=NORMANNA=':    '#C8502A',
    '=ARAGONESE=':   '#9E3070',
    '=VICEREALE=':   '#3A5A9E',
    '=BORBONICA=':   '#9E6530',
    '=UNITARIA=':    '#3A7A3A',
    '=REPUBBLICANA=':'#2050A0',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function personEra(p: any): string {
    return p.worlds?.['5_contesto']?.data?.era ?? '';
}

function extractYear(s?: string): number | null {
    if (!s) return null;
    const m = s.match(/\d{4}/);
    return m ? parseInt(m[0]) : null;
}

// ─── Componente ──────────────────────────────────────────────────────────────

export interface PersonSelectorProps {
    persons: any[];
    selectedId: string;
    onSelect: (id: string) => void;
}

export const PersonSelector: React.FC<PersonSelectorProps> = ({
    persons,
    selectedId,
    onSelect,
}) => {
    const [search, setSearch]         = useState('');
    const [eraFilter, setEraFilter]   = useState('');
    const [casataFilter, setCasata]   = useState('');

    // Ere presenti nel dataset, in ordine storico
    const availableEras = useMemo(() => {
        const set = new Set(persons.map(personEra).filter(Boolean));
        return ERA_ORDER.filter(e => set.has(e));
    }, [persons]);

    // Top 12 casate per numero di persone
    const availableCasate = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const p of persons) {
            if (p.surname) counts[p.surname] = (counts[p.surname] ?? 0) + 1;
        }
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 12)
            .map(([s]) => s);
    }, [persons]);

    // Lista filtrata
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return persons.filter(p => {
            if (eraFilter && personEra(p) !== eraFilter) return false;
            if (casataFilter && p.surname !== casataFilter) return false;
            if (q && !p.name.toLowerCase().includes(q)) return false;
            return true;
        });
    }, [persons, eraFilter, casataFilter, search]);

    // ── Stili ────────────────────────────────────────────────────────────────

    const pill = (active: boolean, color = 'var(--accent-color)') => ({
        display: 'inline-block' as const,
        padding: '2px 7px',
        marginRight: '4px',
        marginBottom: '4px',
        fontSize: '0.7rem',
        cursor: 'pointer',
        border: `1px solid ${active ? color : 'var(--secondary-color)'}`,
        backgroundColor: active ? `${color}22` : 'transparent',
        color: active ? color : 'var(--secondary-color)',
        borderRadius: '2px',
        whiteSpace: 'nowrap' as const,
        userSelect: 'none' as const,
    });

    return (
        <div style={{ marginTop: '15px' }}>

            {/* ── Ricerca testo ── */}
            <input
                type="text"
                placeholder="🔍 cerca nome..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                    width: '100%',
                    maxWidth: '280px',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-color)',
                    border: '1px solid var(--secondary-color)',
                    padding: '4px 8px',
                    fontFamily: 'inherit',
                    fontSize: '0.82rem',
                    marginBottom: '8px',
                    outline: 'none',
                    boxSizing: 'border-box',
                }}
            />

            {/* ── Filtro era storica ── */}
            <div style={{ marginBottom: '5px', display: 'flex', flexWrap: 'wrap' }}>
                <span style={pill(!eraFilter)} onClick={() => setEraFilter('')}>
                    TUTTE LE EPOCHE
                </span>
                {availableEras.map(era => (
                    <span
                        key={era}
                        style={pill(eraFilter === era, ERA_COLOR[era])}
                        onClick={() => setEraFilter(eraFilter === era ? '' : era)}
                    >
                        {ERA_SYMBOL[era]} {era.replace(/=/g, '')}
                    </span>
                ))}
            </div>

            {/* ── Filtro casata ── */}
            <div style={{ marginBottom: '8px', display: 'flex', flexWrap: 'wrap' }}>
                <span style={pill(!casataFilter, 'var(--hint-color)')} onClick={() => setCasata('')}>
                    TUTTE LE CASATE
                </span>
                {availableCasate.map(s => (
                    <span
                        key={s}
                        style={pill(casataFilter === s, 'var(--hint-color)')}
                        onClick={() => setCasata(casataFilter === s ? '' : s)}
                    >
                        {s}
                    </span>
                ))}
            </div>

            {/* ── Contatore risultati ── */}
            <div style={{ fontSize: '0.68rem', color: 'var(--secondary-color)', marginBottom: '4px' }}>
                {filtered.length} / {persons.length} persone
            </div>

            {/* ── Lista scrollabile ── */}
            <div style={{
                maxHeight: '190px',
                overflowY: 'auto',
                border: '1px solid var(--secondary-color)',
                backgroundColor: 'var(--bg-color)',
            }}>
                {filtered.map(p => {
                    const era      = personEra(p);
                    const symbol   = ERA_SYMBOL[era] ?? '';
                    const eraColor = ERA_COLOR[era] ?? 'var(--secondary-color)';
                    const birthY   = extractYear(p.birth);
                    const deathY   = extractYear(p.death);
                    const isActive = p.id === selectedId;
                    return (
                        <div
                            key={p.id}
                            onClick={() => onSelect(p.id)}
                            style={{
                                padding: '5px 10px',
                                cursor: 'pointer',
                                backgroundColor: isActive ? 'rgba(0,200,0,0.10)' : 'transparent',
                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                borderLeft: isActive
                                    ? '3px solid var(--accent-color)'
                                    : `3px solid ${eraColor}44`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                            onMouseEnter={e => {
                                if (!isActive)
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                            }}
                            onMouseLeave={e => {
                                if (!isActive)
                                    e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            {/* Nome */}
                            <span style={{
                                fontSize: '0.82rem',
                                color: isActive ? 'var(--accent-color)' : 'var(--text-color)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                flex: 1,
                            }}>
                                {p.isMaleAncestor ? '★ ' : ''}{p.name}
                            </span>

                            {/* Anni + era */}
                            <span style={{
                                fontSize: '0.72rem',
                                color: eraColor,
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                            }}>
                                {symbol} {birthY ?? '???'}–{deathY ?? '???'}
                            </span>
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div style={{
                        padding: '12px',
                        color: 'var(--secondary-color)',
                        fontSize: '0.82rem',
                        textAlign: 'center',
                    }}>
                        ~GAP~ Nessun risultato
                    </div>
                )}
            </div>
        </div>
    );
};
