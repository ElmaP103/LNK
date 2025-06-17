import React from 'react';
import { NodeDetails } from './NodeDetails';
import { EdgeDetails } from './EdgeDetails';
import type { Node, Edge } from '../../../types/global';

interface DetailsPanelProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  onCloseNode: () => void;
  onCloseEdge: () => void;
  showMyConnectionsOnMap: boolean;
  edgeConnectors: { source: Node | null; target: Node | null };
}

export const DetailsPanel: React.FC<DetailsPanelProps> = ({
  selectedNode,
  selectedEdge,
  onCloseNode,
  onCloseEdge,
  showMyConnectionsOnMap,
  edgeConnectors
}) => {
  if (selectedNode && !selectedEdge) {
    return (
      <NodeDetails
        node={selectedNode}
        onClose={onCloseNode}
        showMyConnectionsOnMap={showMyConnectionsOnMap}
      />
    );
  }
  if (selectedEdge) {
    return (
      <EdgeDetails
        edge={selectedEdge}
        sourceNode={edgeConnectors.source}
        targetNode={edgeConnectors.target}
        onClose={onCloseEdge}
      />
    );
  }
  return null;
}; 