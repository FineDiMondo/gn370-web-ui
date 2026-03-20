import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import './FamilyTreeViewer.module.css';

export interface FamilyTreePerson {
  id: string;
  name: string;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  occupation?: string;
  gender?: 'M' | 'F' | 'U';
  parents?: FamilyTreePerson[];
  children?: FamilyTreePerson[];
  spouse?: FamilyTreePerson;
}

export interface FamilyTreeViewerProps {
  rootPerson: FamilyTreePerson;
  onPersonClick?: (personId: string) => void;
  selectedPersonId?: string;
  showLabels?: boolean;
  maxGenerations?: number;
}

interface TreeNode {
  person: FamilyTreePerson;
  x: number;
  y: number;
  generation: number;
  isSelected?: boolean;
}

const GENERATION_HEIGHT = 150;
const NODE_WIDTH = 140;
const NODE_HEIGHT = 80;
const HORIZONTAL_SPACING = 200;

export const FamilyTreeViewer: React.FC<FamilyTreeViewerProps> = ({
  rootPerson,
  onPersonClick,
  selectedPersonId,
  showLabels = true,
  maxGenerations = 5
}) => {
  const [zoom, setZoom] = useState(1);

  const treeLayout = useMemo(() => {
    const nodes: TreeNode[] = [];
    const visited = new Set<string>();

    const processGeneration = (people: FamilyTreePerson[], generation: number) => {
      if (generation > maxGenerations || people.length === 0) return;
      const generationWidth = people.length * HORIZONTAL_SPACING;
      const startX = -generationWidth / 2;

      people.forEach((person, index) => {
        if (visited.has(person.id)) return;
        visited.add(person.id);
        const x = startX + index * HORIZONTAL_SPACING;
        const y = generation * GENERATION_HEIGHT;
        nodes.push({ person, x, y, generation, isSelected: person.id === selectedPersonId });
      });
    };

    const ancestors: FamilyTreePerson[] = [];
    let current: FamilyTreePerson | undefined = rootPerson;
    let ancestorGen = 0;

    while (current && ancestorGen < maxGenerations) {
      ancestors.unshift(current);
      current = current.parents?.[0];
      ancestorGen++;
    }

    const ancestorsToProcess = [...ancestors].reverse();
    ancestorsToProcess.forEach((person, index) => {
      processGeneration([person], index);
    });

    const descendants: FamilyTreePerson[] = [rootPerson];
    for (let gen = 1; gen < maxGenerations - ancestorGen; gen++) {
      const nextGen: FamilyTreePerson[] = [];
      descendants.forEach(person => {
        if (person.children) nextGen.push(...person.children);
      });
      if (nextGen.length === 0) break;
      processGeneration(nextGen, ancestorGen + gen);
      descendants.push(...nextGen);
    }
    return nodes;
  }, [rootPerson, selectedPersonId, maxGenerations]);

  const connections = useMemo(() => {
    const lines: Array<{ x1: number; y1: number; x2: number; y2: number; type: string }> = [];
    treeLayout.forEach(node => {
      if (node.person.parents) {
        node.person.parents.forEach(parent => {
          const parentNode = treeLayout.find(n => n.person.id === parent.id);
          if (parentNode) {
            lines.push({ x1: node.x, y1: node.y, x2: parentNode.x, y2: parentNode.y + NODE_HEIGHT, type: 'parent' });
          }
        });
      }
      if (node.person.spouse) {
        const spouseNode = treeLayout.find(n => n.person.id === node.person.spouse?.id);
        if (spouseNode) {
          lines.push({ x1: node.x + NODE_WIDTH, y1: node.y + NODE_HEIGHT / 2, x2: spouseNode.x, y2: spouseNode.y + NODE_HEIGHT / 2, type: 'spouse' });
        }
      }
    });
    return lines;
  }, [treeLayout]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPersonId) return;
      const currentNode = treeLayout.find(n => n.person.id === selectedPersonId);
      if (!currentNode) return;
      let targetPerson: FamilyTreePerson | undefined;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        targetPerson = currentNode.person.parents?.[0];
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        targetPerson = currentNode.person.children?.[0];
      }
      if (targetPerson && onPersonClick) onPersonClick(targetPerson.id);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPersonId, treeLayout, onPersonClick]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.5, Math.min(3, z * (e.deltaY > 0 ? 0.9 : 1.1))));
  }, []);

  const handleResetView = useCallback(() => {
    setZoom(1);
  }, []);

  const bounds = useMemo(() => {
    if (treeLayout.length === 0) return { minX: 0, maxX: 800, minY: 0, maxY: 600 };
    const xs = treeLayout.map(n => n.x);
    const ys = treeLayout.map(n => n.y);
    return {
      minX: Math.min(...xs) - NODE_WIDTH / 2 - 50,
      maxX: Math.max(...xs) + NODE_WIDTH / 2 + 50,
      minY: Math.min(...ys) - 50,
      maxY: Math.max(...ys) + NODE_HEIGHT + 50
    };
  }, [treeLayout]);

  const viewBoxWidth = bounds.maxX - bounds.minX;
  const viewBoxHeight = bounds.maxY - bounds.minY;

  return (
    <div className="family-tree-viewer">
      <div className="family-tree-controls" role="toolbar" aria-label="Tree controls">
        <button className="tree-control-btn" onClick={() => setZoom(z => Math.min(3, z * 1.2))} aria-label="Zoom in">
          <ZoomIn size={20} />
        </button>
        <span className="zoom-level">{Math.round(zoom * 100)}%</span>
        <button className="tree-control-btn" onClick={() => setZoom(z => Math.max(0.5, z * 0.833))} aria-label="Zoom out">
          <ZoomOut size={20} />
        </button>
        <div className="control-divider" />
        <button className="tree-control-btn" onClick={handleResetView} aria-label="Reset view">
          <RotateCcw size={20} />
        </button>
      </div>
      <svg
        className="family-tree-svg"
        viewBox={`${bounds.minX} ${bounds.minY} ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="xMidYMid meet"
        onWheel={handleWheel}
        role="img"
        aria-label="Family tree visualization"
      >
        <g className="tree-connections" role="presentation">
          {connections.map((line, idx) => (
            <line key={`line-${idx}`} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} className={`tree-line tree-line-${line.type}`} strokeWidth={2} />
          ))}
        </g>
        <g className="tree-nodes" role="list">
          {treeLayout.map(node => (
            <g key={node.person.id} role="listitem">
              <rect
                className={`tree-node ${node.isSelected ? 'selected' : ''}`}
                x={node.x - NODE_WIDTH / 2}
                y={node.y}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx={8}
                onClick={() => onPersonClick?.(node.person.id)}
                role="button"
                tabIndex={0}
                aria-label={node.person.name}
                aria-selected={node.isSelected}
              />
              {showLabels && (
                <>
                  <text className="tree-node-name" x={node.x} y={node.y + 28} textAnchor="middle" pointerEvents="none">{node.person.name}</text>
                  {node.person.birthDate && <text className="tree-node-info" x={node.x} y={node.y + 50} textAnchor="middle" pointerEvents="none">{node.person.birthDate.substring(0, 4)}</text>}
                </>
              )}
            </g>
          ))}
        </g>
      </svg>
      <div className="tree-instructions">
        <p>Scroll to zoom ▶ Arrow keys to navigate ▶ Click to select</p>
      </div>
    </div>
  );
};
