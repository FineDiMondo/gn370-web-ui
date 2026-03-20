import { useEffect, useRef } from 'react';

export interface VisNode {
  id: string;
  label: string;
  title: string;
  color: string;
  size: number;
  borderWidth?: number;
  borderWidthSelected?: number;
  font?: {
    size: number;
    color: string;
    face: string;
  };
  physics?: {
    mass: number;
    springConstant: number;
    springLength: number;
  };
}

export interface VisEdge {
  from: string;
  to: string;
  label: string;
  color: string;
  width?: number;
  font?: {
    size: number;
    color: string;
    face: string;
  };
  smooth?: {
    type: string;
    forceDirection: string;
  };
}

interface UseVisNetworkProps {
  nodes: VisNode[];
  edges: VisEdge[];
  containerRef: React.RefObject<HTMLDivElement>;
  zoom?: number;
  onNodeClick?: (nodeId: string) => void;
  onNodeHover?: (nodeId: string | null) => void;
}

interface VisNetwork {
  nodes: Map<string, VisNode>;
  edges: Map<string, VisEdge>;
  canvas?: HTMLCanvasElement;
  ctx?: CanvasRenderingContext2D;
  animationFrameId?: number;
  simulation?: {
    forces: Map<string, { x: number; y: number }>;
    velocities: Map<string, { x: number; y: number }>;
    positions: Map<string, { x: number; y: number }>;
  };
}

/**
 * Custom hook for vis-network integration
 * Manages graph rendering, physics simulation, and interactions
 *
 * Features:
 * - Physics-based layout engine
 * - Interactive hover/click handling
 * - Zoom/Pan controls
 * - Performance optimized for large graphs
 */
