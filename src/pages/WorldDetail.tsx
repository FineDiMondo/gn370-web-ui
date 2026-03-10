import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import dbData from '../data/db.json';
import DOMPurify from 'dompurify';
import { GenealogyTree } from '../components/GenealogyTree';
import { PersonTimeline } from '../components/PersonTimeline';

// ─── Helper: era storica da anno ─────────────────────────────────────────────
function eraFromYear(year: number): { label: string; symbol: string; color: string } {
    if (year < 1072) return { label: 'PRE-NORMANNA', symbol: '⚔', color: 'var(--secondary-color)' };
    if (year < 1266) return { label: '=NORMANNA=', symbol: '⚜', color: '#C8502A' };
    if (year < 1516) return { label: '=ARAGONESE=', symbol: '✦', color: '#9E3070' };
    if (year < 1816) return { label: '=VICEREALE=', symbol: '☩', color: '#3A5A9E' };
    if (year < 1861) return { label: '=BORBONICA=', symbol: '✠', color: '#9E6530' };
    if (year < 1948) return { label: '=UNITARIA=', symbol: '★', color: '#3A7A3A' };
    return { label: '=REPUBBLICANA=', symbol: '★', color: '#2050A0' };
}

function birthYearOf(p: any): number | null {
    if (!p?.birth) return null;
    const m = p.birth.match(/\d{4}/);
    return m ? parseInt(m[0]) : null;
}

// ─── Helper: struttura familiare ──────────────────────────────────────────────
function getFamily(personId: string) {
    const persons = (dbData as any).persons as Record<string, any>;
    const families = (dbData as any).families as Record<string, any>;
    const person = persons[personId];
    let father: any = null;
    let mother: any = null;
    const spouses: any[] = [];
    const children: any[] = [];

    if (person?.famc && families[person.famc]) {
        const fam = families[person.famc];
        if (fam.husb) father = persons[fam.husb] ?? null;
        if (fam.wife) mother = persons[fam.wife] ?? null;
    }

    for (const fam of Object.values(families)) {
        const f = fam as any;
        if (f.husb === personId || f.wife === personId) {
            const spouseId = f.husb === personId ? f.wife : f.husb;
            if (spouseId && persons[spouseId]) {
                spouses.push({ ...persons[spouseId], marr: f.marr ?? null });
            }
            for (const childId of (f.chil ?? [])) {
                if (persons[childId]) children.push(persons[childId]);
            }
        }
    }

    return { father, mother, spouses, children };
}

// ─── Stili condivisi ──────────────────────────────────────────────────────────
const sectionHeader = (color: string) => ({
    color,
    marginBottom: '10px',
    borderBottom: `1px dashed ${color}`,
    paddingBottom: '6px',
} as React.CSSProperties);

const pill = (color: string) => ({
    display: 'inline-block',
    border: `1px solid ${color}`,
    borderRadius: '2px',
    padding: '2px 10px',
    marginRight: '8px',
    marginBottom: '6px',
    fontSize: '0.85rem',
    color,
} as React.CSSProperties);

// ─── Sub-componenti dedicati per Mondo ───────────────────────────────────────

