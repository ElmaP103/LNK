export interface Education {
  institution: string;
  degree: string;
  field: string;
  year: number;
}

export interface Experience {
  organization: string;
  position: string;
  startYear: number;
  endYear?: number;
  current?: boolean;
}

export interface Publication {
  title: string;
  journal: string;
  year: number;
  doi: string;
  authors: string[];
}

export interface Node {
  id: string;
  label: string;
  type: NodeType;
  matchScore?: number;
  rawNode?: Record<string, any>;
  x?: number;
  y?: number;
  data: {
    name: string;
    specialization?: string;
    credentials?: string[];
    education?: Education[];
    experience?: Experience[];
    publications?: Publication[];
    location?: string;
    specialties?: string[];
    journal?: string;
    year?: number;
    doi?: string;
    authors?: string[];
    avatar?: string;
    peers?: number;
    following?: number;
    patientsServed?: number;
    successRate?: number;
    patientsServedChange?: number;
    successRateChange?: number;
    bio?: string;
  };
}

export type NodeType = 'Researcher' | 'Publication' | 'Publisher';
export type EdgeType = 'coauthor' | 'publisher' | 'researcher';

export interface Edge {
  source: string | Node;
  target: string | Node;
  label: string;
  type: EdgeType;
  data: {
    connectionType: EdgeType;
    strength: number;
    startYear: number;
    endYear?: number;
    publications?: string[];
    sharedAffiliations?: string[];
  };
}

export interface GraphData {
  nodes: Node[];
  links: Edge[];
}

export interface SearchResult {
  id: string;
  label: string;
  type: NodeType;
  matchScore: number;
}

export interface SearchState {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
}

export interface GraphState {
  data: GraphData | null;
  loading: boolean;
  error: string | null;
} 