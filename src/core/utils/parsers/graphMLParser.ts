import { parseString } from 'xml2js';
import { GraphData, Node, Edge, NodeType, EdgeType } from '../../../types/global';

interface GraphMLNode {
  id: string;
  label?: string;
  type?: string;
  properties?: Record<string, any>;
}

interface GraphMLEdge {
  source: string;
  target: string;
  label?: string;
  type?: string;
  properties?: Record<string, any>;
}

interface GraphMLGraph {
  node?: GraphMLNode | GraphMLNode[];
  edge?: GraphMLEdge | GraphMLEdge[];
}

interface GraphMLStructure {
  $?: {
    graph?: GraphMLGraph;
  };
  '#text'?: {
    graph?: GraphMLGraph;
  };
  graph?: GraphMLGraph;
  [key: string]: any;
}

export class GraphMLParser {
  public static async parseGraphML(xmlData: string): Promise<GraphData> {
    return new Promise((resolve, reject) => {
      try {
        console.log('Starting GraphML parsing...');
        console.log('Input XML length:', xmlData.length);
        
        // Fix incomplete XML
        xmlData = this.fixIncompleteXML(xmlData);
        console.log('After fixing XML, length:', xmlData.length);

        // Try parsing with xml2js with more lenient options
        parseString(xmlData, { 
          explicitArray: false,
          mergeAttrs: true,
          strict: false,
          trim: true,
          normalize: true,
          tagNameProcessors: [function(name: string) {
            return name.toLowerCase(); // Normalize tag names to lowercase
          }],
          valueProcessors: [function(value: string) {
            return value.trim();
          }],
          attrkey: '$',
          charkey: '_',
          explicitChildren: false,
          explicitRoot: true
        }, (err: any, result: any) => {
          if (err) {
            console.error('XML Parse Error:', err);
            console.error('Error details:', {
              message: err.message,
              stack: err.stack,
              code: err.code
            });
            
            // Try to extract more information about the error
            const errorPosition = err.message.match(/position (\d+)/);
            if (errorPosition) {
              const pos = parseInt(errorPosition[1]);
              const context = xmlData.substring(Math.max(0, pos - 50), Math.min(xmlData.length, pos + 50));
              console.error('Error context:', context);
            }
            
            reject(new Error(`Failed to parse GraphML: ${err.message}`));
            return;
          }

          try {
            console.log('XML parsed successfully, checking structure...');
            console.log('Parse result keys:', Object.keys(result));
            
            // More flexible structure checking
            let graphml = result?.graphml as GraphMLStructure;
            if (!graphml) {
              console.log('No graphml element found, checking for direct graph element...');
              // Try to find the graph element directly
              if (result?.graph) {
                graphml = { graph: result.graph } as GraphMLStructure;
              } else {
                // Try to find graph element in the root
                const rootKeys = Object.keys(result);
                console.log('Root keys:', rootKeys);
                for (const key of rootKeys) {
                  if (typeof result[key] === 'object' && result[key]?.graph) {
                    graphml = { graph: result[key].graph } as GraphMLStructure;
                    break;
                  }
                }
              }
            }

            if (!graphml) {
              console.error('Missing graphml element. Result:', result);
              throw new Error('Invalid GraphML structure: missing graphml element');
            }

            // Try to find the graph element in different ways
            let graph = graphml.graph;
            if (!graph) {
              console.log('No direct graph element found, searching in other locations...');
              // Try to find graph element in other possible locations
              graph = graphml.$?.graph || 
                     graphml['#text']?.graph || 
                     Object.values(graphml).find((val: any) => val?.graph)?.graph;
            }

            if (!graph) {
              console.error('Missing graph element. GraphML:', graphml);
              console.error('Available keys:', Object.keys(graphml));
              console.error('GraphML structure:', JSON.stringify(graphml, null, 2));
              throw new Error('Invalid GraphML structure: missing graph element');
            }

            console.log('Graph structure found, parsing nodes and edges...');
            

            // Handle both array and single object cases
            const nodes = Array.isArray(graph.node) 
              ? graph.node.map((node: any) => this.parseNode(node))
              : graph.node 
                ? [this.parseNode(graph.node)]
                : [];

            const edges = Array.isArray(graph.edge)
              ? graph.edge.map((edge: any) => this.parseEdge(edge))
              : graph.edge
                ? [this.parseEdge(graph.edge)]
                : [];

            console.log(`Parsed ${nodes.length} nodes and ${edges.length} edges`);
            
            // Log sample of parsed data
            console.log('\nSample of parsed data:');
            if (nodes.length > 0) {
              console.log('Sample Node:', JSON.stringify(nodes[0], null, 2));
            }
            if (edges.length > 0) {
              console.log('Sample Edge:', JSON.stringify(edges[0], null, 2));
            }

            // Log data statistics
            console.log('\nData Statistics:');
            console.log('Total Nodes:', nodes.length);
            console.log('Total Edges:', edges.length);
            
            // Log node types distribution
            const nodeTypes = nodes.reduce((acc: Record<string, number>, node) => {
              acc[node.type || 'unknown'] = (acc[node.type || 'unknown'] || 0) + 1;
              return acc;
            }, {});
            console.log('Node Types Distribution:', nodeTypes);

            // Log edge types distribution
            const edgeTypes = edges.reduce((acc: Record<string, number>, edge) => {
              acc[edge.type || 'unknown'] = (acc[edge.type || 'unknown'] || 0) + 1;
              return acc;
            }, {});
            console.log('Edge Types Distribution:', edgeTypes);
            
            if (nodes.length === 0 && edges.length === 0) {
              console.error('No nodes or edges found in graph:', graph);
              throw new Error('No nodes or edges found in the graph');
            }

            const graphData = {
              nodes,
              links: edges
            };

            // Log final GraphData structure
            console.log('\nFinal GraphData Structure:');
            console.log('GraphData:', JSON.stringify(graphData, null, 2));

            resolve(graphData);
          } catch (error: any) {
            console.error('GraphML Processing Error:', error);
            console.error('Error details:', {
              message: error.message,
              stack: error.stack
            });
            reject(error);
          }
        });
      } catch (error: any) {
        console.error('XML Fix Error:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
        reject(error);
      }
    });
  }

  private static fixIncompleteXML(xmlData: string): string {
    console.log('Starting XML fix process...');
    console.log('Initial XML length:', xmlData.length);
    console.log('First 200 chars:', xmlData.substring(0, 200));
    console.log('Last 200 chars:', xmlData.substring(xmlData.length - 200));

    // Remove any BOM or special characters at the start
    xmlData = xmlData.replace(/^\uFEFF/, '');
    
    // Add XML declaration if missing
    if (!xmlData.trim().startsWith('<?xml')) {
      console.log('Adding XML declaration...');
      xmlData = '<?xml version="1.0" encoding="UTF-8"?>\n' + xmlData;
    }

    // Check if the XML is properly closed
    const hasGraphmlClose = xmlData.includes('</graphml>');
    const hasGraphClose = xmlData.includes('</graph>');

    // If the file is incomplete, try to fix it
    if (!hasGraphmlClose || !hasGraphClose) {
      console.warn('Incomplete XML detected, attempting to fix...');
      
      // Find the last complete node or edge tag
      const lastNodeEnd = xmlData.lastIndexOf('</node>');
      const lastEdgeEnd = xmlData.lastIndexOf('</edge>');
      const lastCompleteTag = Math.max(lastNodeEnd, lastEdgeEnd);

      if (lastCompleteTag > 0) {
        console.log('Found last complete tag at position:', lastCompleteTag);
        // Truncate to the last complete tag
        xmlData = xmlData.substring(0, lastCompleteTag + 7); // +7 for the length of </node> or </edge>
        
        // Add missing closing tags
        if (!hasGraphClose) {
          console.log('Adding closing graph tag...');
          xmlData += '\n</graph>';
        }
        if (!hasGraphmlClose) {
          console.log('Adding closing graphml tag...');
          xmlData += '\n</graphml>';
        }
      } else {
        console.warn('No complete node or edge tags found');
      }
    }

    // Ensure proper GraphML structure
    if (!xmlData.includes('<graphml')) {
      console.log('Adding graphml tag...');
      xmlData = xmlData.replace(/<graph/, '<graphml xmlns="http://graphml.graphdrawing.org/xmlns"><graph');
    }

    // Log the fixed XML structure
    console.log('Fixed XML structure:');
    console.log('Has XML declaration:', xmlData.trim().startsWith('<?xml'));
    console.log('Has graphml tag:', xmlData.includes('<graphml'));
    console.log('Has graph tag:', xmlData.includes('<graph'));
    console.log('Has nodes:', xmlData.includes('<node'));
    console.log('Has edges:', xmlData.includes('<edge'));
    console.log('Has closing graphml tag:', xmlData.includes('</graphml>'));
    console.log('Has closing graph tag:', xmlData.includes('</graph>'));
    console.log('Final XML length:', xmlData.length);
    console.log('First 200 chars of fixed XML:', xmlData.substring(0, 200));
    console.log('Last 200 chars of fixed XML:', xmlData.substring(xmlData.length - 200));

    return xmlData;
  }

  private static parseNode(node: any): Node {
    const typeMap: Record<string, NodeType> = {
      'author': 'Researcher',
      'paper': 'Publication',
      'venue': 'Publisher',
      'institution': 'Publisher',
      'unknown': 'Researcher'
    };

    // Parse education data
    const education = Array.isArray(node.data?.education) 
      ? node.data.education.map((edu: any) => ({
          institution: edu.institution || 'Unknown Institution',
          degree: edu.degree || 'Unknown Degree',
          field: edu.field || 'Unknown Field',
          year: parseInt(edu.year) || new Date().getFullYear()
        }))
      : [];

    // Parse experience data
    const experience = Array.isArray(node.data?.experience)
      ? node.data.experience.map((exp: any) => ({
          organization: exp.organization || 'Unknown Organization',
          position: exp.position || 'Unknown Position',
          startYear: parseInt(exp.startYear) || new Date().getFullYear(),
          endYear: exp.endYear ? parseInt(exp.endYear) : undefined,
          current: exp.current || false
        }))
      : [];

    // Parse publications data
    const publications = Array.isArray(node.data?.publications)
      ? node.data.publications.map((pub: any) => ({
          title: pub.title || 'Unknown Title',
          journal: pub.journal,
          year: parseInt(pub.year) || new Date().getFullYear(),
          doi: pub.doi,
          authors: Array.isArray(pub.authors) ? pub.authors : [pub.authors].filter(Boolean)
        }))
      : [];

    // Parse additional data based on node type
    const nodeType = typeMap[node.type || 'unknown'];
    let additionalData: any = {};

    if (nodeType === 'Researcher') {
      additionalData = {
        fullName: node.data?.fullName || node.name || node.label,
        specialization: node.data?.specialization,
        credentials: node.data?.credentials || [],
        affiliations: node.data?.affiliations || [],
        researchInterests: node.data?.researchInterests || [],
        contactInfo: node.data?.contactInfo || {}
      };
    } else if (nodeType === 'Publication') {
      additionalData = {
        title: node.data?.title || node.label,
        journal: node.data?.journal,
        year: parseInt(node.data?.year) || new Date().getFullYear(),
        doi: node.data?.doi,
        authors: Array.isArray(node.data?.authors) ? node.data.authors : [node.data?.authors].filter(Boolean)
      };
    } else if (nodeType === 'Publisher') {
      additionalData = {
        name: node.data?.name || node.label,
        type: node.data?.type || 'Medical Institution',
        location: node.data?.location,
        specialties: node.data?.specialties || []
      };
    }
    
    return {
      id: node.id,
      label: node.label || node.id,
      type: nodeType,
      rawNode: node,
      data: {
        ...additionalData,
        education,
        experience,
        publications
      }
    };
  }

  private static parseEdge(edge: any): Edge {
    const typeMap: Record<string, EdgeType> = {
      'coauthor': 'coauthor',
      'publisher': 'publisher',
      'researcher': 'researcher',
      'unknown': 'coauthor'
    };
    
    return {
      source: edge.source,
      target: edge.target,
      label: edge.label || 'unknown',
      type: typeMap[edge.type || 'unknown'],
      data: {
        connectionType: edge.data?.connectionType,
        strength: edge.data?.strength ? parseFloat(edge.data.strength) : 1,
        startYear: edge.data?.startYear ? parseInt(edge.data.startYear) : new Date().getFullYear(),
        endYear: edge.data?.endYear ? parseInt(edge.data.endYear) : undefined,
        publications: edge.data?.publications || [],
        sharedAffiliations: edge.data?.sharedAffiliations || []
      }
    };
  }
} 