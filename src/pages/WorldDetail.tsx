import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import dbData from '../data/db.json';
import DOMPurify from 'dompurify';
import { GenealogyTree } from '../components/GenealogyTree';
import { PersonTimeline } from '../components/PersonTimeline';

export const WorldDetail: React.FC = () => {
    const { personId, worldId } = useParams<{ personId: string, worldId: string }>();
    const navigate = useNavigate();
    const [person, setPerson] = useState<any>(null);
    const [worldData, setWorldData] = useState<any>(null);

    useEffect(() => {
        const currentPerson = (dbData.persons as any)[personId || ''] || Object.values(dbData.persons)[0];
        setPerson(currentPerson);
        if (worldId && currentPerson.worlds[worldId]) {
            setWorldData(currentPerson.worlds[worldId]);
        }
    }, [worldId, personId]);

    if (!person || !worldData) return <div style={{ color: 'var(--alert-color)' }}>DATI MONDO NON TROVATI.</div>;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '10px' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        backgroundColor: 'transparent',
                        border: '1px solid var(--secondary-color)',
                        color: 'var(--text-color)',
                        padding: '5px 15px',
                        fontSize: '1rem'
                    }}
                >
                    {'< ESC'}
                </button>
                <span style={{ color: worldData.color_var, fontSize: '1.2rem', fontWeight: 'bold' }}>
                    MONDO {worldData.id}: {worldData.name}
                </span>
            </div>

            <div style={{
                border: `1px solid ${worldData.color_var}`,
                padding: '20px',
                backgroundColor: 'var(--bg-color)',
                minHeight: '300px'
            }}>
                <h2 style={{ borderBottom: `1px dashed ${worldData.color_var}`, paddingBottom: '10px', color: 'var(--text-color)' }}>
                    Dettagli per {person.name} {person.surname}
                </h2>

                {!worldData.is_active ? (
                    <p style={{ color: 'var(--alert-color)', marginTop: '20px' }}>
                        [ NESSUN DATO PRESENTE IN QUESTO DOMINIO ]
                    </p>
                ) : (
                    <div style={{ marginTop: '20px', color: 'var(--text-color)' }}>

                        {/* ── MONDO 1: ORIGINI / MONDO 9: RADICI → Albero genealogico ── */}
                        {(worldId === '1_origini' || worldId === '9_radici') && (
                            <div style={{ marginBottom: '25px' }}>
                                <h3 style={{ color: 'var(--accent-color)', marginBottom: '10px' }}>
                                    {worldId === '9_radici' ? '🌳 |PATH| Radici Genetiche e Documentali' : '🌳 |PATH| Albero Genealogico'}
                                </h3>
                                <GenealogyTree
                                    persons={(dbData as any).persons ?? {}}
                                    families={(dbData as any).families ?? {}}
                                    focusPersonId={personId ?? person.id}
                                    mode={worldId === '9_radici' ? 'ancestors' : 'ancestors'}
                                    maxGenerations={worldId === '9_radici' ? 5 : 4}
                                />
                            </div>
                        )}

                        {/* ── MONDO 2: CICLI → Timeline con =ERA= ── */}
                        {worldId === '2_cicli' && (
                            <div style={{ marginBottom: '25px' }}>
                                <h3 style={{ color: 'var(--text-color)', marginBottom: '10px' }}>
                                    ⏱ Cronologia / Timeline
                                </h3>
                                <PersonTimeline
                                    personName={`${person.name ?? ''} ${person.surname ?? ''}`.trim()}
                                    birthYear={person.birth ? parseInt(person.birth.match(/\d{4}/)?.[0] ?? '0') || null : null}
                                    deathYear={person.death ? parseInt(person.death.match(/\d{4}/)?.[0] ?? '0') || null : null}
                                    rawEvents={worldData.data?.events ?? []}
                                    rawGaps={worldData.data?.gaps ?? []}
                                />
                            </div>
                        )}

                        {worldData.data?.events && (
                            <div style={{ marginBottom: '15px' }}>
                                <h3 style={{ color: 'var(--secondary-color)' }}>Cronologia / Eventi:</h3>
                                <ul>
                                    {worldData.data.events.map((e: string, i: number) => <li key={i}>{e}</li>)}
                                </ul>
                            </div>
                        )}

                        {worldData.data?.documents && worldData.data.documents.length > 0 && (
                            <div style={{ marginBottom: '15px' }}>
                                <h3 style={{ color: 'var(--hint-color)' }}>Documenti Archivio:</h3>
                                <ul style={{ listStyleType: 'square', paddingLeft: '20px' }}>
                                    {worldData.data.documents.map((docPath: string, idx: number) => {
                                        const fileName = docPath.split('/').pop();
                                        return (
                                            <li key={idx} style={{ margin: '5px 0' }}>
                                                <a
                                                    href={docPath}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}
                                                >
                                                    [ LEGGI ] {fileName}
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        {worldData.data?.anomalies && (
                            <div style={{ marginBottom: '15px' }}>
                                <h3 style={{ color: 'var(--alert-color)' }}>Anomalie / Ombre:</h3>
                                <ul>
                                    {worldData.data.anomalies.map((a: string, i: number) => <li key={i}>{a}</li>)}
                                </ul>
                            </div>
                        )}

                        {worldData.data?.gaps && (
                            <div style={{ marginBottom: '15px' }}>
                                <h3 style={{ color: 'var(--alert-color)', textTransform: 'uppercase' }}>
                                    <span style={{ marginRight: '10px' }}>⚠️</span>
                                    Lacune Rilevate (~GAP~)
                                </h3>
                                <ul>
                                    {worldData.data.gaps.map((g: any, i: number) => (
                                        <li key={i} style={{
                                            marginBottom: '10px',
                                            padding: '10px',
                                            borderLeft: `4px solid ${g.priority === 'ALTA' ? 'var(--alert-color)' : 'var(--secondary-color)'}`,
                                            backgroundColor: 'rgba(0,0,0,0.1)'
                                        }}>
                                            <strong>[{g.priority}] {g.type}:</strong> {g.description}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {worldData.data?.hints && (
                            <div style={{ marginBottom: '15px' }}>
                                <h3 style={{ color: 'var(--hint-color)' }}>
                                    <span style={{ marginRight: '10px' }}>💡</span>
                                    Suggerimenti Motore AI (?HINT?)
                                </h3>
                                <ul>
                                    {worldData.data.hints.map((h: string, i: number) => (
                                        <li key={i} style={{ marginBottom: '5px' }}>{h}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {worldData.data?.heraldry && (
                            <div style={{ marginBottom: '20px' }}>
                                <style>
                                    {`
                                    .svg-container svg {
                                        width: 100% !important;
                                        height: 100% !important;
                                        max-width: 100%;
                                        max-height: 100%;
                                        object-fit: contain;
                                    }
                                    `}
                                </style>
                                <h3 style={{ color: 'var(--accent-color)', borderBottom: '1px solid var(--accent-color)', paddingBottom: '5px' }}>
                                    <span style={{ marginRight: '10px' }}>🛡️</span>
                                    Stemmi Araldici (SVG Vector)
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '15px' }}>
                                    {worldData.data.heraldry.map((svgStr: string, i: number) => {
                                        // NVH-03: DOMPurify stringente per rimuovere possibili XSS dagli SVG
                                        const cleanSVG = DOMPurify.sanitize(svgStr, {
                                            USE_PROFILES: { svg: true },
                                            FORBID_ATTR: ['onclick', 'onmouseover', 'onload', 'onerror', 'onfocus', 'onblur']
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
                                                    overflow: 'hidden'
                                                }}
                                                dangerouslySetInnerHTML={{ __html: cleanSVG }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Mostra dati raw in caso sfuggisse alle label sopra */}
                        {!worldData.data?.events && !worldData.data?.documents && !worldData.data?.anomalies && !worldData.data?.hints && (
                            <pre style={{
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                padding: '10px',
                                overflowX: 'auto',
                                border: '1px solid var(--secondary-color)'
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
