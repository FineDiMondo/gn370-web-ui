import fs from 'fs';
import path from 'path';

// Files and Paths
const GEDCOM_PATH = path.resolve('../gedcom-api-enricher/output_giardina_negrini.ged');
const DOCS_DIR = path.resolve('../gedcom-api-enricher/docs');
const PUBLIC_DOCS_DIR = path.resolve('./public/docs/famiglie');
const DB_OUTPUT_PATH = path.resolve('./src/data/db.json');

// Assicuriamoci che la directory pubblica per i documenti esista
if (!fs.existsSync(PUBLIC_DOCS_DIR)) {
    fs.mkdirSync(PUBLIC_DOCS_DIR, { recursive: true });
}

// Struttura base del DB
const db = {
    persons: {},
    families: {}
};

// Lettura e parsing semplice del file GEDCOM
function parse_gedcom(filepath) {
    if (!fs.existsSync(filepath)) {
        console.error(`File GEDCOM non trovato: ${filepath}`);
        return;
    }

    const content = fs.readFileSync(filepath, 'utf-8');
    const lines = content.split(/\r?\n/);

    let currentObjType = null;
    let currentObjId = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Nuovo Individuo: '0 @I1@ INDI'
        const indiMatch = line.match(/^0\s+@([^@]+)@\s+INDI$/);
        const famMatch = line.match(/^0\s+@([^@]+)@\s+FAM$/);

        if (indiMatch) {
            currentObjType = 'INDI';
            currentObjId = indiMatch[1];
            db.persons[currentObjId] = {
                id: currentObjId,
                name: 'Sconosciuto',
                surname: '',
                sex: '',
                famc: null,
                birth: '',
                death: '',
                docs: [],
                worlds: generateDefaultWorlds(),
                isMaleAncestor: false
            };
            continue;
        }

        if (famMatch) {
            currentObjType = 'FAM';
            currentObjId = famMatch[1];
            db.families[currentObjId] = {
                id: currentObjId,
                husb: null,
                wife: null
            };
            continue;
        }

        if (currentObjType === 'INDI') {
            const p = db.persons[currentObjId];
            if (line.startsWith('1 NAME')) {
                const nameMatch = line.match(/1 NAME (.*)/);
                if (nameMatch) {
                    p.name = nameMatch[1].replace(/\//g, '').trim();
                    const surnameMatch = line.match(/\/(.*?)\//);
                    if (surnameMatch) {
                        p.surname = surnameMatch[1].trim();
                    }
                }
            }

            if (line.startsWith('1 SEX')) {
                p.sex = line.substring(6).trim();
            }

            if (line.startsWith('1 FAMC')) {
                const match = line.match(/@([^@]+)@/);
                if (match) p.famc = match[1];
            }

            // Date
            if (line.startsWith('1 BIRT')) {
                let j = i + 1;
                while (j < lines.length && !lines[j].startsWith('1 ') && !lines[j].startsWith('0 ')) {
                    if (lines[j].startsWith('2 DATE')) p.birth = lines[j].substring(7).trim();
                    j++;
                }
            }
            if (line.startsWith('1 DEAT')) {
                let j = i + 1;
                while (j < lines.length && !lines[j].startsWith('1 ') && !lines[j].startsWith('0 ')) {
                    if (lines[j].startsWith('2 DATE')) p.death = lines[j].substring(7).trim();
                    j++;
                }
            }
        } else if (currentObjType === 'FAM') {
            const f = db.families[currentObjId];
            if (line.startsWith('1 HUSB')) {
                const match = line.match(/@([^@]+)@/);
                if (match) f.husb = match[1];
            } else if (line.startsWith('1 WIFE')) {
                const match = line.match(/@([^@]+)@/);
                if (match) f.wife = match[1];
            }
        }
    }
}

function computeMaleAncestors(rootId) {
    let currentId = rootId;
    while (currentId) {
        const person = db.persons[currentId];
        if (!person) break;

        person.isMaleAncestor = true;

        if (!person.famc) break;
        const family = db.families[person.famc];
        if (!family || !family.husb) break;

        currentId = family.husb;
    }
}

// Costruisce la dashboard dei 9 Mondi per l'individuo
function generateDefaultWorlds() {
    return {
        "1_origini": { id: "1", name: "ORIGINI", is_active: false, color_var: "var(--accent-color)", data: {} },
        "2_cicli": { id: "2", name: "CICLI", is_active: false, color_var: "var(--text-color)", data: { events: [] } },
        "3_doni": { id: "3", name: "DONI", is_active: false, color_var: "var(--secondary-color)", data: null },
        "4_ombre": { id: "4", name: "OMBRE", is_active: false, color_var: "var(--alert-color)", data: null },
        "5_contesto": { id: "5", name: "CONTESTO", is_active: false, color_var: "var(--hint-color)", data: null },
        "6_struttura": { id: "6", name: "STRUTTURA", is_active: false, color_var: "var(--accent-color)", data: null },
        "7_eredita": { id: "7", name: "EREDITÀ", is_active: false, color_var: "var(--secondary-color)", data: null },
        "8_nebbia": { id: "8", name: "NEBBIA", is_active: false, color_var: "var(--hint-color)", data: null },
        "9_radici": { id: "9", name: "RADICI", is_active: false, color_var: "var(--text-color)", data: null }
    };
}

// Associa la documentazione alle persone e popola i Mondi (Es. Origini, Cicli)
function processAndMapDocs() {
    if (!fs.existsSync(DOCS_DIR)) return;

    const files = fs.readdirSync(DOCS_DIR);

    // Per ogni file in docs
    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        if (ext !== '.md' && ext !== '.txt' && ext !== '.csv' && ext !== '.docx' && ext !== '.svg') return;

        const fileNameUpper = file.toUpperCase();

        // Trova l'individuo o la famiglia più probabile a cui associarlo nel GEDCOM
        for (const [id, person] of Object.entries(db.persons)) {
            // Match euristico: se il nome del file contiene pezzi del nome della persona
            const nameParts = person.name.toUpperCase().split(' ');
            let hasMatch = false;

            // Semplice match: se il cognome GIARDINA sta nel file e (anche LUIGI o ANTONINO)
            if (person.surname && fileNameUpper.includes(person.surname.toUpperCase())) {
                // Ulteriore filtro: se c'è un first name
                if (nameParts[0] && fileNameUpper.includes(nameParts[0])) {
                    hasMatch = true;
                } else if (fileNameUpper.includes("GENEALOGIA") || fileNameUpper.includes("ALBERO") || fileNameUpper.includes("CASATE") || fileNameUpper.includes("ARALDICA") || ext === '.svg') {
                    // Documento di famiglia generico, assegnalo a tutti quelli col cognome se vogliamo, o solo al "Root"
                    hasMatch = true;
                }
            }

            if (hasMatch) {
                // Copia il file nella cartella frontend
                const destFamilyFolder = path.join(PUBLIC_DOCS_DIR, person.surname || 'Generale');
                if (!fs.existsSync(destFamilyFolder)) fs.mkdirSync(destFamilyFolder, { recursive: true });

                const sourcePath = path.join(DOCS_DIR, file);
                const destPath = path.join(destFamilyFolder, file);
                fs.copyFileSync(sourcePath, destPath);

                // Registra il file nella lista dei documenti della persona
                const relUrl = `/docs/famiglie/${person.surname || 'Generale'}/${file}`;
                if (!person.docs.includes(relUrl)) {
                    person.docs.push(relUrl);

                    // Attiva il Mondo 1 (Origini) perché abbiamo documentazione
                    person.worlds["1_origini"].is_active = true;
                    person.worlds["1_origini"].data.documents = person.docs;
                    person.worlds["1_origini"].data.surname = person.surname;

                    // Gestione specifica SVG Araldici (NVH-04)
                    if (ext === '.svg') {
                        let svgRaw = fs.readFileSync(sourcePath, 'utf8');

                        // FIX: Molti SVG da Wiki (es. 600x600) non hanno il viewBox, perdendo la scalabilità CSS.
                        // Iniettiamo viewBox="0 0 width height" se assente.
                        if (!svgRaw.includes('viewBox=')) {
                            const widthMatch = svgRaw.match(/width=(["'])(\d+)\1/);
                            const heightMatch = svgRaw.match(/height=(["'])(\d+)\1/);
                            if (widthMatch && heightMatch) {
                                const w = widthMatch[2];
                                const h = heightMatch[2];
                                svgRaw = svgRaw.replace('<svg ', `<svg viewBox="0 0 ${w} ${h}" `);
                            }
                        }

                        person.worlds["7_eredita"].is_active = true;

                        person.worlds["7_eredita"].data = person.worlds["7_eredita"].data || {};
                        person.worlds["7_eredita"].data.heraldry = person.worlds["7_eredita"].data.heraldry || [];
                        person.worlds["7_eredita"].data.heraldry.push(svgRaw);

                        person.worlds["1_origini"].data = person.worlds["1_origini"].data || {};
                        person.worlds["1_origini"].data.heraldry = person.worlds["1_origini"].data.heraldry || [];
                        person.worlds["1_origini"].data.heraldry.push(svgRaw);
                    }

                    // Attiva Mondo 5 / 7 etc in base a keywords
                    if (fileNameUpper.includes("TIMELINE") || fileNameUpper.includes("STORIA")) {
                        person.worlds["5_contesto"].is_active = true;
                    }
                    if (fileNameUpper.includes("CARICHE") || fileNameUpper.includes("TITOLI") || fileNameUpper.includes("ARALDICA") || ext === '.svg') {
                        person.worlds["7_eredita"].is_active = true;
                        person.worlds["3_doni"].is_active = true;
                    }
                }
            }
        }
    });
}

function finalizeWorlds() {
    for (const [id, person] of Object.entries(db.persons)) {
        // --- MONDO 2: CICLI ---
        if (person.birth || person.death) {
            person.worlds["2_cicli"].is_active = true;
            if (person.birth) person.worlds["2_cicli"].data.events.push(`BIRT: ${person.birth}`);
            if (person.death) person.worlds["2_cicli"].data.events.push(`DEAT: ${person.death}`);
        }

        // --- MONDO 8: NEBBIA & MONDO 4: OMBRE (Gestione LACUNE ~GAP~) ---
        const gaps = [];
        const hints = [];

        // 1. Lacuna Temporale Basica (Date mancanti)
        if (!person.birth) {
            gaps.push({ type: 'MISSING_BIRTH', priority: 'MEDIA', description: 'Data di nascita sconosciuta.' });
            hints.push('Ricerca nei Registri Parrocchiali pre-unitari o Archivio di Stato (Stato Civile).');
        } else if (person.birth && !person.death && person.birth.includes('15') || person.birth.includes('16') || person.birth.includes('17')) {
            // Se nato molto tempo fa anticamente ma senza morte:
            gaps.push({ type: 'MISSING_DEATH', priority: 'ALTA', description: 'Data di morte assente per un individuo storico.' });
            hints.push('Verifica i registri dei defunti o testamenti notarili coevi.');
        }

        // 2. Lacune Mogli (isMaleAncestor senza Famiglia definita o senza WIFE chiara nel GEDCOM)
        // Se è un ascendente maschile, ci aspettiamo che abbia una moglie.
        if (person.isMaleAncestor) {
            let foundWife = false;
            // Cerchiamo le famiglie in cui lui è HUSB
            for (const fam of Object.values(db.families)) {
                if (fam.husb === person.id) {
                    if (fam.wife && db.persons[fam.wife] && db.persons[fam.wife].name !== 'Sconosciuto') {
                        foundWife = true;
                    }
                }
            }
            if (!foundWife) {
                gaps.push({ type: 'GAP-B_MISSING_WIFE', priority: 'ALTA', description: 'Moglie/Coniuge femminile non documentata.' });
                hints.push('Ricerca Registri Ecclesiastici Matrimoniali Palermo o estratti di matrimonio.');
            }
        }

        if (gaps.length > 0) {
            person.worlds["8_nebbia"].is_active = true;
            person.worlds["8_nebbia"].data = {
                title: 'Catalogazione Lacune (\~GAP\~)',
                gaps: gaps,
                hints: [...new Set(hints)] // Rimuovi duplicati
            };
        }
    }
}

// Esecuzione
console.log('Inizio Data Ingestion...');
parse_gedcom(GEDCOM_PATH);
console.log(`Trovate ${Object.keys(db.persons).length} persone nel GEDCOM.`);

processAndMapDocs();
finalizeWorlds();
computeMaleAncestors('I290');

const outputStr = JSON.stringify(db, null, 2);
fs.writeFileSync(DB_OUTPUT_PATH, outputStr);
console.log(`DB generato con successo su: ${DB_OUTPUT_PATH}`);
