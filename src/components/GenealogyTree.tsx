/**
 * GenealogyTree — Albero genealogico SVG left-to-right
 * GN370 V2.0 · STEP 14 (tree.js equivalente React)
 *
 * Mostra fino a 5 generazioni in layout orizzontale.
 * Nodi cliccabili → navigazione WorldDetail.
 * Simboli: #ROOT# Pietro ~1500 · [MATR-1775] confluenza · @SELF@
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Tipi ────────────────────────────────────────────────────────────────────

interface TreePerson {
  id: string;
  name: string;
  surname: string;
  birth?: string;
  death?: string;
  sex?: string;
  famc?: string | null;   // family as child
}

interface TreeFamily {
  id: string;
  husb?: string;
  wife?: string;
  chil?: string[];
  marr?: string;
}

interface TreeNode {
  person: TreePerson;
  generation: number;  // 0 = focus, -1 = parent, -2 = grandparent, +1 = child …
  row: number;         // posizione verticale nella generazione
  x: number;
  y: number;
  isRoot?: boolean;    // #ROOT#
  isSelf?: boolean;    // @SELF@
  isMarriage?: boolean; // [MATR-1775]
}

interface GenealogyTreeProps {
  persons: Record<string, TreePerson>;
  families?: Record<string, TreeFamily>;
  focusPersonId: string;
  /** 'ancestors' = mostra antenati (default) · 'descendants' = mostra discendenti */
  mode?: 'ancestors' | 'descendants' | 'both';
  maxGenerations?: number;
}

// ─── Costanti layout ─────────────────────────────────────────────────────────

const NODE_W = 140;
const NODE_H = 52;
const GEN_GAP = 180;   // distanza orizzontale tra generazioni
const ROW_GAP = 70;    // distanza verticale tra nodi nella stessa generazione

// ─── Helper: estrai anno da stringa data GEDCOM ───────────────────────────────

function extractYear(dateStr?: string): string {
  if (!dateStr) return '';
  const m = dateStr.match(/\d{4}/);
  return m ? m[0] : dateStr;
}

// ─── Costruisce struttura ad albero ──────────────────────────────────────────

function buildTree(
  persons: Record<string, TreePerson>,
  families: Record<string, TreeFamily>,
  focusId: string,
  mode: 'ancestors' | 'descendants' | 'both',
  maxGen: number
): TreeNode[] {
  const nodes: TreeNode[] = [];
  const visited = new Set<string>();

  // Mappa inversa: personId → famiglia come genitore (fams)
  const famsMap: Record<string, string[]> = {};
  for (const fam of Object.values(families)) {
    if (fam.husb) {
      if (!famsMap[fam.husb]) famsMap[fam.husb] = [];
      famsMap[fam.husb].push(fam.id);
    }
    if (fam.wife) {
      if (!famsMap[fam.wife]) famsMap[fam.wife] = [];
      famsMap[fam.wife].push(fam.id);
    }
  }

  // BFS verso antenati
  function addAncestors(personId: string, gen: number) {
    if (gen < -maxGen || visited.has(`A_${personId}`)) return;
    visited.add(`A_${personId}`);
    const p = persons[personId];
    if (!p) return;
    nodes.push({ person: p, generation: gen, row: 0, x: 0, y: 0 });
    if (p.famc && families[p.famc]) {
      const fam = families[p.famc];
      if (fam.husb) addAncestors(fam.husb, gen - 1);
      if (fam.wife) addAncestors(fam.wife, gen - 1);
    }
  }

  // BFS verso discendenti
  function addDescendants(personId: string, gen: number) {
    if (gen > maxGen || visited.has(`D_${personId}`)) return;
    visited.add(`D_${personId}`);
    const p = persons[personId];
    if (!p) return;
    nodes.push({ person: p, generation: gen, row: 0, x: 0, y: 0 });
    const famIds = famsMap[personId] || [];
    for (const famId of famIds) {
      const fam = families[famId];
      if (!fam) continue;
      // Aggiungi coniuge
      const spouseId = fam.husb === personId ? fam.wife : fam.husb;
      if (spouseId && !visited.has(`D_${spouseId}`)) {
        visited.add(`D_${spouseId}`);
        const sp = persons[spouseId];
        if (sp) nodes.push({ person: sp, generation: gen, row: 0, x: 0, y: 0 });
      }
      // Aggiungi figli
      for (const childId of (fam.chil || [])) {
        addDescendants(childId, gen + 1);
      }
    }
  }

  if (mode === 'ancestors' || mode === 'both') addAncestors(focusId, 0);
  if (mode === 'descendants') addDescendants(focusId, 0);
  if (mode === 'both') {
    // rimuovi il nodo focus duplicato
    const unique = new Map<string, TreeNode>();
    for (const n of nodes) unique.set(n.person.id, n);
    nodes.length = 0;
    nodes.push(...unique.values());
  }

  // ─── Calcola posizioni ───────────────────────────────────────────────────
  // Raggruppa per generazione
  const byGen: Record<number, TreeNode[]> = {};
  for (const n of nodes) {
    if (!byGen[n.generation]) byGen[n.generation] = [];
    byGen[n.generation].push(n);
  }

  // Normalizza generazioni: la più bassa diventa colonna 0
  const genValues = Object.keys(byGen).map(Number).sort((a, b) => a - b);
  const minGen = genValues[0] ?? 0;

  for (const gen of genValues) {
    const col = gen - minGen;
    const items = byGen[gen];
    const totalH = items.length * NODE_H + (items.length - 1) * (ROW_GAP - NODE_H);
    const startY = -totalH / 2;
    items.forEach((n, i) => {
      n.row = i;
      n.x = col * GEN_GAP;
      n.y = startY + i * ROW_GAP;
    });
  }

  // Marca speciali
  const focusNode = nodes.find(n => n.person.id === focusId);
  if (focusNode) focusNode.isSelf = true;

  // #ROOT#: persona senza famc (antenato più lontano)
  const rootNodes = nodes.filter(n => !n.person.famc);
  if (rootNodes.length > 0) {
    const earliest = rootNodes.reduce((a, b) =>
      (parseInt(extractYear(a.person.birth)) || 9999) <
      (parseInt(extractYear(b.person.birth)) || 9999) ? a : b
    );
    earliest.isRoot = true;
  }

  return nodes;
}

