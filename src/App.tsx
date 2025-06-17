import React, { useState, useEffect, useRef } from 'react';
import { SearchBar } from './features/search/components/SearchBar';
import { GraphControls } from './features/graph/components/GraphControls';
import { LoadingSpinner } from './shared/components/LoadingSpinner';
import { ErrorMessage } from './shared/components/ErrorMessage';
import { MockDataGenerator } from './core/utils/mockDataGenerator';
import type { GraphData, Node, SearchResult, Edge } from './types/global';
import styled from 'styled-components';
import { Avatar, Typography, Switch, FormControlLabel, Box, Button } from '@mui/material';
import { GraphView, GraphViewHandle } from './features/graph/components/GraphView';
import { DetailsPanel } from './features/graph/components/DetailsPanel';
import { ENV_CONFIG } from './core/config/constants';
import { GraphMLParser } from './core/utils/parsers/graphMLParser';

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #f7f9fb;
`;

const Container = styled.div`
  width: 100vw;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  @media (max-width: 900px) {
    width: 100vw !important;
    max-width: 100vw !important;
    min-width: 0 !important;
    padding: 0 !important;
  }
`;

const TopBarRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: space-between;
  gap: 12px;
  height: 104px;
  margin-bottom: 7px;
  @media (max-width: 1200px) {
    height: auto;
    flex-wrap: wrap;
  }
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const ProfileBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 140px;
  background: #fff;
  border-radius: 12px 0 0 12px;
  padding: 0 16px;
  box-shadow: none;
  height: 100%;
  min-width: 0;
  @media (max-width: 900px) {
    border-radius: 12px;
    padding: 12px;
    width: auto;
    min-width: 0;
    margin-bottom: 0;
  }
`;

const CenterStatsBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  background: #fff;
  border-radius: 0 12px 12px 0;
  padding: 0 32px 0 0;
  box-shadow: none;
  min-width: 220px;
  height: 100%;
  margin-left: auto;
  min-width: 0;
  @media (max-width: 900px) {
    border-radius: 12px;
    padding: 12px;
    width: auto;
    min-width: 0;
    margin-left: 0;
    align-items: flex-end;
    margin-top: 0;
  }
`;

const ProfileStatsBlock = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: space-between;
  gap: 24px;
  background: #fff;
  border-radius: 12px;
  padding: 0 24px 0 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  height: 100%;
  flex: 1 1 0;
  width: 100%;
  min-width: 0;
  @media (max-width: 900px) {
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    width: 100%;
    padding: 12px 0 0 0;
    margin: 0;
    gap: 0;
  }
`;

const TogglesBlock = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: flex-end;
  background: #fff;
  border-radius: 12px;
  padding: 0 24px 0 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  width: 100%;
  min-width: 0;
  max-width: 480px;
  margin-left: auto;
  margin-bottom: 12px;
  margin-top: 8px;
  gap: 16px;
  z-index: 2;
  flex-wrap: wrap;
  @media (max-width: 900px) {
    flex-direction: row;
    align-items: flex-end;
    justify-content: flex-end;
    gap: 8px;
    padding: 0 16px 0 8px;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    margin: 0;
    margin-top: 8px;
    flex-wrap: wrap;
  }
`;

const SearchBarRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  background: #fff;
  border-radius: 24px;
  padding: 0;
  margin-bottom: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  gap: 6px;
  @media (max-width: 768px) {
    border-radius: 12px;
  }
`;

const MainContentFlex = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  flex: 1 1 0;
  @media (max-width: 900px) {
    flex-direction: column !important;
    width: 100vw !important;
    height: auto !important;
    min-width: 0 !important;
    min-height: 0 !important;
  }
`;

const GraphArea = styled.div`
  flex: 1 1 auto;
  background: #1a1a1a;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 0;
  position: relative;
  overflow: hidden;
  min-width: 0;
  min-height: 0;
  height: 100%;
  width: 100%;
  @media (max-width: 900px) {
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    min-height: unset !important;
    height: 50vh !important;
    flex-basis: auto !important;
    order: 1;
  }
