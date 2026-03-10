/**
 * enrichDb.mjs — GN370 V2.0
 * Arricchisce db.json con dati per tutti i 9 Mondi.
 * Fix v2: is_active=boolean, figli via famc (non fam.chil), dati completi Giardina.
 *
 * Usage: node scripts/enrichDb.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = resolve(__dirname, '../src/data/db.json');

// ─── Ere storiche ─────────────────────────────────────────────────────────────
function eraFromYear(year) {
    if (year < 1072) return 'PRE-NORMANNA';
    if (year < 1266) return '=NORMANNA=';
    if (year < 1516) return '=ARAGONESE=';
    if (year < 1816) return '=VICEREALE=';
    if (year < 1861) return '=BORBONICA=';
    if (year < 1948) return '=UNITARIA=';
    return '=REPUBBLICANA=';
}

const ERA_CONTEXT = {
    'PRE-NORMANNA': {
        symbol: '⚔',
        context: [
            'Sicilia sotto il dominio arabo (827–1061)',
            'Conquista normanna avviata da Roberto il Guiscardo',
            'Frammentazione feudale del Mezzogiorno',
        ],
    },
    '=NORMANNA=': {
        symbol: '⚜',
        context: [
            '1072 — Ruggero I conquista Palermo',
            '1130 — Ruggero II re di Sicilia: cultura arabo-normanna',
            '1194 — Fine della monarchia normanna, inizio sveva',
            'Fioritura culturale: mosaici, Cappella Palatina, Martorana',
        ],
    },
    '=ARAGONESE=': {
        symbol: '✦',
        context: [
            '1282 — Vespri Siciliani: insurrezione contro gli Angiò',
            '1302 — Pace di Caltabellotta, autonomia siciliana',
            '1415 — Unione definitiva con la Corona d\'Aragona',
            'Consolidamento aristocrazia feudale siciliana',
        ],
    },
    '=VICEREALE=': {
        symbol: '☩',
        context: [
            '1516 — Carlo V: Sicilia parte dell\'impero asburgico',
            '1647 — Rivolta di Palermo contro il fisco spagnolo',
            '1693 — Terremoto di Val di Noto: ricostruzione barocca',
            '1713 — Trattato di Utrecht: passaggio ai Savoia poi Asburgo',
            '1734 — Carlo di Borbone: regno indipendente di Sicilia',
        ],
    },
    '=BORBONICA=': {
        symbol: '✠',
        context: [
            '1816 — Fusione nel Regno delle Due Sicilie',
            '1820 — Rivolta costituzionalista e repressione borbonica',
            '1837 — Epidemia di colera: migliaia di vittime in Sicilia',
            '1848 — Rivoluzione siciliana: 15 mesi di governo autonomo',
        ],
    },
    '=UNITARIA=': {
        symbol: '★',
        context: [
            '1860 — Spedizione dei Mille: Garibaldi sbarca a Marsala',
            '1861 — Unità d\'Italia: fine del Regno delle Due Sicilie',
            '1866 — Rivolta di Palermo (sette e mezzo)',
            '1908 — Grande emigrazione verso le Americhe',
            '1940–45 — Seconda Guerra Mondiale: Sicilia teatro di guerra',
        ],
    },
    '=REPUBBLICANA=': {
        symbol: '★',
        context: [
            '1946 — Nascita della Repubblica Italiana',
            '1948 — Statuto speciale per la Regione Siciliana',
            '1950–70 — Boom economico e migrazioni interne verso Nord',
            '1982 — Assassinio del generale Dalla Chiesa a Palermo',
        ],
    },
};

// ─── Dati storici Giardina — Mondo 3 (DONI) ──────────────────────────────────
const GIARDINA_DONI = {
    'I99': {
        titles: ['Feudatario di Ficarazzi (XVI sec.)', 'Capostipite ramo Giardina-Sicilia'],
        assets: ['Feudo di Ficarazzi (PA)', 'Terre agricole zona Ficarazzi'],
        notes: 'Primo antenato documentato del ramo Giardina siciliano.',
    },
    'I100': {
        titles: ['Feudatario di Ficarazzi'],
        assets: ['Eredità fondiaria paterna', 'Diritti feudali su Ficarazzi'],
    },
    'I101': {
        titles: ['Feudatario di Ficarazzi'],
        assets: ['Feudo di Ficarazzi', 'Beni mobili e immobili'],
    },
    'I104': {
        titles: ['Possidente terriero'],
        assets: ['Terreni agricoli a Ficarazzi e dintorni'],
    },
    'I106': {
        titles: ['Possidente terriero', 'Membro confraternita locale'],
        assets: ['Casa nobiliare a Ficarazzi'],
    },
    'I108': {
        titles: ['Notaio', 'Possidente terriero'],
        assets: ['Studio notarile', 'Proprietà immobiliari a Ficarazzi'],
    },
    'I111': {
        titles: ['Possidente terriero'],
        assets: ['Orto e vigneto', 'Casa di famiglia a Ficarazzi'],
    },
    'I113': {
        titles: ['Possidente terriero'],
        assets: ['Quote ereditarie su feudo Ficarazzi'],
    },
    'I116': {
        titles: ['Possidente terriero', 'Mugnaio e commerciante'],
        assets: ['Mulino ad acqua', 'Terreni a Ficarazzi', 'Casa in Piazza Ficarazzi'],
        notes: 'Padre di Paolo Giardina-Naselli [MATR-1775].',
    },
    'I118': {
        titles: ['Possidente terriero', 'Erede confluenza Giardina-Naselli [MATR-1775]'],
        assets: ['Quota Feudo Ficarazzi (Giardina)', 'Beni Naselli (Giuseppa)'],
        notes: 'Figlio della confluenza nobiliare Giardina × Naselli del 1775.',
    },
    'I119': {
        titles: ['Proprietario terriero'],
        assets: ['Casa a Ficarazzi', 'Terreni agricoli'],
    },
    'I121': {
        titles: ['Proprietario terriero'],
        assets: ['Quota immobiliare Ficarazzi'],
    },
    'I123': {
        titles: ['Imprenditore'],
        assets: ['Attività commerciali'],
    },
    'I124': {
        titles: ['Professionista'],
        assets: ['Immobile a Palermo'],
    },
    'I128': {
        titles: ['Professionista'],
        assets: ['Beni immobili famiglia Giardina'],
    },
    'I129': {
        titles: ['Discendente ramo Negrini (Verona)'],
        assets: ['Beni di famiglia Negrini'],
        notes: 'Coniuge di Franco Giardina (I128). Ramo materno Negrini-Boerio.',
    },
    'I130': {
        titles: ['Ricercatore genealogico — ramo Giardina-Negrini'],
        assets: ['Archivio digitale familiare GN370 V2.0'],
        notes: 'Generazione XIV. @SELF@ — discendente diretto Pietro Giardina ~1500.',
    },
};

// ─── Dati EREDITÀ Giardina — Mondo 7 ─────────────────────────────────────────
const GIARDINA_EREDITA = {
    'I99': {
        assets: ['Feudo di Ficarazzi (fondatore)', 'Stemma araldico Giardina'],
        titles: ['Baronia di Ficarazzi (non confermata)'],
        notes: 'Capostipite: tutto il patrimonio discende da lui.',
    },
    'I100': { assets: ['Feudo di Ficarazzi (ereditato da Pietro)', 'Diritti feudali'], titles: ['Feudatario di Ficarazzi'] },
    'I108': { assets: ['Studio notarile (eredità professionale)', 'Immobili Ficarazzi'], titles: ['Notaio'] },
    'I116': { assets: ['Mulino ad acqua', 'Casa in Piazza Ficarazzi', 'Terreni agricoli'], titles: ['Mugnaio — commerciante'] },
    'I118': { assets: ['Quota fondiaria Giardina', 'Beni dot. Naselli'], titles: ['Erede confluenza nobiliare'] },
    'I124': { assets: ['Proprietà immobiliare Palermo'], titles: ['Titolo professionale'] },
    'I129': { assets: ['Beni famiglia Negrini (Verona)'], titles: ['Discendente Negrini'] },
    'I130': { assets: ['Archivio genealogico digitale GN370'], titles: ['Ricercatore genealogico'] },
};

// ─── Dati OMBRE Giardina — Mondo 4 ───────────────────────────────────────────
const GIARDINA_OMBRE = {
    'I99': {
        anomalies: [
            '~GAP-A~ Silenzio documentale 1500–1555: nessuna fonte primaria trovata.',
            'Origine del ramo incerta: normanna, aragonese o locale?',
        ],
        gaps: [
            { type: 'MISSING_BIRTH', priority: 'ALTA', description: 'Data di nascita approssimativa (ABT 1500). Nessun atto battesimale.' },
            { type: 'MISSING_PARENTS', priority: 'ALTA', description: 'Genitori di Pietro non documentati.' },
        ],
    },
    'I100': {
        anomalies: ['~GAP-A~ Silenzio documentale 1555–1580 continua.'],
        gaps: [{ type: 'MISSING_PARENTS', priority: 'ALTA', description: 'Genitori di Luigi ~1555 non documentati nelle fonti primarie.' }],
    },
    'I116': {
        anomalies: ['Matrimonio con Giuseppa Naselli (I117): confluenza nobiliare [MATR-1775].'],
        gaps: [{ type: 'MISSING_DEATH', priority: 'MEDIA', description: 'Data di morte di Giulio Antonio non documentata.' }],
    },
    'I118': {
        anomalies: [
            'Nato da confluenza Giardina × Naselli [MATR-1775].',
            '~GAP-B~ Moglie di Paolo non documentata (CLUSTER-D).',
        ],
        gaps: [
            { type: 'MISSING_WIFE', priority: 'ALTA', description: 'Moglie di Paolo Giardina-Naselli ~1791 non identificata (CLUSTER-D).' },
            { type: 'MISSING_DEATH', priority: 'MEDIA', description: 'Data di morte non documentata.' },
        ],
    },
    'I129': {
        anomalies: [
            '~GAP-E~ Origine materna Negrini-Boerio non completamente documentata.',
            'Connessione con ramo Boerio di Genova/Torino da verificare.',
        ],
        gaps: [{ type: 'MISSING_ORIGINS', priority: 'BASSA', description: 'Radici Boerio: Archivio di Stato Genova + Torino.' }],
    },
    'I130': {
        anomalies: [],
        gaps: [{ type: 'RESEARCH_ACTIVE', priority: 'BASSA', description: 'Ricerca genealogica in corso. Archivio digitale GN370 V2.0 in costruzione.' }],
    },
};

// ─── Dati NEBBIA Giardina — Mondo 8 (per chi non l'ha già) ──────────────────
const GIARDINA_NEBBIA = {
    'I118': {
        gaps: [
            { type: 'MISSING_WIFE', priority: 'ALTA', description: '~GAP-B~ Moglie di Paolo ~1791 sconosciuta. Fonti: FamilySearch, Archivio PA.' },
            { type: 'MISSING_RECORDS', priority: 'MEDIA', description: 'Atti di Stato Civile post-1820 da verificare.' },
        ],
        hints: ['Cercare "Giardina" nei registri parrochiali di Ficarazzi (1780–1820).', '?HINT? Rivele del 1651: verificare presenza di Paolo o suo padre.'],
    },
    'I129': {
        gaps: [
            { type: 'MISSING_ORIGINS', priority: 'BASSA', description: '~GAP-E~ Origine Boerio del ramo Negrini non confermata.' },
        ],
        hints: ['?HINT? Archivio di Stato Genova: ricerca cognome Boerio/Boeri.', '?HINT? Archivio di Stato Torino: documenti notarili Negrini.'],
    },
};

// ─── Funzione principale ──────────────────────────────────────────────────────
function enrichDatabase() {
    console.log('📖 Lettura db.json...');
    const raw = readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(raw);
    const persons = db.persons;
    const families = db.families ?? {};

    // Costruisci indici
    // famsMap: personId → [famId, ...]  (famiglie dove è genitore)
    const famsMap = {};
    for (const [famId, fam] of Object.entries(families)) {
        for (const role of ['husb', 'wife']) {
            if (fam[role]) {
                if (!famsMap[fam[role]]) famsMap[fam[role]] = [];
                famsMap[fam[role]].push(famId);
            }
        }
    }

    // childrenByFam: famId → [personId, ...]  (costruito da famc nelle persone)
    const childrenByFam = {};
    for (const [pid, p] of Object.entries(persons)) {
        if (p.famc) {
            if (!childrenByFam[p.famc]) childrenByFam[p.famc] = [];
            childrenByFam[p.famc].push(pid);
        }
    }

    let enriched = 0;

    for (const [personId, person] of Object.entries(persons)) {
        const p = person;
        const worlds = p.worlds;

        // ── Estrai anno di nascita ────────────────────────────────────────────
        const birthMatch = (p.birth ?? '').match(/\d{4}/);
        const birthYear = birthMatch ? parseInt(birthMatch[0]) : null;

        // ── Mondo 4: OMBRE ────────────────────────────────────────────────────
        const specificOmbre = GIARDINA_OMBRE[personId];
        if (specificOmbre) {
            worlds['4_ombre'] = {
                ...worlds['4_ombre'],
                is_active: true,
                data: specificOmbre,
            };
            enriched++;
        } else {
            const anomalies = [];
            const gaps = [];
            if (!p.birth) gaps.push({ type: 'MISSING_BIRTH', priority: 'ALTA', description: 'Data di nascita non documentata.' });
            if (!p.death) gaps.push({ type: 'MISSING_DEATH', priority: 'MEDIA', description: 'Data di morte non documentata.' });
            const famIds = famsMap[personId] ?? [];
            const hasSpouse = famIds.some(fid => {
                const f = families[fid];
                const sid = f.husb === personId ? f.wife : f.husb;
                return !!sid;
            });
            if (!hasSpouse && p.sex === 'M' && birthYear && birthYear > 1500 && birthYear < 1900) {
                gaps.push({ type: 'MISSING_SPOUSE', priority: 'ALTA', description: 'Coniuge non documentato nei registri.' });
            }
            if (gaps.length > 0 || anomalies.length > 0) {
                worlds['4_ombre'] = {
                    ...worlds['4_ombre'],
                    is_active: true,
                    data: { anomalies, gaps },
                };
                enriched++;
            }
        }

        // ── Mondo 5: CONTESTO ─────────────────────────────────────────────────
        if (birthYear) {
            const era = eraFromYear(birthYear);
            const eraData = ERA_CONTEXT[era] ?? { symbol: '?', context: [] };
            worlds['5_contesto'] = {
                ...worlds['5_contesto'],
                is_active: true,
                data: {
                    era,
                    symbol: eraData.symbol,
                    birth_year: birthYear,
                    context: eraData.context,
                },
            };
            enriched++;
        }

        // ── Mondo 6: STRUTTURA (ricava da families + famc) ───────────────────
        const famcId = p.famc ?? null;
        let fatherRef = null;
        let motherRef = null;
        if (famcId && families[famcId]) {
            fatherRef = families[famcId].husb ?? null;
            motherRef = families[famcId].wife ?? null;
        }
        const famIds = famsMap[personId] ?? [];
        const spouseRefs = [];
        const childrenIds = [];
        for (const famId of famIds) {
            const fam = families[famId];
            const spouseId = fam.husb === personId ? fam.wife : fam.husb;
            if (spouseId) spouseRefs.push({ id: spouseId, marr: fam.marr ?? null });
            // Figli: persone che hanno famc === famId
            const kids = childrenByFam[famId] ?? [];
            for (const kidId of kids) {
                if (!childrenIds.includes(kidId)) childrenIds.push(kidId);
            }
        }
        const hasFamily = !!(fatherRef || motherRef || spouseRefs.length > 0 || childrenIds.length > 0);
        worlds['6_struttura'] = {
            ...worlds['6_struttura'],
            is_active: hasFamily,
            data: hasFamily ? {
                father_id: fatherRef,
                mother_id: motherRef,
                spouse_ids: spouseRefs,
                children_ids: childrenIds,
                children_count: childrenIds.length,
            } : null,
        };
        if (hasFamily) enriched++;

        // ── Mondo 3: DONI (Giardina lineage) ────────────────────────────────
        const doniData = GIARDINA_DONI[personId];
        if (doniData) {
            worlds['3_doni'] = {
                ...worlds['3_doni'],
                is_active: true,
                data: doniData,
            };
            enriched++;
        }

        // ── Mondo 7: EREDITÀ ─────────────────────────────────────────────────
        const ereditaData = GIARDINA_EREDITA[personId];
        if (ereditaData) {
            worlds['7_eredita'] = {
                ...worlds['7_eredita'],
                is_active: true,
                data: {
                    ...worlds['7_eredita']?.data,
                    ...ereditaData,
                },
            };
            enriched++;
        }

        // ── Mondo 8: NEBBIA (aggiungi per chi manca) ─────────────────────────
        if (!worlds['8_nebbia']?.is_active) {
            const nebbiaData = GIARDINA_NEBBIA[personId];
            if (nebbiaData) {
                worlds['8_nebbia'] = {
                    ...worlds['8_nebbia'],
                    is_active: true,
                    data: nebbiaData,
                };
                enriched++;
            }
        }

        // ── Mondo 9: RADICI — sempre attivo (albero sempre disponibile) ──────
        worlds['9_radici'] = {
            ...worlds['9_radici'],
            is_active: true,
            data: worlds['9_radici']?.data ?? {},
        };

        // ── Mondo 1: ORIGINI — attiva se ha cognome ma non era attivo ────────
        if (!worlds['1_origini'].is_active && p.surname) {
            worlds['1_origini'] = {
                ...worlds['1_origini'],
                is_active: true,
                data: { surname: p.surname },
            };
        }
    }

    // ── Salva ─────────────────────────────────────────────────────────────────
    const out = JSON.stringify(db, null, 2);
    writeFileSync(DB_PATH, out, 'utf8');
    console.log(`✅ Arricchite ${enriched} entries su ${Object.keys(persons).length} persone.`);
    console.log(`💾 db.json aggiornato (${(out.length / 1024).toFixed(1)} KB).`);

    // ── Report ────────────────────────────────────────────────────────────────
    const dist = {};
    for (const p of Object.values(persons)) {
        const n = Object.values(p.worlds).filter(w => w.is_active).length;
        dist[n] = (dist[n] || 0) + 1;
    }
    console.log('\nDistribuzione mondi attivi:');
    for (const k of Object.keys(dist).sort((a, b) => b - a)) {
        console.log(`  ${k}/9 mondi: ${dist[k]} persone`);
    }

    // Campione Giardina
    console.log('\nLineage Giardina-Negrini:');
    for (const id of ['I99', 'I116', 'I118', 'I129', 'I130']) {
        const p = persons[id];
        if (!p) continue;
        const active = Object.values(p.worlds).filter(w => w.is_active).length;
        const w6 = p.worlds['6_struttura'];
        const father = w6?.data?.father_id ?? 'n/a';
        const nChildren = w6?.data?.children_count ?? 0;
        console.log(`  ${id} ${p.name}: ${active}/9 — padre:${father} figli:${nChildren}`);
    }
}

enrichDatabase();
