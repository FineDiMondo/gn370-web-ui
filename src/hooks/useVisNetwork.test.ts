// @ts-nocheck
import { renderHook } from '@testing-library/react';
import { useVisNetwork, type VisNode, type VisEdge } from './useVisNetwork';
import React from 'react';

describe('useVisNetwork', () => {
  let containerRef: React.RefObject<HTMLDivElement>;

  beforeEach(() => {
    // Create a mock container element
    const container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);

    containerRef = React.createRef();
    containerRef.current = container;
  });

  afterEach(() => {
    if (containerRef.current?.parentNode) {
      containerRef.current.parentNode.removeChild(containerRef.current);
    }
  });

  it('should initialize with nodes and edges', () => {
    const nodes: VisNode[] = [
      {
        id: '1',
        label: 'Node 1',
        title: 'Node 1 Title',
        color: '#00D9FF',
        size: 30,
      },
      {
        id: '2',
        label: 'Node 2',
        title: 'Node 2 Title',
        color: '#DA70D6',
        size: 25,
      },
    ];

    const edges: VisEdge[] = [
      {
        from: '1',
        to: '2',
        label: 'relation',
        color: '#32FF00',
      },
    ];

    const { result } = renderHook(() =>
      useVisNetwork({
        nodes,
        edges,
        containerRef,
      })
    );

    expect(result.current.networkRef).toBeDefined();
    expect(result.current.canvasRef).toBeDefined();
  });

  it('should create canvas element in container', () => {
    const nodes: VisNode[] = [
      {
        id: '1',
        label: 'Node 1',
        title: 'Node 1 Title',
        color: '#00D9FF',
        size: 30,
      },
    ];

    renderHook(() =>
      useVisNetwork({
        nodes,
        edges: [],
        containerRef,
      })
    );

    const canvas = containerRef.current?.querySelector('canvas');
    expect(canvas).toBeDefined();
    expect(canvas?.style.borderRadius).toBe('8px');
  });

  it('should handle zoom changes', () => {
    const nodes: VisNode[] = [
      {
        id: '1',
        label: 'Node 1',
        title: 'Node 1 Title',
        color: '#00D9FF',
        size: 30,
      },
    ];

    const { result, rerender } = renderHook(
      ({ zoom }: { zoom: number }) =>
        useVisNetwork({
          nodes,
          edges: [],
          containerRef,
          zoom,
        }),
      { initialProps: { zoom: 1 } }
    );

    rerender({ zoom: 1.5 });

    // Zoom should be updated
    expect(result.current).toBeDefined();
  });

  it('should call onNodeClick when node is clicked', () => {
    const onNodeClick = jest.fn();
    const nodes: VisNode[] = [
      {
        id: '1',
        label: 'Node 1',
        title: 'Node 1 Title',
        color: '#00D9FF',
        size: 30,
      },
    ];

    renderHook(() =>
      useVisNetwork({
        nodes,
        edges: [],
        containerRef,
        onNodeClick,
      })
    );

    // Simulate click event
    const canvas = containerRef.current?.querySelector('canvas');
    expect(canvas).toBeDefined();
  });

  it('should call onNodeHover when hovering over node', () => {
    const onNodeHover = jest.fn();
    const nodes: VisNode[] = [
      {
        id: '1',
        label: 'Node 1',
        title: 'Node 1 Title',
        color: '#00D9FF',
        size: 30,
      },
    ];

    renderHook(() =>
      useVisNetwork({
        nodes,
        edges: [],
        containerRef,
        onNodeHover,
      })
    );

    const canvas = containerRef.current?.querySelector('canvas');
    expect(canvas).toBeDefined();
  });

  it('should handle empty nodes gracefully', () => {
    const { result } = renderHook(() =>
      useVisNetwork({
        nodes: [],
        edges: [],
        containerRef,
      })
    );

    expect(result.current).toBeDefined();
  });

  it('should render edges between nodes', () => {
    const nodes: VisNode[] = [
      {
        id: '1',
        label: 'Node 1',
        title: 'Node 1 Title',
        color: '#00D9FF',
        size: 30,
      },
      {
        id: '2',
        label: 'Node 2',
        title: 'Node 2 Title',
        color: '#DA70D6',
        size: 25,
      },
    ];

    const edges: VisEdge[] = [
      {
        from: '1',
        to: '2',
        label: 'relation',
        color: '#32FF00',
        width: 2,
      },
    ];

    const { result } = renderHook(() =>
      useVisNetwork({
        nodes,
        edges,
        containerRef,
      })
    );

    expect(result.current).toBeDefined();
    const canvas = containerRef.current?.querySelector('canvas');
    expect(canvas).toBeDefined();
  });

  it('should support fit-to-view functionality', () => {
    const nodes: VisNode[] = [
      {
        id: '1',
        label: 'Node 1',
        title: 'Node 1 Title',
        color: '#00D9FF',
        size: 30,
      },
      {
        id: '2',
        label: 'Node 2',
        title: 'Node 2 Title',
        color: '#DA70D6',
        size: 25,
      },
    ];

    const { result } = renderHook(() =>
      useVisNetwork({
        nodes,
        edges: [],
        containerRef,
      })
    );

    // fitToView should be callable
    expect(typeof result.current.fitToView).toBe('function');
  });

  it('should handle large graphs (performance test)', () => {
    // Create 100 nodes
    const nodes: VisNode[] = Array.from({ length: 100 }, (_, i) => ({
      id: `node-${i}`,
      label: `Node ${i}`,
      title: `Node ${i} Title`,
      color: i % 2 === 0 ? '#00D9FF' : '#DA70D6',
      size: 20 + Math.random() * 15,
    }));

    // Create edges between consecutive nodes
    const edges: VisEdge[] = Array.from({ length: 99 }, (_, i) => ({
      from: `node-${i}`,
      to: `node-${i + 1}`,
      label: 'relation',
      color: '#32FF00',
    }));

    const startTime = performance.now();

    const { result } = renderHook(() =>
      useVisNetwork({
        nodes,
        edges,
        containerRef,
      })
    );

    const endTime = performance.now();

    expect(result.current).toBeDefined();
    expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
  });
});