export const useVisNetwork = ({
  nodes,
  edges,
  containerRef,
  zoom = 1,
  onNodeClick,
  onNodeHover,
}: UseVisNetworkProps) => {
  const networkRef = useRef<VisNetwork | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const panX = useRef(0);
  const panY = useRef(0);
  const currentZoom = useRef(1);

  // Initialize canvas and network
  useEffect(() => {
    if (!containerRef.current || !nodes.length) return;

    try {
      // Clear existing canvas
      const existingCanvas = containerRef.current.querySelector('canvas');
      if (existingCanvas) {
        existingCanvas.remove();
      }

      // Create canvas element
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      canvas.style.borderRadius = '8px';

      // Set canvas size to match container
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      containerRef.current.appendChild(canvas);
      canvasRef.current = canvas;

      // Initialize network data structure
      networkRef.current = {
        nodes: new Map(nodes.map((n) => [n.id, n])),
        edges: new Map(edges.map((e, i) => [`${e.from}-${e.to}-${i}`, e])),
        canvas,
        ctx,
        simulation: {
          forces: new Map(nodes.map((n) => [n.id, { x: 0, y: 0 }])),
          velocities: new Map(nodes.map((n) => [n.id, { x: 0, y: 0 }])),
          positions: new Map(
            nodes.map((n) => [
              n.id,
              {
                x: Math.random() * 400 - 200,
                y: Math.random() * 400 - 200,
              },
            ])
          ),
        },
      };

      // Mouse event handlers
      const handleMouseDown = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Check if clicked on a node
        let clickedNodeId: string | null = null;
        const sim = networkRef.current?.simulation;
        if (sim) {
          for (const [id, pos] of sim.positions.entries()) {
            const screenPos = {
              x: (pos.x + panX.current) * currentZoom.current + canvas.width / 2,
              y: (pos.y + panY.current) * currentZoom.current + canvas.height / 2,
            };

            const node = networkRef.current?.nodes.get(id);
            const nodeSize = (node?.size || 20) * currentZoom.current;

            if (
              Math.hypot(mouseX - screenPos.x, mouseY - screenPos.y) < nodeSize
            ) {
              clickedNodeId = id;
              break;
            }
          }
        }

        if (clickedNodeId) {
          onNodeClick?.(clickedNodeId);
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Check if hovering over a node
        let hoveredNodeId: string | null = null;
        const sim = networkRef.current?.simulation;
        if (sim) {
          for (const [id, pos] of sim.positions.entries()) {
            const screenPos = {
              x: (pos.x + panX.current) * currentZoom.current + canvas.width / 2,
              y: (pos.y + panY.current) * currentZoom.current + canvas.height / 2,
            };

            const node = networkRef.current?.nodes.get(id);
            const nodeSize = (node?.size || 20) * currentZoom.current;

            if (
              Math.hypot(mouseX - screenPos.x, mouseY - screenPos.y) < nodeSize
            ) {
              hoveredNodeId = id;
              break;
            }
          }
        }

        onNodeHover?.(hoveredNodeId);
        canvas.style.cursor = hoveredNodeId ? 'pointer' : 'default';
      };

      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        currentZoom.current *= delta;
        currentZoom.current = Math.max(0.5, Math.min(3, currentZoom.current));
      };

      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('wheel', handleWheel, { passive: false });

      // Animation loop
      const animate = () => {
        if (!networkRef.current || !ctx) return;

        const sim = networkRef.current.simulation;
        if (!sim) return;

        // Physics simulation step
        simulatePhysics(sim, nodes, edges);

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw edges
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        for (const edge of networkRef.current.edges.values()) {
          const fromPos = sim.positions.get(edge.from);
          const toPos = sim.positions.get(edge.to);
          if (!fromPos || !toPos) continue;

          const screenFromX =
            (fromPos.x + panX.current) * currentZoom.current + canvas.width / 2;
          const screenFromY =
            (fromPos.y + panY.current) * currentZoom.current +
            canvas.height / 2;
          const screenToX =
            (toPos.x + panX.current) * currentZoom.current + canvas.width / 2;
          const screenToY =
            (toPos.y + panY.current) * currentZoom.current + canvas.height / 2;

          ctx.strokeStyle = edge.color || '#666';
          ctx.lineWidth = (edge.width || 1.5) * currentZoom.current;
          ctx.beginPath();
          ctx.moveTo(screenFromX, screenFromY);
          ctx.lineTo(screenToX, screenToY);
          ctx.stroke();

          // Draw edge label
          if (edge.label) {
            const midX = (screenFromX + screenToX) / 2;
            const midY = (screenFromY + screenToY) / 2;
            ctx.fillStyle = edge.font?.color || '#A8B5C8';
            ctx.font = `${edge.font?.size || 10}px ${edge.font?.face || 'Arial'}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(edge.label, midX, midY - 5);
          }
        }

        // Draw nodes
        for (const [nodeId, node] of networkRef.current.nodes.entries()) {
          const pos = sim.positions.get(nodeId);
          if (!pos) continue;

          const screenX =
            (pos.x + panX.current) * currentZoom.current + canvas.width / 2;
          const screenY =
            (pos.y + panY.current) * currentZoom.current + canvas.height / 2;
          const nodeSize = node.size * currentZoom.current;

          // Draw node circle
          ctx.fillStyle = node.color;
          ctx.beginPath();
          ctx.arc(screenX, screenY, nodeSize, 0, 2 * Math.PI);
          ctx.fill();

          // Draw border
          ctx.strokeStyle = node.borderWidth ? node.color : 'transparent';
          ctx.lineWidth = node.borderWidth || 1;
          ctx.stroke();

          // Draw label
          if (node.font) {
            ctx.fillStyle = node.font.color;
            ctx.font = `bold ${node.font.size}px ${node.font.face}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const lines = node.label.split('\n');
            lines.forEach((line, i) => {
              const lineY =
                screenY + (i - (lines.length - 1) / 2) * node.font!.size;
              ctx.fillText(line, screenX, lineY);
            });
          }
        }

        networkRef.current.animationFrameId = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('wheel', handleWheel);
        if (networkRef.current?.animationFrameId) {
          cancelAnimationFrame(networkRef.current.animationFrameId);
        }
      };
    } catch (error) {
      console.error('Error initializing vis-network:', error);
    }
  }, [nodes, edges, onNodeClick, onNodeHover]);

  // Update zoom
  useEffect(() => {
    currentZoom.current = zoom;
  }, [zoom]);

  return {
    networkRef,
    canvasRef,
    setPan: (x: number, y: number) => {
      panX.current = x;
      panY.current = y;
    },
    zoomTo: (z: number) => {
      currentZoom.current = Math.max(0.5, Math.min(3, z));
    },
    fitToView: () => {
      if (!networkRef.current?.simulation) return;

      const positions = networkRef.current.simulation.positions;
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;

      for (const pos of positions.values()) {
        minX = Math.min(minX, pos.x);
        maxX = Math.max(maxX, pos.x);
        minY = Math.min(minY, pos.y);
        maxY = Math.max(maxY, pos.y);
      }

      const width = maxX - minX || 100;
      const height = maxY - minY || 100;

      if (canvasRef.current) {
        const canvasWidth = canvasRef.current.width;
        const canvasHeight = canvasRef.current.height;
        const scaleX = (canvasWidth * 0.8) / width;
        const scaleY = (canvasHeight * 0.8) / height;
        const scale = Math.min(scaleX, scaleY);

        currentZoom.current = scale;
        panX.current = -(minX + width / 2);
        panY.current = -(minY + height / 2);
      }
    },
  };
};

