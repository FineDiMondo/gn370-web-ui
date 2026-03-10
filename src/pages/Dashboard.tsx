import { useState, useEffect } from 'react';
import { WorldTile } from '../components/WorldTile';
import { motion } from 'framer-motion';
import { buildAndDownloadZip } from '../utils/zipExport';
import { journal } from '../utils/journalManager';
import dbDataMock from '../data/db.json';

interface DashboardProps {
    defaultPersonId: string;
}

function sortPersons(values: any[]): any[] {
    return [...values].sort((a, b) => {
        if (a.isMaleAncestor && !b.isMaleAncestor) return -1;
        if (!a.isMaleAncestor && b.isMaleAncestor) return 1;
        const sA = a.surname || '', sB = b.surname || '';
        if (sA !== sB) return sA.localeCompare(sB);
        return (a.name || '').localeCompare(b.name || '');
    });
}

export const Dashboard: React.FC<DashboardProps> = ({ defaultPersonId }) => {
    const [personsList, setPersonsList] = useState<any[]>([]);
    const [personsDict, setPersonsDict] = useState<Record<string, any>>({});
    const [personId, setPersonId] = useState(defaultPersonId);
    const [person, setPerson] = useState<any>(null);

    // Boot diretto sul dataset Giardina-Negrini
    useEffect(() => {
        const parsed = dbDataMock.persons as Record<string, any>;
        const sorted = sortPersons(Object.values(parsed));

        setPersonsDict(parsed);
        setPersonsList(sorted);

        const hasDefault = !!parsed[defaultPersonId];
        setPersonId(hasDefault ? defaultPersonId : sorted[0]?.id);

        if (typeof window !== 'undefined') {
            window.__GN370_DB_STATUS = 'READY';
            if (!window.GN370) window.GN370 = { CTX: { openedRecord: null } };
        }

        journal.append('SESSION_START', 'GN370 — Giardina-Negrini dataset caricato',
            { entity_type: 'PERSON', entity_count: sorted.length }
        );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (Object.keys(personsDict).length > 0) {
            const target = personsDict[personId] || personsList[0];
            setPerson(target);
            if (target?.id && typeof window !== 'undefined' && window.GN370) {
                window.GN370.CTX.openedRecord = target.id;
            }
        }
    }, [personId, personsDict, personsList]);

    const handleExport = async () => {
        try {
            await buildAndDownloadZip({
                persons: personsDict,
                families: (dbDataMock as any).families ?? {},
            });
        } catch (err) {
            console.error('GN370 EXPORT ERROR:', err);
            alert('Errore durante la generazione del file ZIP.');
        }
    };

    if (!person) return <div style={{ color: 'var(--text-color)' }}>CARICAMENTO DATI...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
        >
            <div style={{ marginBottom: '20px', padding: '10px', border: 'var(--border-style)', backgroundColor: 'var(--tile-bg)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <button
                        onClick={handleExport}
                        style={{
                            backgroundColor: 'transparent',
                            border: '1px solid var(--accent-color)',
                            color: 'var(--accent-color)',
                            padding: '5px 10px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                        }}
                    >
                        [ EXPORT ZIP ]
                    </button>
                </div>

                <h2 style={{ margin: 0, color: 'var(--accent-color)' }}>{person.name} {person.surname}</h2>
                <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: 'var(--text-color)' }}>
                    ID: {person.id} | B: {person.birth || '???'} | D: {person.death || '???'}
                </p>

                <div style={{ marginTop: '15px' }}>
                    <select
                        value={personId}
                        onChange={(e) => setPersonId(e.target.value)}
                        style={{
                            backgroundColor: 'var(--bg-color)',
                            color: 'var(--text-color)',
                            border: '1px solid var(--secondary-color)',
                            padding: '5px',
                            fontFamily: 'inherit',
                            width: '100%',
                            maxWidth: '300px'
                        }}
                    >
                        {personsList.map((p: any) => (
                            <option key={p.id} value={p.id}>
                                {p.isMaleAncestor ? '★ ' : ''}{p.surname} {p.name} ({p.id})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '15px',
                width: '100%',
                maxWidth: '600px',
                margin: '0 auto',
                aspectRatio: '1 / 1'
            }}>
                {Object.entries(person.worlds || {}).map(([key, world]: [string, any]) => (
                    <WorldTile key={key} worldKey={key} worldInfo={world} personId={person.id} />
                ))}
            </div>
        </motion.div>
    );
};
