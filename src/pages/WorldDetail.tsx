import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import dbData from '../data/db.json';

interface WorldDetailProps {
    defaultPersonId: string;
}

export const WorldDetail: React.FC<WorldDetailProps> = ({ defaultPersonId }) => {
    const { worldId } = useParams<{ worldId: string }>();
    const navigate = useNavigate();
    const [person, setPerson] = useState<any>(null);
    const [worldData, setWorldData] = useState<any>(null);

    useEffect(() => {
        // In a real app we'd get the person ID from state or URL. We use default for now.
        const currentPerson = (dbData.persons as any)[defaultPersonId] || Object.values(dbData.persons)[0];
        setPerson(currentPerson);
        if (worldId && currentPerson.worlds[worldId]) {
            setWorldData(currentPerson.worlds[worldId]);
        }
    }, [worldId, defaultPersonId]);

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
                        {/* Render dynamic data based on world */}

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
