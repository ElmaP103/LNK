import React, { useCallback, forwardRef, useEffect, useRef } from 'react';
import ForceGraph2D, { ForceGraphMethods, NodeObject, LinkObject } from 'react-force-graph-2d';
import { GraphData, Node, Edge } from '../../../../types/global';
import { GRAPH_CONFIG } from '../../../../core/config/constants';
import styled from 'styled-components';

const GraphContainer = styled.div`
  width: 100%;
  height: 100%;
  background: #1a1a1a;
`;

interface NetworkGraphProps {
  data: GraphData;
  onNodeClick?: (node: Node) => void;
  onNodeHover?: (node: Node | null) => void;
  onEdgeHover?: (edge: Edge | null) => void;
  onEdgeClick?: (edge: Edge) => void;
  selectedNodeId?: string;
  selectedEdge?: Edge | null;
  isPhysicsEnabled: boolean;
  showLabels: boolean;
  onNodeHoverTooltip?: (node: Node | null, pos: {x: number, y: number} | null) => void;
  showConnections?: boolean;
  showMyConnectionsOnMap?: boolean;
  width?: number;
  height?: number;
}

interface ExtendedNode extends Node {
  x?: number;
  y?: number;
}

type GraphEdge = Edge & {
  source: string | Node;
  target: string | Node;
};

type ForceGraphData = {
  nodes: NodeObject<Node>[];
  links: LinkObject<Node, Edge>[];
};

// TypeScript: declare avatar cache and tooltip on window
declare global {
  interface Window {
    __avatarCache?: Record<string, HTMLImageElement>;
    __nodeTooltip?: { name: string; x: number; y: number } | null;
  }
}

