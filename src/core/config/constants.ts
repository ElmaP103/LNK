export const GRAPH_CONFIG = {
  NODE_COLORS: {
    Researcher: '#4CAF50',
    Publication: '#2196F3',
    Publisher: '#FF9800'
  },
  NODE_RADIUS: {
    Researcher: 8,
    Publication: 6,
    Publisher: 6
  },
  EDGE_COLORS: {
    coauthor: '#757575',
    publisher: '#9C27B0',
    researcher: '#607D8B'
  }
};

export const SEARCH_CONFIG = {
  DEBOUNCE_DELAY: 300,
  MIN_SEARCH_LENGTH: 2,
  MAX_RESULTS: 10
};

export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  TIMEOUT: 5000
}; 