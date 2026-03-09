export interface WorldMetadata {
    id: string;
    name: string;
    is_active: boolean;
    color_var: string; // CSS Variable name like var(--accent-color)
    data: any;
}

export interface PersonData {
    id: string;
    name: string;
    worlds: Record<string, WorldMetadata>;
}

export const mockPersonData: PersonData = {
    id: "I0001",
    name: "Pietro Giardina",
    worlds: {
        "1_origini": {
            id: "1", name: "ORIGINI", is_active: true, color_var: "var(--accent-color)",
            data: { surname: "Giardina", sources_count: 5, generation: "Root" }
        },
        "2_cicli": {
            id: "2", name: "CICLI", is_active: true, color_var: "var(--text-color)",
            data: { events: ["BIRT 1860, Ficarazzi", "MARR 1885", "DEAT 1940"] }
        },
        "3_doni": {
            id: "3", name: "DONI", is_active: false, color_var: "var(--secondary-color)",
            data: null
        },
        "4_ombre": {
            id: "4", name: "OMBRE", is_active: true, color_var: "var(--alert-color)",
            data: { anomalies: ["Death of first child: Maria (1886-1886)"] }
        },
        "5_contesto": {
            id: "5", name: "CONTESTO", is_active: true, color_var: "var(--hint-color)",
            data: { events: ["1860 - Spedizione dei Mille in Sicilia"] }
        },
        "6_struttura": {
            id: "6", name: "STRUTTURA", is_active: false, color_var: "var(--accent-color)",
            data: null
        },
        "7_eredita": {
            id: "7", name: "EREDITÀ", is_active: true, color_var: "var(--secondary-color)",
            data: { assets: ["Casa in Piazza Ficarazzi", "Orto limoni"] }
        },
        "8_nebbia": {
            id: "8", name: "NEBBIA", is_active: true, color_var: "var(--hint-color)",
            data: { hints: ["HINT-004: Verificare registri parrocchiali a Misilmeri"] }
        },
        "9_radici": {
            id: "9", name: "RADICI", is_active: true, color_var: "var(--text-color)",
            data: { origin: "Normanna/Francese 'Jardine'", convergence: "Valle dell'Eleuterio" }
        }
    }
};
