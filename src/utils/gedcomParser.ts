import type { PersonData, WorldMetadata } from '../data/mockData';

export const parseGedcom = (gedcomText: string): Record<string, PersonData> => {
    const lines = gedcomText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    const persons: Record<string, any> = {};
    const families: Record<string, any> = {};

    let currentRecord: any = null;
    let currentType = '';
    let currentTag = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/^(\d+)\s+(@\S+@|\S+)(?:\s+(.*))?$/);
        if (!match) continue;

        const level = parseInt(match[1]);
        const tagOrId = match[2];
        const value = match[3] || '';

        if (level === 0) {
            if (value === 'INDI') {
                const id = tagOrId.replace(/@/g, '');
                currentRecord = { id, name: '', surname: '', birth: '', death: '', isMaleAncestor: false, events: [] };
                persons[id] = currentRecord;
                currentType = 'INDI';
            } else if (value === 'FAM') {
                const id = tagOrId.replace(/@/g, '');
                currentRecord = { id, husb: '', wife: '', chil: [] };
                families[id] = currentRecord;
                currentType = 'FAM';
            } else {
                currentType = 'OTHER';
            }
        } else if (level === 1 && currentType === 'INDI') {
            currentTag = tagOrId;
            if (currentTag === 'NAME') {
                const nameParts = value.split('/');
                if (!currentRecord.name && !currentRecord.surname) {
                    currentRecord.name = (nameParts[0] || '').trim();
                    currentRecord.surname = (nameParts[1] || '').trim();
                }
            } else if (currentTag === 'SEX') {
                currentRecord.isMaleAncestor = value === 'M';
            }
        } else if (level === 2 && currentType === 'INDI') {
            if (currentTag === 'BIRT' && tagOrId === 'DATE') {
                currentRecord.birth = value;
                currentRecord.events.push(`BIRT ${value}`);
            } else if (currentTag === 'DEAT' && tagOrId === 'DATE') {
                currentRecord.death = value;
                currentRecord.events.push(`DEAT ${value}`);
            }
        } else if (level === 1 && currentType === 'FAM') {
            if (tagOrId === 'HUSB') {
                currentRecord.husb = value.replace(/@/g, '');
            } else if (tagOrId === 'WIFE') {
                currentRecord.wife = value.replace(/@/g, '');
            } else if (tagOrId === 'CHIL') {
                currentRecord.chil.push(value.replace(/@/g, ''));
            }
        }
    }

    // Convert to PersonData format
    const result: Record<string, PersonData> = {};
    for (const [id, p] of Object.entries(persons)) {
        // Construct worlds
        const worlds: Record<string, WorldMetadata> = {
            "1_origini": {
                id: "1", name: "ORIGINI", is_active: true, color_var: "var(--accent-color)",
                data: { surname: p.surname, name: p.name }
            },
            "2_cicli": {
                id: "2", name: "CICLI", is_active: p.events.length > 0, color_var: "var(--text-color)",
                data: p.events.length > 0 ? { events: p.events } : null
            },
            "3_doni": {
                id: "3", name: "DONI", is_active: false, color_var: "var(--secondary-color)",
                data: null
            },
            "4_ombre": {
                id: "4", name: "OMBRE", is_active: false, color_var: "var(--alert-color)",
                data: null
            },
            "5_contesto": {
                id: "5", name: "CONTESTO", is_active: false, color_var: "var(--hint-color)",
                data: null
            },
            "6_struttura": {
                id: "6", name: "STRUTTURA", is_active: false, color_var: "var(--accent-color)",
                data: null
            },
            "7_eredita": {
                id: "7", name: "EREDITÀ", is_active: false, color_var: "var(--secondary-color)",
                data: null
            },
            "8_nebbia": {
                id: "8", name: "NEBBIA", is_active: false, color_var: "var(--hint-color)",
                data: null
            },
            "9_radici": {
                id: "9", name: "RADICI", is_active: false, color_var: "var(--text-color)",
                data: null
            }
        };

        result[id] = {
            id: p.id,
            name: `${p.name} ${p.surname}`.trim(),
            worlds: worlds
        } as unknown as PersonData; // Will hack extra fields into PersonData at runtime to match existing

        (result[id] as any).surname = p.surname;
        (result[id] as any).birth = p.birth;
        (result[id] as any).death = p.death;
        (result[id] as any).isMaleAncestor = p.isMaleAncestor;
    }

    return result;
};