// Mondo 3 — DONI
function MondoDoni({ data }: { data: any }) {
    return (
        <div>
            {data?.titles && data.titles.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={sectionHeader('var(--accent-color)')}>⚜ Titoli e Onori</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {data.titles.map((t: string, i: number) => (
                            <li key={i} style={{
                                padding: '8px 12px',
                                marginBottom: '6px',
                                borderLeft: '3px solid var(--accent-color)',
                                backgroundColor: 'rgba(255,255,255,0.03)',
                            }}>
                                {t}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {data?.assets && data.assets.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={sectionHeader('var(--secondary-color)')}>💎 Beni e Privilegi</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {data.assets.map((a: string, i: number) => (
                            <li key={i} style={{
                                padding: '6px 10px',
                                marginBottom: '4px',
                                borderLeft: '2px solid var(--secondary-color)',
                                fontSize: '0.9rem',
                            }}>
                                {a}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {data?.notes && (
                <p style={{ color: 'var(--secondary-color)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                    {data.notes}
                </p>
            )}
            {(!data || (!data.titles && !data.assets)) && (
                <p style={{ color: 'var(--secondary-color)', marginTop: '10px' }}>
                    [ NESSUN DATO DOCUMENTATO PER TITOLI O BENI ]
                </p>
            )}
        </div>
    );
}

// Mondo 4 — OMBRE
function MondoOmbre({ person, data }: { person: any; data: any }) {
    const yr = birthYearOf(person);
    const era = yr ? eraFromYear(yr) : null;
    return (
        <div>
            {era && (
                <div style={{
                    display: 'inline-block',
                    border: `1px solid ${era.color}`,
                    padding: '4px 14px',
                    marginBottom: '20px',
                    color: era.color,
                    fontSize: '0.9rem',
                }}>
                    {era.symbol} ERA: {era.label}
                </div>
            )}
            {data?.anomalies && data.anomalies.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                    <h3 style={sectionHeader('var(--alert-color)')}>☠ Anomalie / Ombre</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {data.anomalies.map((a: string, i: number) => (
                            <li key={i} style={{
                                padding: '10px',
                                marginBottom: '8px',
                                border: '1px solid var(--alert-color)',
                                borderLeft: '4px solid var(--alert-color)',
                                backgroundColor: 'rgba(200,0,0,0.05)',
                            }}>
                                {a}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {data?.gaps && data.gaps.length > 0 && (
                <div>
                    <h3 style={sectionHeader('var(--alert-color)')}>⚠ Lacune / Zone d'ombra</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {data.gaps.map((g: any, i: number) => (
                            <li key={i} style={{
                                padding: '8px 12px',
                                marginBottom: '6px',
                                borderLeft: `3px solid ${g.priority === 'ALTA' ? 'var(--alert-color)' : 'var(--secondary-color)'}`,
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                fontSize: '0.9rem',
                            }}>
                                <strong>[{g.priority}] {g.type}:</strong> {g.description}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {(!data || (!data.anomalies && !data.gaps)) && (
                <p style={{ color: 'var(--secondary-color)' }}>
                    [ NESSUNA ANOMALIA RILEVATA — REGISTRI COERENTI ]
                </p>
            )}
        </div>
    );
}

// Mondo 5 — CONTESTO
const ERA_CONTEXT: Record<string, string[]> = {
    'PRE-NORMANNA': [
        'Sicilia sotto il dominio arabo (827–1061)',
        'Conquista normanna avviata da Roberto il Guiscardo',
        'Frammentazione feudale del Mezzogiorno',
    ],
    '=NORMANNA=': [
        '1072 — Ruggero I conquista Palermo',
        '1130 — Ruggero II re di Sicilia',
        '1194 — Fine della monarchia normanna, inizio sveva',
        'Cultura arabo-normanna: mosaici, Cappella Palatina',
    ],
    '=ARAGONESE=': [
        '1282 — Vespri Siciliani: cacciata degli Angiò',
        '1302 — Pace di Caltabellotta, autonomia siciliana',
        '1415 — Unione con la Corona d\'Aragona',
        'Affermazione dell\'aristocrazia feudale siciliana',
    ],
    '=VICEREALE=': [
        '1516 — Carlo V: Sicilia parte dell\'impero asburgico',
        '1647 — Rivolta di Palermo contro il dominio spagnolo',
        '1693 — Terremoto di Val di Noto',
        '1713 — Trattato di Utrecht: Sicilia ai Savoia poi agli Asburgo',
        '1734 — Carlo di Borbone, regno indipendente',
    ],
    '=BORBONICA=': [
        '1816 — Fusione nel Regno delle Due Sicilie',
        '1820 — Rivolta costituzionalista in Sicilia',
        '1837 — Epidemia di colera',
        '1848 — Rivoluzione siciliana (15 mesi di indipendenza)',
    ],
    '=UNITARIA=': [
        '1860 — Spedizione dei Mille: Garibaldi sbarca a Marsala',
        '1861 — Unità d\'Italia, fine del Regno delle Due Sicilie',
        '1866 — Rivolta di Palermo (sette e mezzo)',
        '1908 — Emigrazione massiccia verso le Americhe',
    ],
    '=REPUBBLICANA=': [
        '1946 — Nascita della Repubblica Italiana',
        '1948 — Statuto speciale per la Regione Siciliana',
        '1950-70 — Boom economico e migrazioni interne',
    ],
};

function MondoContesto({ person, data }: { person: any; data: any }) {
    const yr = birthYearOf(person);
    const era = yr ? eraFromYear(yr) : null;
    const contextLines = data?.context ?? (era ? (ERA_CONTEXT[era.label] ?? []) : []);

    return (
        <div>
            {era && (
                <div style={{
                    padding: '12px 16px',
                    border: `1px solid ${era.color}`,
                    marginBottom: '20px',
                    backgroundColor: `${era.color}15`,
                }}>
                    <span style={{ fontSize: '1.5rem', marginRight: '12px' }}>{era.symbol}</span>
                    <strong style={{ color: era.color, fontSize: '1.1rem' }}>{era.label}</strong>
                    {yr && (
                        <span style={{ marginLeft: '15px', color: 'var(--secondary-color)', fontSize: '0.85rem' }}>
                            Anno nascita: {yr}
                        </span>
                    )}
                </div>
            )}
            {contextLines.length > 0 && (
                <div>
                    <h3 style={sectionHeader('var(--hint-color)')}>📜 Contesto Storico</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {contextLines.map((line: string, i: number) => (
                            <li key={i} style={{
                                padding: '7px 10px',
                                marginBottom: '5px',
                                borderLeft: era ? `2px solid ${era.color}` : '2px solid var(--hint-color)',
                                fontSize: '0.9rem',
                            }}>
                                {line}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {data?.events && data.events.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                    <h3 style={sectionHeader('var(--text-color)')}>📅 Eventi del Periodo</h3>
                    <ul>
                        {data.events.map((e: string, i: number) => <li key={i}>{e}</li>)}
                    </ul>
                </div>
            )}
        </div>
    );
}

// Mondo 6 — STRUTTURA
function PersonCard({ p, label }: { p: any; label: string }) {
    const navigate = useNavigate();
    const yr = birthYearOf(p);
    return (
        <div
            onClick={() => navigate(`/world/${p.id}/1_origini`)}
            style={{
                border: '1px solid var(--secondary-color)',
                padding: '8px 12px',
                marginBottom: '6px',
                cursor: 'pointer',
                backgroundColor: 'var(--tile-bg)',
                transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-color)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--secondary-color)')}
        >
            <span style={{ color: 'var(--hint-color)', fontSize: '0.75rem', marginRight: '8px' }}>{label}</span>
            <strong style={{ color: 'var(--text-color)' }}>{p.name} {p.surname}</strong>
            {yr && <span style={{ color: 'var(--secondary-color)', marginLeft: '8px', fontSize: '0.8rem' }}>({yr}–{p.death ? p.death.match(/\d{4}/)?.[0] ?? '?' : '?'})</span>}
        </div>
    );
}

function MondoStruttura({ personId }: { personId: string }) {
    const { father, mother, spouses, children } = getFamily(personId);
    const hasData = father || mother || spouses.length > 0 || children.length > 0;

    return (
        <div>
            <h3 style={sectionHeader('var(--accent-color)')}>👨‍👩‍👧‍👦 Struttura Familiare</h3>
            {!hasData && (
                <p style={{ color: 'var(--secondary-color)' }}>[ NESSUN LEGAME FAMILIARE DOCUMENTATO ]</p>
            )}
            {(father || mother) && (
                <div style={{ marginBottom: '18px' }}>
                    <div style={{ ...pill('var(--hint-color)') }}>GENITORI</div>
                    {father && <PersonCard p={father} label="PADRE" />}
                    {mother && <PersonCard p={mother} label="MADRE" />}
                </div>
            )}
            {spouses.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                    <div style={{ ...pill('var(--accent-color)') }}>
                        {spouses.length > 1 ? 'CONIUGI' : 'CONIUGE'}
                    </div>
                    {spouses.map((s, i) => (
                        <div key={i}>
                            <PersonCard p={s} label={spouses.length > 1 ? `CONIUGE ${i + 1}` : 'CONIUGE'} />
                            {s.marr && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--hint-color)', paddingLeft: '12px', marginTop: '-4px', marginBottom: '6px' }}>
                                    ♥ Matrimonio: {s.marr}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {children.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                    <div style={{ ...pill('var(--secondary-color)') }}>
                        FIGLI ({children.length})
                    </div>
                    {children.map((c, i) => <PersonCard key={i} p={c} label={`FIGLIO/A`} />)}
                </div>
            )}
        </div>
    );
}

// Mondo 7 — EREDITÀ
function MondoEredita({ data }: { data: any }) {
    return (
        <div>
            {data?.assets && data.assets.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={sectionHeader('var(--secondary-color)')}>📜 Patrimonio Ereditario</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {data.assets.map((a: string, i: number) => (
                            <li key={i} style={{
                                padding: '7px 12px',
                                marginBottom: '6px',
                                borderLeft: '3px solid var(--secondary-color)',
                                fontSize: '0.9rem',
                            }}>
                                {a}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {data?.titles && data.titles.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={sectionHeader('var(--accent-color)')}>⚜ Titoli Trasmessi</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {data.titles.map((t: string, i: number) => (
                            <li key={i} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--accent-color)', marginRight: '8px' }}>⚜</span>{t}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {data?.notes && (
                <p style={{ color: 'var(--secondary-color)', fontStyle: 'italic', fontSize: '0.85rem', marginTop: '10px' }}>
                    {data.notes}
                </p>
            )}
            {(!data || (!data.assets && !data.titles && !data.heraldry)) && (
                <p style={{ color: 'var(--secondary-color)' }}>[ PATRIMONIO NON DOCUMENTATO ]</p>
            )}
        </div>
    );
}

// Mondo 8 — NEBBIA
function MondoNebbia({ data }: { data: any }) {
    return (
        <div>
            <div style={{
                padding: '8px 14px',
                border: '1px dashed var(--hint-color)',
                marginBottom: '20px',
                color: 'var(--hint-color)',
                fontSize: '0.85rem',
            }}>
                🔍 STATO RICERCA — Lacune rilevate e suggerimenti motore AI
            </div>
            {data?.hints && data.hints.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={sectionHeader('var(--hint-color)')}>💡 Suggerimenti (?HINT?)</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {data.hints.map((h: string, i: number) => (
                            <li key={i} style={{
                                padding: '8px 12px',
                                marginBottom: '6px',
                                backgroundColor: 'rgba(255,200,0,0.05)',
                                borderLeft: '3px solid var(--hint-color)',
                                fontSize: '0.9rem',
                            }}>
                                {h}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {data?.gaps && data.gaps.length > 0 && (
                <div>
                    <h3 style={sectionHeader('var(--alert-color)')}>⚠ Lacune (~GAP~)</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {data.gaps.map((g: any, i: number) => (
                            <li key={i} style={{
                                padding: '10px 12px',
                                marginBottom: '8px',
                                borderLeft: `4px solid ${g.priority === 'ALTA' ? 'var(--alert-color)' : 'var(--secondary-color)'}`,
                                backgroundColor: 'rgba(0,0,0,0.12)',
                                fontSize: '0.9rem',
                            }}>
                                <div style={{ marginBottom: '3px' }}>
                                    <span style={{
                                        backgroundColor: g.priority === 'ALTA' ? 'var(--alert-color)' : 'var(--secondary-color)',
                                        color: 'var(--bg-color)',
                                        padding: '1px 6px',
                                        fontSize: '0.75rem',
                                        marginRight: '8px',
                                    }}>
                                        {g.priority}
                                    </span>
                                    <strong>{g.type}</strong>
                                </div>
                                {g.description}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {(!data || (!data.hints && !data.gaps)) && (
                <p style={{ color: 'var(--secondary-color)' }}>[ NESSUNA LACUNA REGISTRATA ]</p>
            )}
        </div>
    );
}

// ─── Componente principale ────────────────────────────────────────────────────
export const WorldDetail: React.FC = () => {
    const { personId, worldId } = useParams<{ personId: string; worldId: string }>();
    const navigate = useNavigate();
    const [person, setPerson] = useState<any>(null);
    const [worldData, setWorldData] = useState<any>(null);

    useEffect(() => {
        const currentPerson =
            (dbData.persons as any)[personId || ''] ||
            Object.values(dbData.persons)[0];
        setPerson(currentPerson);
        if (worldId && currentPerson?.worlds?.[worldId]) {
            setWorldData(currentPerson.worlds[worldId]);
        }
    }, [worldId, personId]);

    if (!person || !worldData) {
        return <div style={{ color: 'var(--alert-color)' }}>DATI MONDO NON TROVATI.</div>;
    }

    // Mondo 6 è sempre visibile (deriva da families)
    const isAlwaysVisible = worldId === '6_struttura';

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '10px' }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        backgroundColor: 'transparent',
                        border: '1px solid var(--secondary-color)',
                        color: 'var(--text-color)',
                        padding: '5px 15px',
                        fontSize: '1rem',
                    }}
                >
                    {'< ESC'}
                </button>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ color: worldData.color_var, fontSize: '1.2rem', fontWeight: 'bold' }}>
                        MONDO {worldData.id}: {worldData.name}
                    </span>
                    <div style={{ color: 'var(--secondary-color)', fontSize: '0.8rem' }}>
                        {person.name} {person.surname}
                    </div>
                </div>
            </div>

            {/* Corpo */}
            <div style={{
                border: `1px solid ${worldData.color_var}`,
                padding: '20px',
                backgroundColor: 'var(--bg-color)',
                minHeight: '300px',
            }}>
                <h2 style={{ borderBottom: `1px dashed ${worldData.color_var}`, paddingBottom: '10px', color: 'var(--text-color)', marginTop: 0 }}>
                    {person.name} {person.surname}
                    <span style={{ color: 'var(--secondary-color)', fontSize: '0.8rem', marginLeft: '12px' }}>
                        {person.birth || '???'} – {person.death || '???'}
                    </span>
                </h2>

                {/* Mondo 6 STRUTTURA sempre visibile */}
                {worldId === '6_struttura' && personId && (
                    <MondoStruttura personId={personId} />
                )}

                {/* Mondi inattivi (eccetto 6) */}
                {!worldData.is_active && !isAlwaysVisible && (
                    <p style={{ color: 'var(--alert-color)', marginTop: '20px' }}>
                        [ NESSUN DATO PRESENTE IN QUESTO DOMINIO ]
                    </p>
                )}

                {/* Mondi attivi */}
                {worldData.is_active && (
                    <div style={{ marginTop: '20px', color: 'var(--text-color)' }}>

                        {/* ── MONDO 1 / MONDO 9: Albero genealogico ── */}
                        {(worldId === '1_origini' || worldId === '9_radici') && (
                            <div style={{ marginBottom: '25px' }}>
                                <h3 style={{ color: 'var(--accent-color)', marginBottom: '10px' }}>
                                    🌳 {worldId === '9_radici' ? '|PATH| Radici Genetiche e Documentali' : '|PATH| Albero Genealogico'}
                                </h3>
                                <GenealogyTree
                                    persons={(dbData as any).persons ?? {}}
                                    families={(dbData as any).families ?? {}}
                                    focusPersonId={personId ?? person.id}
                                    mode="ancestors"
                                    maxGenerations={worldId === '9_radici' ? 5 : 4}
                                />
                            </div>
                        )}

                        {/* ── MONDO 2: Timeline ── */}
                        {worldId === '2_cicli' && (
                            <div style={{ marginBottom: '25px' }}>
                                <h3 style={{ color: 'var(--text-color)', marginBottom: '10px' }}>
                                    ⏱ Cronologia / Timeline
                                </h3>
                                <PersonTimeline
                                    personName={`${person.name ?? ''} ${person.surname ?? ''}`.trim()}
                                    birthYear={birthYearOf(person)}
                                    deathYear={person.death ? parseInt(person.death.match(/\d{4}/)?.[0] ?? '0') || null : null}
                                    rawEvents={worldData.data?.events ?? []}
                                    rawGaps={worldData.data?.gaps ?? []}
                                />
                            </div>
                        )}

                        {/* ── MONDO 3: DONI ── */}
                        {worldId === '3_doni' && (
                            <MondoDoni data={worldData.data} />
                        )}

                        {/* ── MONDO 4: OMBRE ── */}
                        {worldId === '4_ombre' && (
                            <MondoOmbre person={person} data={worldData.data} />
                        )}

                        {/* ── MONDO 5: CONTESTO ── */}
                        {worldId === '5_contesto' && (
                            <MondoContesto person={person} data={worldData.data} />
                        )}

                        {/* ── MONDO 6: STRUTTURA (già renderizzato sopra, sempre) ── */}

                        {/* ── MONDO 7: EREDITÀ ── */}
                        {worldId === '7_eredita' && (
                            <MondoEredita data={worldData.data} />
                        )}

                        {/* ── MONDO 8: NEBBIA ── */}
                        {worldId === '8_nebbia' && (
                            <MondoNebbia data={worldData.data} />
                        )}

                        {/* ── Sezioni generiche condivise ── */}

                        {/* Documenti archivio (tutti i mondi) */}
                        {worldData.data?.documents && worldData.data.documents.length > 0 && (
                            <div style={{ marginBottom: '15px', marginTop: '10px' }}>
                                <h3 style={sectionHeader('var(--hint-color)')}>📁 Documenti Archivio</h3>
                                <ul style={{ listStyleType: 'square', paddingLeft: '20px' }}>
                                    {worldData.data.documents.map((docPath: string, idx: number) => (
                                        <li key={idx} style={{ margin: '5px 0' }}>
                                            <a
                                                href={docPath}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}
                                            >
                                                [ LEGGI ] {docPath.split('/').pop()}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Stemmi araldici (mondi 1 e 7 principalmente) */}
                        {worldData.data?.heraldry && worldData.data.heraldry.length > 0 && (
                            <div style={{ marginBottom: '20px', marginTop: '10px' }}>
                                <style>{`.svg-container svg { width:100%!important; height:100%!important; max-width:100%; object-fit:contain; }`}</style>
                                <h3 style={sectionHeader('var(--accent-color)')}>
                                    🛡️ Stemmi Araldici (SVG)
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '15px' }}>
                                    {worldData.data.heraldry.map((svgStr: string, i: number) => {
                                        const cleanSVG = DOMPurify.sanitize(svgStr, {
                                            USE_PROFILES: { svg: true },
                                            FORBID_ATTR: ['onclick', 'onmouseover', 'onload', 'onerror', 'onfocus', 'onblur'],
                                        });
                                        return (
                                            <div
                                                key={i}
                                                className="svg-container"
                                                style={{
                                                    border: '1px dashed var(--secondary-color)',
                                                    padding: '10px',
                                                    width: '200px',
                                                    height: '200px',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                                    overflow: 'hidden',
                                                }}
                                                dangerouslySetInnerHTML={{ __html: cleanSVG }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Anomalie generiche (solo se NON Mondo 4, che ha renderer dedicato) */}
                        {worldId !== '4_ombre' && worldData.data?.anomalies && worldData.data.anomalies.length > 0 && (
                            <div style={{ marginBottom: '15px', marginTop: '10px' }}>
                                <h3 style={sectionHeader('var(--alert-color)')}>⚠ Anomalie</h3>
                                <ul>
                                    {worldData.data.anomalies.map((a: string, i: number) => <li key={i}>{a}</li>)}
                                </ul>
                            </div>
                        )}

                        {/* Hints generici (solo se NON Mondo 8, che ha renderer dedicato) */}
                        {worldId !== '8_nebbia' && worldData.data?.hints && worldData.data.hints.length > 0 && (
                            <div style={{ marginBottom: '15px', marginTop: '10px' }}>
                                <h3 style={{ color: 'var(--hint-color)' }}>💡 Suggerimenti</h3>
                                <ul>
                                    {worldData.data.hints.map((h: string, i: number) => <li key={i}>{h}</li>)}
                                </ul>
                            </div>
                        )}

                        {/* Gap generici (solo se NON Mondo 4 e NON Mondo 8) */}
                        {!['4_ombre', '8_nebbia'].includes(worldId ?? '') && worldData.data?.gaps && worldData.data.gaps.length > 0 && (
                            <div style={{ marginBottom: '15px', marginTop: '10px' }}>
                                <h3 style={sectionHeader('var(--alert-color)')}>⚠ Lacune (~GAP~)</h3>
                                <ul>
                                    {worldData.data.gaps.map((g: any, i: number) => (
                                        <li key={i} style={{
                                            marginBottom: '10px',
                                            padding: '10px',
                                            borderLeft: `4px solid ${g.priority === 'ALTA' ? 'var(--alert-color)' : 'var(--secondary-color)'}`,
                                            backgroundColor: 'rgba(0,0,0,0.1)',
                                        }}>
                                            <strong>[{g.priority}] {g.type}:</strong> {g.description}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Fallback JSON raw per dati non riconosciuti */}
                        {worldId !== '3_doni' &&
                            worldId !== '4_ombre' &&
                            worldId !== '5_contesto' &&
                            worldId !== '6_struttura' &&
                            worldId !== '7_eredita' &&
                            worldId !== '8_nebbia' &&
                            !worldData.data?.events &&
                            !worldData.data?.documents &&
                            !worldData.data?.anomalies &&
                            !worldData.data?.hints &&
                            !worldData.data?.heraldry &&
                            worldData.data &&
                            Object.keys(worldData.data).length > 0 && (
                                <pre style={{
                                    backgroundColor: 'rgba(0,0,0,0.2)',
                                    padding: '10px',
                                    overflowX: 'auto',
                                    border: '1px solid var(--secondary-color)',
                                }}>
                                    {JSON.stringify(worldData.data, null, 2)}
                                </pre>
                            )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};