// ─── Calcola edges ────────────────────────────────────────────────────────────

interface Edge {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isMainLine: boolean;
}

function buildEdges(
  nodes: TreeNode[],
  families: Record<string, TreeFamily>,
  _persons: Record<string, TreePerson>
): Edge[] {
  const edges: Edge[] = [];
  const nodeMap = new Map(nodes.map(n => [n.person.id, n]));

  for (const n of nodes) {
    const p = n.person;
    if (!p.famc) continue;
    const fam = families[p.famc];
    if (!fam) continue;

    // Edge figlio ← padre
    if (fam.husb) {
      const parentNode = nodeMap.get(fam.husb);
      if (parentNode) {
        edges.push({
          from: { x: parentNode.x + NODE_W, y: parentNode.y + NODE_H / 2 },
          to: { x: n.x, y: n.y + NODE_H / 2 },
          isMainLine: parentNode.person.sex === 'M'
        });
      }
    }
    // Edge figlio ← madre
    if (fam.wife) {
      const parentNode = nodeMap.get(fam.wife);
      if (parentNode) {
        edges.push({
          from: { x: parentNode.x + NODE_W, y: parentNode.y + NODE_H / 2 },
          to: { x: n.x, y: n.y + NODE_H / 2 },
          isMainLine: false
        });
      }
    }
  }

  return edges;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export const GenealogyTree: React.FC<GenealogyTreeProps> = ({
  persons,
  families = {},
  focusPersonId,
  mode = 'ancestors',
  maxGenerations = 4,
}) => {
  const navigate = useNavigate();

  const nodes = useMemo(
    () => buildTree(persons, families, focusPersonId, mode, maxGenerations),
    [persons, families, focusPersonId, mode, maxGenerations]
  );

  const edges = useMemo(
    () => buildEdges(nodes, families, persons),
    [nodes, families, persons]
  );

  if (nodes.length === 0) {
    return (
      <div style={{ color: 'var(--alert-color)', padding: '20px' }}>
        ~GAP~ Nessun dato disponibile per l'albero genealogico.
      </div>
    );
  }

  // Bounding box per viewBox
  const xs = nodes.map(n => n.x);
  const ys = nodes.map(n => n.y);
  const minX = Math.min(...xs) - 20;
  const minY = Math.min(...ys) - 20;
  const maxX = Math.max(...xs) + NODE_W + 20;
  const maxY = Math.max(...ys) + NODE_H + 20;
  const vbW = maxX - minX;
  const vbH = maxY - minY;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`${minX} ${minY} ${vbW} ${vbH}`}
        width={Math.max(vbW, 300)}
        height={Math.max(vbH, 200)}
        style={{ display: 'block', fontFamily: 'inherit' }}
        aria-label="Albero genealogico"
      >
        {/* ── Sfondo generazioni (fasce colorate leggere) ── */}
        {Array.from(new Set(nodes.map(n => n.x))).map(x => (
          <rect
            key={`bg-${x}`}
            x={x - 10}
            y={minY}
            width={NODE_W + 20}
            height={vbH}
            fill="rgba(255,255,255,0.02)"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={0.5}
          />
        ))}

        {/* ── Edges ── */}
        {edges.map((e, i) => {
          const midX = (e.from.x + e.to.x) / 2;
          return (
            <path
              key={`edge-${i}`}
              d={`M ${e.from.x} ${e.from.y} C ${midX} ${e.from.y}, ${midX} ${e.to.y}, ${e.to.x} ${e.to.y}`}
              fill="none"
              stroke={e.isMainLine ? 'var(--accent-color)' : 'var(--secondary-color)'}
              strokeWidth={e.isMainLine ? 1.5 : 1}
              strokeOpacity={0.6}
            />
          );
        })}

        {/* ── Nodi ── */}
        {nodes.map(n => {
          const isSpecial = n.isRoot || n.isSelf;
          const accentColor = n.isSelf
            ? 'var(--accent-color)'
            : n.isRoot
              ? 'var(--hint-color)'
              : n.person.sex === 'M'
                ? 'var(--text-color)'
                : 'var(--secondary-color)';

          const birthY = extractYear(n.person.birth);
          const deathY = extractYear(n.person.death);
          const lifespan = birthY
            ? `${birthY}${deathY ? `–${deathY}` : '–'}`
            : '';

          const label = n.isRoot ? '#ROOT#' : n.isSelf ? '@SELF@' : '';

          return (
            <g
              key={n.person.id}
              transform={`translate(${n.x}, ${n.y})`}
              onClick={() => navigate(`/world/${n.person.id}/1_origini`)}
              style={{ cursor: 'pointer' }}
              role="button"
              aria-label={n.person.name}
            >
              {/* Box */}
              <rect
                width={NODE_W}
                height={NODE_H}
                rx={2}
                fill="var(--tile-bg, rgba(0,0,0,0.6))"
                stroke={accentColor}
                strokeWidth={isSpecial ? 2 : 1}
              />

              {/* Badge speciale */}
              {label && (
                <text
                  x={NODE_W / 2}
                  y={10}
                  textAnchor="middle"
                  fontSize={8}
                  fill={accentColor}
                  opacity={0.8}
                >
                  {label}
                </text>
              )}

              {/* Nome proprio (senza cognome) */}
              {(() => {
                const given = n.person.surname
                  ? n.person.name.replace(n.person.surname, '').trim() || n.person.name
                  : n.person.name;
                return (
                  <text
                    x={NODE_W / 2}
                    y={label ? 26 : 22}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={isSpecial ? 'bold' : 'normal'}
                    fill={accentColor}
                  >
                    {given.length > 16 ? given.slice(0, 15) + '…' : given}
                  </text>
                );
              })()}

              {/* Cognome */}
              <text
                x={NODE_W / 2}
                y={label ? 37 : 34}
                textAnchor="middle"
                fontSize={10}
                fill="var(--text-color)"
                opacity={0.8}
              >
                {n.person.surname}
              </text>

              {/* Anni */}
              {lifespan && (
                <text
                  x={NODE_W / 2}
                  y={label ? 48 : 46}
                  textAnchor="middle"
                  fontSize={9}
                  fill="var(--secondary-color)"
                  opacity={0.7}
                >
                  {lifespan}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legenda */}
      <div style={{
        display: 'flex', gap: '20px', marginTop: '10px',
        fontSize: '0.75rem', color: 'var(--secondary-color)'
      }}>
        <span><span style={{ color: 'var(--hint-color)' }}>■</span> #ROOT# Pietro ~1500</span>
        <span><span style={{ color: 'var(--accent-color)' }}>■</span> @SELF@ nodo focus</span>
        <span><span style={{ color: 'var(--text-color)' }}>■</span> Maschio</span>
        <span><span style={{ color: 'var(--secondary-color)' }}>■</span> Femmina</span>
      </div>
    </div>
  );
};
