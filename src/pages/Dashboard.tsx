import { useState, useEffect } from 'react';
import { WorldTile } from '../components/WorldTile';
import { motion } from 'framer-motion';
import dbData from '../data/db.json';

interface DashboardProps {
    defaultPersonId: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ defaultPersonId }) => {
    const [personId, setPersonId] = useState(defaultPersonId);
    const [person, setPerson] = useState<any>(null);

    // Priorità: prima gli ascendenti maschi (isMaleAncestor = true), poi alfabetico per Cognome e Nome
    const sortedPersons = Object.values(dbData.persons).sort((a: any, b: any) => {
        if (a.isMaleAncestor && !b.isMaleAncestor) return -1;
        if (!a.isMaleAncestor && b.isMaleAncestor) return 1;

        const surnameA = a.surname || '';
        const surnameB = b.surname || '';
        if (surnameA !== surnameB) {
            return surnameA.localeCompare(surnameB);
        }

        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB);
    });

    useEffect(() => {
        // If not found, pick the first one as a fallback
        const target = (dbData.persons as any)[personId] || Object.values(dbData.persons)[0];
        setPerson(target);
    }, [personId]);

    if (!person) return <div>CARICAMENTO DATI...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
        >
            <div style={{ marginBottom: '20px', padding: '10px', border: 'var(--border-style)', backgroundColor: 'var(--tile-bg)' }}>
                <h2 style={{ margin: 0, color: 'var(--accent-color)' }}>{person.name} {person.surname}</h2>
                <p style={{ margin: '5px 0 0', fontSize: '0.9rem' }}>
                    ID: {person.id} | B: {person.birth || '???'} | D: {person.death || '???'}
                </p>

                {/* Simple selector for exploring other people */}
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
                        {sortedPersons.map((p: any) => (
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
                maxWidth: '600px', // Forces it to remain a compact block on desktop
                margin: '0 auto',  // Centers the 3x3 block
                aspectRatio: '1 / 1' // Helps maintain a square proportion for the whole grid
            }}>
                {Object.entries(person.worlds || {}).map(([key, world]: [string, any]) => (
                    <WorldTile key={key} worldKey={key} worldInfo={world} />
                ))}
            </div>
        </motion.div>
    );
};