export const NetworkGraph = forwardRef<ForceGraphMethods<NodeObject<Node>, LinkObject<Node, Edge>>, NetworkGraphProps>(({
  data,
  onNodeClick,
  onNodeHover,
  onEdgeHover,
  onEdgeClick,
  selectedNodeId,
  selectedEdge,
  isPhysicsEnabled,
  showLabels,
  onNodeHoverTooltip,
  showConnections,
  showMyConnectionsOnMap,
  width,
  height
}, ref) => {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter out non-person nodes and their connections
  const filteredData = React.useMemo<ForceGraphData>(() => {
    const personNodes = data.nodes.filter(node => node.type === 'Researcher');
    const personNodeIds = new Set(personNodes.map(node => node.id));
    const filteredLinks = data.links.filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as Node).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as Node).id;
      return personNodeIds.has(sourceId) && personNodeIds.has(targetId);
    });
    return {
      nodes: personNodes.map(node => ({ ...node, __forceGraph: true })) as NodeObject<Node>[],
      links: filteredLinks as LinkObject<Node, Edge>[]
    };
  }, [data]);

  // Center and zoom on selected node or edge
  useEffect(() => {
    if (selectedNodeId && ref && 'current' in ref && ref.current) {
      const selectedNode = filteredData.nodes.find(node => node.id === selectedNodeId) as ExtendedNode;
      if (selectedNode && selectedNode.x !== undefined && selectedNode.y !== undefined) {
        ref.current.centerAt(selectedNode.x, selectedNode.y, 1000);
        ref.current.zoom(2, 1000); // Zoom in on node
      }
    }
  }, [selectedNodeId, filteredData.nodes, ref]);

  useEffect(() => {
    if (selectedEdge && ref && 'current' in ref && ref.current) {
      // Center and zoom on the midpoint of the edge
      const source = typeof selectedEdge.source === 'string'
        ? filteredData.nodes.find(n => n.id === selectedEdge.source)
        : selectedEdge.source as ExtendedNode;
      const target = typeof selectedEdge.target === 'string'
        ? filteredData.nodes.find(n => n.id === selectedEdge.target)
        : selectedEdge.target as ExtendedNode;
      
      if (source && target && source.x !== undefined && source.y !== undefined && target.x !== undefined && target.y !== undefined) {
        // Calculate midpoint
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        
        // Calculate distance between nodes
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate zoom level to fit both nodes in view
        // Adjust these values to control the zoom level
        const minZoom = 0.5;
        const maxZoom = 2;
        const zoomLevel = Math.min(maxZoom, Math.max(minZoom, 1.5 * (400 / distance)));
        
        // Center on midpoint with animation
        ref.current.centerAt(midX, midY, 1000);
        
        // Apply zoom with animation
        const graphRef = ref.current;
        setTimeout(() => {
          if (graphRef) {
            graphRef.zoom(zoomLevel, 1000);
          }
        }, 100);
      }
    }
  }, [selectedEdge, filteredData.nodes, ref]);

  // Apply force settings for better spacing
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-1200);
      fgRef.current.d3Force('link').distance(260);
    }
  }, [filteredData]);

  const handleNodeClick = useCallback((node: Node) => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  }, [onNodeClick]);

  const handleNodeHover = useCallback((node: NodeObject<Node> | null, previousNode: NodeObject<Node> | null) => {
    if (node) {

       if (onNodeHoverTooltip) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect && fgRef.current) {
          const { x, y } = fgRef.current.graph2ScreenCoords((node as any).x, (node as any).y);
          onNodeHoverTooltip(node as Node, { x: rect.left + x, y: rect.top + y });
        }
      }
    } else {
      if (onNodeHoverTooltip) {
        onNodeHoverTooltip(null, null);
      }
    }
    if (onNodeHover) {
      onNodeHover(node as Node | null);
    }
  }, [onNodeHover, onNodeHoverTooltip]);

  const handleEdgeHover = useCallback((edge: Edge | null) => {
    if (onEdgeHover) {
      onEdgeHover(edge);
    }
  }, [onEdgeHover]);

  const handleEdgeClick = useCallback((edge: Edge) => {
    if (onEdgeClick) {
      onEdgeClick(edge);
    }
  }, [onEdgeClick]);

  // Custom link label to show connection details
  const linkLabel = useCallback((link: GraphEdge) => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as Node).id;
    const targetId = typeof link.target === 'string' ? link.target : (link.target as Node).id;
    const sourceNode = filteredData.nodes.find(n => n.id === sourceId);
    const targetNode = filteredData.nodes.find(n => n.id === targetId);
    if (!sourceNode || !targetNode) return '';
    let connectionDetails = '';
    switch (link.type) {
      case 'coauthor':
        connectionDetails = `Co-authored ${link.data.publications?.length || 0} publications`;
        break;
      case 'researcher':
        connectionDetails = `Worked together at ${link.data.sharedAffiliations?.[0] || 'same organization'}`;
        break;
      case 'publisher':
        connectionDetails = `Published in ${link.data.sharedAffiliations?.[0] || 'same journal'}`;
        break;
      default:
        connectionDetails = 'Connected';
    }
    return `${sourceNode.data.name} and ${targetNode.data.name}: ${connectionDetails}`;
  }, [filteredData.nodes]);

  return (
    <GraphContainer ref={containerRef}>
      <ForceGraph2D
        ref={((node: ForceGraphMethods<any, any> | null) => {
          fgRef.current = node;
          if (typeof ref === 'function') ref(node as any);
          else if (ref && typeof ref === 'object') (ref as any).current = node;
        }) as any}
        graphData={filteredData as any}
        nodeLabel={(node: Node) => ''}
        nodeColor={(node: Node) =>
          node.id === selectedNodeId ? '#2979FF' : GRAPH_CONFIG.NODE_COLORS[node.type]
        }
        nodeVal={(node: Node) =>
          node.id === selectedNodeId ? 12 : 6
        }
        nodeCanvasObject={(node: Node, ctx, globalScale) => {
          // Draw avatar as a circle image
          const size = node.id === selectedNodeId ? 44 : 32;
          const x = (node as any).x || 0;
          const y = (node as any).y || 0;
          const avatarUrl = node.data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(node.data.name)}&background=4F8EF7&color=fff&size=128&rounded=true`;
          if (!window.__avatarCache) window.__avatarCache = {};
          const cache = window.__avatarCache;
          let img = cache[avatarUrl];
          if (!img) {
            img = new window.Image();
            img.src = avatarUrl;
            cache[avatarUrl] = img;
          }
          if (img.complete) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, size / 2, 0, 2 * Math.PI, false);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
            ctx.restore();
          } else {
            // fallback: draw a circle
            ctx.beginPath();
            ctx.arc(x, y, size / 2, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.id === selectedNodeId ? '#2979FF' : GRAPH_CONFIG.NODE_COLORS[node.type];
            ctx.fill();
            ctx.closePath();
          }
          // Optionally, draw a border for selected node
          if (node.id === selectedNodeId) {
            ctx.beginPath();
            ctx.arc(x, y, size / 2 + 2, 0, 2 * Math.PI, false);
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.closePath();
          }
        }}
        nodePointerAreaPaint={(node: Node, color, ctx) => {
          // Make the pointer area match the avatar circle
          const size = node.id === selectedNodeId ? 44 : 32;
          ctx.beginPath();
          ctx.arc((node as any).x || 0, (node as any).y || 0, size / 2, 0, 2 * Math.PI, false);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.closePath();
        }}
        linkColor={(link: GraphEdge) => {
          // Highlight selected edge
          if (selectedEdge) {
            const selSource = typeof selectedEdge.source === 'string' ? selectedEdge.source : selectedEdge.source.id;
            const selTarget = typeof selectedEdge.target === 'string' ? selectedEdge.target : selectedEdge.target.id;
            const linkSource = typeof link.source === 'string' ? link.source : (link.source as Node).id;
            const linkTarget = typeof link.target === 'string' ? link.target : (link.target as Node).id;
            if (
              (linkSource === selSource && linkTarget === selTarget) ||
              (linkSource === selTarget && linkTarget === selSource)
            ) {
              return '#FFD700'; // Highlight color
            }
          }
          // Highlight edges connected to selected node
          if (selectedNodeId) {
            const sourceId = typeof link.source === 'string' ? link.source : (link.source as Node).id;
            const targetId = typeof link.target === 'string' ? link.target : (link.target as Node).id;
            if (sourceId === selectedNodeId || targetId === selectedNodeId) {
              return '#FFD700';
            }
          }
          return GRAPH_CONFIG.EDGE_COLORS[link.type];
        }}
        linkWidth={(link: GraphEdge) => {
          // Highlight selected edge
          if (selectedEdge) {
            const selSource = typeof selectedEdge.source === 'string' ? selectedEdge.source : selectedEdge.source.id;
            const selTarget = typeof selectedEdge.target === 'string' ? selectedEdge.target : selectedEdge.target.id;
            const linkSource = typeof link.source === 'string' ? link.source : (link.source as Node).id;
            const linkTarget = typeof link.target === 'string' ? link.target : (link.target as Node).id;
            if (
              (linkSource === selSource && linkTarget === selTarget) ||
              (linkSource === selTarget && linkTarget === selSource)
            ) {
              return 4; // Thicker width for selected edge
            }
          }
          // Highlight edges connected to selected node
          if (selectedNodeId) {
            const sourceId = typeof link.source === 'string' ? link.source : (link.source as Node).id;
            const targetId = typeof link.target === 'string' ? link.target : (link.target as Node).id;
            if (sourceId === selectedNodeId || targetId === selectedNodeId) {
              return 2.5;
            }
          }
          return 1.2;
        }}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={() => '#FFD700'}
        linkCurvature={0.25}
        linkLabel={linkLabel}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onLinkHover={handleEdgeHover}
        onLinkClick={handleEdgeClick}
        cooldownTicks={200}
        d3AlphaDecay={isPhysicsEnabled ? 0.01 : 0}
        d3VelocityDecay={isPhysicsEnabled ? 0.05 : 0}
        linkVisibility={(link: GraphEdge) => !!showConnections}
        width={width}
        height={height}
      />
      {/* Custom tooltip for node avatar hover */}
      {typeof window !== 'undefined' && window.__nodeTooltip && (
        <div
          style={{
            position: 'fixed',
            left: window.__nodeTooltip.x,
            top: window.__nodeTooltip.y,
            background: 'rgba(30,30,30,0.95)',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: 8,
            pointerEvents: 'none',
            zIndex: 9999,
            fontSize: 16,
            fontWeight: 500,
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)'
          }}
        >
          {window.__nodeTooltip.name}
        </div>
      )}
    </GraphContainer>
  );
}); 