`;

const DetailsPanelArea = styled.div`
  width: 640px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 0;
  overflow-y: auto;
  display: flex;
  align-items: stretch;
  min-width: 320px;
  max-width: 640px;
  height: 100%;
  @media (max-width: 900px) {
    width: 100vw !important;
    max-width: 100vw !important;
    min-width: 0 !important;
    height: auto !important;
    flex-basis: auto !important;
    order: 2;
    margin-top: 16px;
    border-radius: 0 0 12px 12px;
    box-shadow: none;
  }
`;

const GraphControlsRow = styled.div`
  width: 100%;
  margin-top: 18px;
  @media (max-width: 768px) {
    margin-top: 12px;
  }
`;

// Utility to run a function after two animation frames
const runAfterNextFrame = (fn: () => void) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(fn);
  });
};

function App() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPhysicsEnabled, setIsPhysicsEnabled] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [hoveredNodePos, setHoveredNodePos] = useState<{ x: number, y: number } | null>(null);
  const [showConnections, setShowConnections] = useState(false);
  const [showMyConnectionsOnMap, setShowMyConnectionsOnMap] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const graphViewRef = useRef<GraphViewHandle>(null);
  const graphAreaDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadGraphData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        if (ENV_CONFIG.IS_DEVELOPMENT) {
          const mockData = MockDataGenerator.generateMockData(50);
          setGraphData(mockData);
          setIsLoading(false);
          setTimeout(() => {
            if (graphViewRef.current && mockData.nodes.length > 0) {
              graphViewRef.current.centerNodeInView(mockData.nodes[0]);
            }
          }, 100);
          return;
        }

        // Fetch real data
        const response = await fetch(ENV_CONFIG.GRAPH_DATA_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const xmlData = await response.text();
        const parsedData = await GraphMLParser.parseGraphML(xmlData);
        setGraphData(parsedData);
        
        // Center on first node after data loads
        setTimeout(() => {
          if (graphViewRef.current && parsedData.nodes.length > 0) {
            graphViewRef.current.centerNodeInView(parsedData.nodes[0]);
          }
        }, 100);
      } catch (error) {
        console.error('Error loading graph data:', error);
        setError('Failed to load graph data');
      } finally {
        setIsLoading(false);
      }
    };
    loadGraphData();
  }, []);

  useEffect(() => {
    if (!graphAreaDivRef.current) return;
    const ro = new window.ResizeObserver(() => {
      if (graphViewRef.current && graphAreaDivRef.current) {
        // Force the graph to resize
        if (typeof (graphViewRef.current as any).resize === 'function') {
          (graphViewRef.current as any).resize();
        } else if ((graphViewRef.current as any).graph && typeof (graphViewRef.current as any).graph.emit === 'function') {
          (graphViewRef.current as any).graph.emit('resize');
        }
        // Recenter the node after resize
        if (selectedNode) {
          const visibleWidth = graphAreaDivRef.current.clientWidth;
          const visibleHeight = graphAreaDivRef.current.clientHeight;
          graphViewRef.current.centerNodeInView(selectedNode, visibleWidth, visibleHeight);
        }
      }
    });
    ro.observe(graphAreaDivRef.current);
    return () => ro.disconnect();
  }, [selectedNode, showDetails]);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const results = graphData.nodes
      .filter(node => {
        const nodeData = (node.rawNode || node) as Record<string, any>;
        const searchableText = [
          nodeData.name,
          nodeData.title,
          nodeData.type,
          nodeData.id,
          nodeData.label
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return searchableText.includes(query.toLowerCase());
      })
      .map(node => {
        const nodeData = (node.rawNode || node) as Record<string, any>;
        let label = nodeData.label || nodeData.name || nodeData.title || nodeData.type || 'Unnamed Node';
        if (nodeData.type === 'Researcher') label = nodeData.name || label;
        if (nodeData.type === 'Publication') label = nodeData.title || label;
        if (nodeData.type === 'Publisher') label = nodeData.label || label;
        return {
          id: nodeData.id || nodeData.name || 'unknown',
          label,
          type: nodeData.type || 'unknown',
          matchScore: 1
        };
      })
      .slice(0, 10);
    setSearchResults(results);
  };
  
  const handleSearchResult = (result: SearchResult) => {
    const node = graphData.nodes.find(n => n.id === result.id);
    if (node) {
      setSelectedNode(node);
      setShowDetails(false);
      runAfterNextFrame(() => {
        if (graphViewRef.current && graphAreaDivRef.current) {
          const graph = (graphViewRef.current as any).graph;
          if (graph) {
            graph.emit('resize');
          }
          // graphViewRef.current.centerNodeInView(node, visibleWidth, visibleHeight);
        }
      });
    }
  };

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
    setShowDetails(true);
    runAfterNextFrame(() => {
      if (graphViewRef.current && graphAreaDivRef.current) {
        const visibleWidth = graphAreaDivRef.current.clientWidth;
        const visibleHeight = graphAreaDivRef.current.clientHeight;
        const graph = (graphViewRef.current as any).graph;
        if (graph) {
          graph.emit('resize');
        }
        graphViewRef.current.centerNodeInView(node, visibleWidth, visibleHeight);
      }
    });
  };

  const handleEdgeClick = (edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
    // Center on the source node after a short delay
    const sourceNode = typeof edge.source === 'string'
      ? graphData.nodes.find(n => n.id === edge.source)
      : edge.source;
    if (sourceNode) {
      setTimeout(() => {
        if (graphViewRef.current && graphAreaDivRef.current) {
          const visibleWidth = graphAreaDivRef.current.clientWidth;
          const visibleHeight = graphAreaDivRef.current.clientHeight;
          graphViewRef.current.centerNodeInView(sourceNode, visibleWidth, visibleHeight);
        }
      }, 100);
    }
  };

  const handleCloseDetails = () => {
    setSelectedNode(null);
    setShowDetails(false);
  };

  const handleCloseEdgeDetails = () => setSelectedEdge(null);

  const handleNodeHoverTooltip = (node: Node | null, pos: { x: number, y: number } | null) => {
    setHoveredNode(node);
    setHoveredNodePos(pos);
  };

  const getEdgeConnectors = (edge: Edge | null) => {
    if (!edge) return { source: null, target: null };
    const source = graphData.nodes.find(n => n.id === (typeof edge.source === 'string' ? edge.source : edge.source.id)) || null;
    const target = graphData.nodes.find(n => n.id === (typeof edge.target === 'string' ? edge.target : edge.target.id)) || null;
    return { source, target };
  };
  const edgeConnectors = getEdgeConnectors(selectedEdge);

  if (isLoading) {
    return <LoadingSpinner message="Loading healthcare network..." />;
  }
  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <AppContainer>
      <Container>
        <TopBarRow>
          <ProfileStatsBlock>
            <ProfileBlock>
              {selectedNode ? (
                <>
                  <Avatar src={selectedNode.data.avatar} alt={selectedNode.data.name} sx={{ width: 56, height: 56 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>{selectedNode.data.name}</Typography>
                    {selectedNode.data.specialization && (
                      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 400, lineHeight: 1.2 }}>
                        {selectedNode.data.specialization}
                      </Typography>
                    )}
                  </Box>
                </>
              ) : (
                <>
                  <Avatar sx={{ width: 56, height: 56 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>Name</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 400, lineHeight: 1.2 }}>Title</Typography>
                  </Box>
                </>
              )}
            </ProfileBlock>
            <CenterStatsBlock>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ fontSize: 14, color: 'text.secondary' }}>
                  My Peers <b style={{ fontSize: 15 }}>{selectedNode?.data?.peers ?? 0}</b>
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 14, color: 'text.secondary', ml: 1 }}>
                  Following <b style={{ fontSize: 15 }}>{selectedNode?.data?.following ?? 0}</b>
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                sx={{ borderRadius: 2, minWidth: 140, fontWeight: 600, fontSize: 15, height: 36, mt: 1 }}
              >
                Create web
              </Button>
            </CenterStatsBlock>
          </ProfileStatsBlock>
        </TopBarRow>
        <SearchBarRow>
          <SearchBar
            onSearch={handleSearch}
            results={searchResults}
            onResultSelect={handleSearchResult}
          />
        </SearchBarRow>
        <TogglesBlock>
          <FormControlLabel
            control={<Switch checked={showConnections} onChange={e => setShowConnections(e.target.checked)} />}
            label={<Typography variant="body2" color="textSecondary" sx={{ fontSize: 13 }}>Show connections</Typography>}
            sx={{ m: 0 }}
          />
          <FormControlLabel
            control={<Switch checked={showMyConnectionsOnMap} onChange={e => setShowMyConnectionsOnMap(e.target.checked)} color="primary" />}
            label={<Typography variant="body2" color="textSecondary" sx={{ fontSize: 13 }}>Show my connections on map</Typography>}
            sx={{ m: 0 }}
          />
        </TogglesBlock>
        <div style={{ height: 12 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, mt: 1, ml: 1 }}>
          PeerSpace
        </Typography>
        <MainContentFlex>
          <GraphArea ref={graphAreaDivRef}>
            <GraphView
              ref={graphViewRef}
              graphData={graphData}
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              onNodeClick={handleNodeClick}
              onEdgeClick={handleEdgeClick}
              onNodeHoverTooltip={handleNodeHoverTooltip}
              showLabels={showLabels}
              isPhysicsEnabled={isPhysicsEnabled}
              showConnections={showConnections}
              showMyConnectionsOnMap={showMyConnectionsOnMap}
            />
          </GraphArea>
          {((showDetails && selectedNode) || selectedEdge) && (
            <DetailsPanelArea>
              <DetailsPanel
                selectedNode={selectedNode}
                selectedEdge={selectedEdge}
                onCloseNode={handleCloseDetails}
                onCloseEdge={handleCloseEdgeDetails}
                showMyConnectionsOnMap={showMyConnectionsOnMap}
                edgeConnectors={edgeConnectors}
              />
            </DetailsPanelArea>
          )}
        </MainContentFlex>
        <GraphControlsRow>
          <GraphControls
            onZoomIn={() => { const ref = graphViewRef.current as any; if (ref && typeof ref.zoom === 'function') ref.zoom(1.5, 400); }}
            onZoomOut={() => { const ref = graphViewRef.current as any; if (ref && typeof ref.zoom === 'function') ref.zoom(0.75, 400); }}
            onCenter={() => {
              const node = graphData.nodes[0];
              if (node) graphViewRef.current?.centerNodeInView(node);
            }}
            onTogglePhysics={() => setIsPhysicsEnabled(!isPhysicsEnabled)}
            onToggleLabels={() => setShowLabels(!showLabels)}
            isPhysicsEnabled={isPhysicsEnabled}
            showLabels={showLabels}
          />
        </GraphControlsRow>
      </Container>
      {hoveredNode && hoveredNodePos && (
        <div style={{
          position: 'fixed',
          left: hoveredNodePos.x + 12,
          top: hoveredNodePos.y + 12,
          background: 'rgba(30,30,30,0.95)',
          color: '#fff',
          padding: '6px 14px',
          borderRadius: 6,
          pointerEvents: 'none',
          zIndex: 9999,
          fontSize: 15,
          fontWeight: 500,
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)'
        }}>
          {hoveredNode.data?.name || hoveredNode.label}
        </div>
      )}
    </AppContainer>
  );
}

export default App;
