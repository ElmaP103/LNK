import React, { useRef, useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import { NetworkGraph } from './NetworkGraph';
import type { GraphData, Node, Edge } from '../../../types/global';

export interface GraphViewProps {
  graphData: GraphData;
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  onNodeClick: (node: Node) => void;
  onEdgeClick: (edge: Edge) => void;
  onNodeHoverTooltip: (node: Node | null, pos: { x: number, y: number } | null) => void;
  showLabels: boolean;
  isPhysicsEnabled: boolean;
  showConnections: boolean;
  showMyConnectionsOnMap: boolean;
}

export interface GraphViewHandle {
  centerNodeInView: (node: Node, visibleWidth?: number, visibleHeight?: number) => void;
  zoom: (k: number, ms: number) => void;
  resize: () => void;
}

export const GraphView = forwardRef<GraphViewHandle, GraphViewProps>(({
  graphData,
  selectedNode,
  selectedEdge,
  onNodeClick,
  onEdgeClick,
  onNodeHoverTooltip,
  showLabels,
  isPhysicsEnabled,
  showConnections,
  showMyConnectionsOnMap
}, ref) => {
  const graphRef = useRef<any>(null);
  const graphAreaRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });

  // Responsive: update width/height on resize
  useEffect(() => {
    const updateSize = () => {
      if (graphAreaRef.current) {
        setDimensions({
          width: graphAreaRef.current.clientWidth,
          height: graphAreaRef.current.clientHeight
        });
      }
    };
    updateSize();
    const ro = new window.ResizeObserver(updateSize);
    if (graphAreaRef.current) ro.observe(graphAreaRef.current);
    return () => ro.disconnect();
  }, []);

  // Expose centerNodeInView to parent via ref
  useImperativeHandle(ref, () => ({
    centerNodeInView: (node: Node, visibleWidth?: number, visibleHeight?: number) => {
      if (node && typeof node.x === 'number' && typeof node.y === 'number' && graphRef.current) {
        graphRef.current.centerAt(node.x, node.y, 1000);
      }
    },
    zoom: (k: number, ms: number) => {
      if (graphRef.current) {
        graphRef.current.zoom(k, ms);
      }
    },
    resize: () => {
      if (graphRef.current && typeof graphRef.current.emit === 'function') {
        graphRef.current.emit('resize');
      }
    }
  }));

  return (
    <div ref={graphAreaRef} style={{ width: '100%', height: '100%' }}>
      <NetworkGraph
        ref={graphRef}
        data={graphData}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        selectedNodeId={selectedNode?.id}
        selectedEdge={selectedEdge}
        isPhysicsEnabled={isPhysicsEnabled}
        showLabels={showLabels}
        onNodeHoverTooltip={onNodeHoverTooltip}
        showConnections={showConnections}
        showMyConnectionsOnMap={showMyConnectionsOnMap}
        width={dimensions.width}
        height={dimensions.height}
      />
    </div>
  );
}); 