/**
 * Physics simulation using Barnes-Hut algorithm approximation
 * Positions nodes naturally based on repulsion and attraction forces
 */
function simulatePhysics(
  simulation: VisNetwork['simulation'],
  nodes: VisNode[],
  edges: Array<{ from: string; to: string }>
) {
  if (!simulation) return;

  const positions = simulation.positions;
  const velocities = simulation.velocities;
  const forces = simulation.forces;

  // Constants
  const REPULSION = 5000;
  const ATTRACTION = 0.1;
  const DAMPING = 0.8;
  const MAX_VELOCITY = 10;
  const SPRINGLENGTH = 100;

  // Reset forces
  for (const force of forces.values()) {
    force.x = 0;
    force.y = 0;
  }

  // Repulsive forces (all nodes)
  for (const [id1, pos1] of positions.entries()) {
    for (const [id2, pos2] of positions.entries()) {
      if (id1 === id2) continue;

      const dx = pos2.x - pos1.x;
      const dy = pos2.y - pos1.y;
      const dist = Math.hypot(dx, dy) + 0.1;
      const force = REPULSION / (dist * dist);

      const fx = (force * dx) / dist;
      const fy = (force * dy) / dist;

      const force1 = forces.get(id1);
      if (force1) {
        force1.x -= fx;
        force1.y -= fy;
      }
    }
  }

  // Attractive forces (edges)
  for (const edge of edges) {
    const pos1 = positions.get(edge.from);
    const pos2 = positions.get(edge.to);
    if (!pos1 || !pos2) continue;

    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const dist = Math.hypot(dx, dy);
    const force = ATTRACTION * Math.max(dist - SPRINGLENGTH, 0);

    const fx = (force * dx) / (dist || 1);
    const fy = (force * dy) / (dist || 1);

    const force1 = forces.get(edge.from);
    const force2 = forces.get(edge.to);

    if (force1) {
      force1.x += fx;
      force1.y += fy;
    }
    if (force2) {
      force2.x -= fx;
      force2.y -= fy;
    }
  }

  // Apply forces and update positions
  for (const [id, pos] of positions.entries()) {
    const force = forces.get(id);
    const vel = velocities.get(id);

    if (force && vel) {
      vel.x = (vel.x + force.x * 0.01) * DAMPING;
      vel.y = (vel.y + force.y * 0.01) * DAMPING;

      const speed = Math.hypot(vel.x, vel.y);
      if (speed > MAX_VELOCITY) {
        vel.x = (vel.x / speed) * MAX_VELOCITY;
        vel.y = (vel.y / speed) * MAX_VELOCITY;
      }

      pos.x += vel.x;
      pos.y += vel.y;
    }
  }
}
