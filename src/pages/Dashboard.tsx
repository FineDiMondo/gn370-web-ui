import { useState, useEffect, useRef } from 'react';
import { WorldTile } from '../components/WorldTile';
import { motion } from 'framer-motion';
import { parseGedcomFull, toPersonDataDict } from '../utils/gedcomParser';
import { buildAndDownloadZip } from '../utils/zipExport';
import { journal } from '../utils/journalManager';
import dbDataMock from '../data/db.json';

// Conserva il GEDCOM originale per VH-08 / I17
let _originalGedcomText: string | null = null;
let _originalGedcomFilename = 'dataset.ged';
let _parsedFamilies: Record<string, any> = {};

interface DashboardProps {
    defaultPersonId: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ defaultPersonId }) => {
    const [dbStatus, setDbStatus] = useState<'EMPTY' | 'READY'>(
        typeof window !== 'undefined' && window.__GN370_DB_STATUS ? window.__GN370_DB_STATUS : 'EMPTY'
    );
    const [personsList, setPersonsList] = useState<any[]>([]);
    const [personsDict, setPersonsDict] = useState<Record<string, any>>({});

    const [personId, setPersonId] = useState(defaultPersonId);
    const [person, setPerson] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Sync with global state
        if (typeof window !== 'undefined') {
            window.__GN370_DB_STATUS = dbStatus;

            // Ensure GN370 exists just in case
            if (!window.GN370) {
                window.GN370 = { CTX: { openedRecord: null } };
            }

            if (dbStatus === 'EMPTY') {
                window.GN370.CTX.openedRecord = null;
            }
        }
    }, [dbStatus]);

    useEffect(() => {
        if (dbStatus === 'READY' && Object.keys(personsDict).length > 0) {
            const target = personsDict[personId] || personsList[0];
            setPerson(target);
            if (target && target.id && typeof window !== 'undefined' && window.GN370) {
                window.GN370.CTX.openedRecord = target.id;
            }
        } else {
            setPerson(null);
        }
    }, [personId, dbStatus, personsDict, personsList]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            try {
                // Conserva originale (VH-08 / I17)
                _originalGedcomText = content;
                _originalGedcomFilename = file.name;

                const result = parseGedcomFull(content);
                _parsedFamilies = result.families as Record<string, any>;

                // Invariante I8: verifica conteggio
                const parsed = toPersonDataDict(result);
                const parsedCount = Object.keys(parsed).length;
                if (parsedCount !== result.indiCount) {
                    console.warn(`GN370 I8: INDI in GEDCOM=${result.indiCount}, PERSON in DB=${parsedCount}`);
                }

                journal.append('GEDCOM_IMPORT',
                    `Import ${file.name}: ${result.indiCount} INDI, ${result.famCount} FAM`,
                    { entity_type: 'GEDCOM', entity_count: result.indiCount }
                );

                const values = Object.values(parsed);

                // Sort
                const sorted = values.sort((a: any, b: any) => {
                    if (a.isMaleAncestor && !b.isMaleAncestor) return -1;
                    if (!a.isMaleAncestor && b.isMaleAncestor) return 1;
                    const surnameA = a.surname || '';
                    const surnameB = b.surname || '';
                    if (surnameA !== surnameB) return surnameA.localeCompare(surnameB);
                    const nameA = a.name || '';
                    const nameB = b.name || '';
                    return nameA.localeCompare(nameB);
                });

                if (sorted.length > 0) {
                    setPersonsDict(parsed);
                    setPersonsList(sorted);
                    setPersonId(sorted[0].id);
                    setDbStatus('READY');
                } else {
                    alert('Nessuna persona valida trovata nel GEDCOM.');
                }
            } catch (err) {
                console.error("Errore parsing GEDCOM:", err);
                alert("Errore durante la lettura del file GEDCOM.");
            }
        };
        reader.readAsText(file);
    };

    const handleLoadMock = () => {
        // For testing/fallback since mockData has heraldry and worlds
        const parsed = dbDataMock.persons;
        const values = Object.values(parsed);
        const sorted = values.sort((a: any, b: any) => {
            if (a.isMaleAncestor && !b.isMaleAncestor) return -1;
            if (!a.isMaleAncestor && b.isMaleAncestor) return 1;
            const surnameA = a.surname || '';
            const surnameB = b.surname || '';
            if (surnameA !== surnameB) return surnameA.localeCompare(surnameB);
            const nameA = a.name || '';
            const nameB = b.name || '';
            return nameA.localeCompare(nameB);
        });

        setPersonsDict(parsed);
        setPersonsList(sorted);

        // Se I99 esiste usalo, altrimenti usa il primo palese
        const hasDefault = !!parsed[defaultPersonId as keyof typeof parsed];
        setPersonId(hasDefault ? defaultPersonId : sorted[0].id);

        setDbStatus('READY');
    };

    const handleExport = async () => {
        try {
            await buildAndDownloadZip({
                persons: personsDict,
                families: _parsedFamilies,
                originalGedcom: _originalGedcomText ?? undefined,
                originalGedcomFilename: _originalGedcomFilename,
            });
        } catch (err) {
            console.error('GN370 EXPORT ERROR:', err);
            alert('Errore durante la generazione del file ZIP.');
        }
    };

    if (dbStatus === 'EMPTY') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
                <div style={{ textAlign: 'center', border: 'var(--border-style)', padding: '40px', backgroundColor: 'var(--tile-bg)', maxWidth: '500px' }}>
                    <h2 style={{ color: 'var(--accent-color)', marginBottom: '20px' }}>SISTEMA IN ATTESA</h2>
                    <p style={{ color: 'var(--text-color)', marginBottom: '30px' }}>Nessun dataset genealogico attivo nel DOMINIO. Inserire una fonte di verità GEDCOM per inizializzare l'interfaccia 9 Mondi.</p>

                    <input
                        type="file"
                        accept=".ged"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            backgroundColor: 'transparent',
                            border: '1px solid var(--accent-color)',
                            color: 'var(--accent-color)',
                            padding: '10px 20px',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'block',
                            width: '100%',
                            marginBottom: '15px'
                        }}
                    >
                        [ UPLOAD GEDCOM (.GED) ]
                    </button>

                    <button
                        onClick={handleLoadMock}
                        style={{
                            backgroundColor: 'transparent',
                            border: '1px dashed var(--secondary-color)',
                            color: 'var(--secondary-color)',
                            padding: '10px 20px',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'block',
                            width: '100%'
                        }}
                    >
                        [ LOAD DEMO DATASET ]
                    </button>
                </div>
            </motion.div>
        );
    }

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
                maxWidth: '600px', // Forces it to remain a compact block on desktop
                margin: '0 auto',  // Centers the 3x3 block
                aspectRatio: '1 / 1' // Helps maintain a square proportion for the whole grid
            }}>
                {Object.entries(person.worlds || {}).map(([key, world]: [string, any]) => (
                    <WorldTile key={key} worldKey={key} worldInfo={world} personId={person.id} />
                ))}
            </div>
        </motion.div>
    );
};
