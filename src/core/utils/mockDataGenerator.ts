import { GraphData, Node, Edge, EdgeType, Education, Experience, Publication } from '../../types/global';

const MOCK_INSTITUTIONS = [
  'Harvard Medical School',
  'Johns Hopkins University',
  'Stanford Medical School',
  'Mayo Clinic',
  'Cleveland Clinic',
  'Massachusetts General Hospital',
  'UCLA Medical Center',
  'Yale School of Medicine'
];

const MOCK_SPECIALIZATIONS = [
  'Cardiology',
  'Neurology',
  'Oncology',
  'Pediatrics',
  'Surgery',
  'Psychiatry',
  'Dermatology',
  'Orthopedics'
];

const MOCK_JOURNALS = [
  'New England Journal of Medicine',
  'The Lancet',
  'JAMA',
  'Nature Medicine',
  'Science Translational Medicine',
  'BMJ',
  'Annals of Internal Medicine'
];

export class MockDataGenerator {
  private static generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private static generateName(): string {
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
      lastNames[Math.floor(Math.random() * lastNames.length)]
    }`;
  }

  private static generateEducation(): Education[] {
    const count = Math.floor(Math.random() * 3) + 1; // 1-3 education entries
    return Array(count)
      .fill(null)
      .map(() => ({
        institution: MOCK_INSTITUTIONS[Math.floor(Math.random() * MOCK_INSTITUTIONS.length)],
        degree: ['MD', 'PhD', 'MD/PhD', 'DO'][Math.floor(Math.random() * 4)],
        field: MOCK_SPECIALIZATIONS[Math.floor(Math.random() * MOCK_SPECIALIZATIONS.length)],
        year: 2000 + Math.floor(Math.random() * 23) // Random year between 2000-2023
      }));
  }

  private static generateExperience(): Experience[] {
    const count = Math.floor(Math.random() * 4) + 1; // 1-4 experience entries
    return Array(count)
      .fill(null)
      .map(() => {
        const startYear = 2000 + Math.floor(Math.random() * 23);
        return {
          organization: MOCK_INSTITUTIONS[Math.floor(Math.random() * MOCK_INSTITUTIONS.length)],
          position: ['Resident', 'Fellow', 'Attending', 'Professor', 'Researcher'][
            Math.floor(Math.random() * 5)
          ],
          startYear,
          endYear: Math.random() > 0.3 ? startYear + Math.floor(Math.random() * 10) : undefined,
          current: Math.random() > 0.7
        };
      });
  }

  private static generatePublications(): Publication[] {
    const count = Math.floor(Math.random() * 10) + 1; // 1-10 publications
    return Array(count)
      .fill(null)
      .map(() => ({
        title: `Research on ${MOCK_SPECIALIZATIONS[Math.floor(Math.random() * MOCK_SPECIALIZATIONS.length)]} Treatment Methods`,
        journal: MOCK_JOURNALS[Math.floor(Math.random() * MOCK_JOURNALS.length)],
        year: 2010 + Math.floor(Math.random() * 14), // Random year between 2010-2024
        doi: `10.1000/${Math.random().toString(36).substring(2, 10)}`,
        authors: Array(Math.floor(Math.random() * 5) + 1)
          .fill(null)
          .map(() => this.generateName())
      }));
  }

  private static generateResearcherNode(): Node {
    const name = this.generateName();
    // 50% chance to have a real avatar, otherwise undefined (will use placeholder in UI)
    const hasAvatar = Math.random() > 0.5;
    // Use randomuser.me for demo avatars
    const gender = Math.random() > 0.5 ? 'men' : 'women';
    const avatarId = Math.floor(Math.random() * 90) + 1; // randomuser.me has 1-99
    const avatar = hasAvatar ? `https://randomuser.me/api/portraits/${gender}/${avatarId}.jpg` : undefined;
    // Add mock stats
    const peers = Math.floor(Math.random() * 500) + 50; // 50-549
    const following = Math.floor(Math.random() * 300) + 20; // 20-319
    const patientsServed = Math.floor(Math.random() * 2000) + 100; // 100-2099
    const successRate = Math.floor(Math.random() * 11) + 90; // 90-100
    const patientsServedChange = Math.floor(Math.random() * 40) - 10; // e.g., -10 to +30
    const successRateChange = Math.floor(Math.random() * 11) - 5; // e.g., -5 to +5
    return {
      id: this.generateId(),
      label: name,
      type: 'Researcher',
      matchScore: 1,
      data: {
        name: name,
        specialization: MOCK_SPECIALIZATIONS[Math.floor(Math.random() * MOCK_SPECIALIZATIONS.length)],
        credentials: ['MD', 'PhD', 'FACS', 'FAAP'][Math.floor(Math.random() * 4)].split(''),
        education: this.generateEducation(),
        experience: this.generateExperience(),
        publications: this.generatePublications(),
        location: ['Boston', 'New York', 'Los Angeles', 'Chicago', 'Houston'][Math.floor(Math.random() * 5)],
        specialties: [MOCK_SPECIALIZATIONS[Math.floor(Math.random() * MOCK_SPECIALIZATIONS.length)]],
        avatar,
        peers,
        following,
        patientsServed,
        successRate,
        patientsServedChange,
        successRateChange
      }
    };
  }

  private static generateEdge(source: string, target: string, type: EdgeType, data: any): Edge {
    return {
      source,
      target,
      label: type,
      type,
      data: {
        connectionType: type,
        strength: Math.random(),
        startYear: data.startYear,
        endYear: data.endYear,
        publications: data.publications,
        sharedAffiliations: data.sharedAffiliations
      }
    };
  }

  private static findCommonEducation(researcher1: Node, researcher2: Node): Education[] {
    const edu1 = researcher1.data.education || [];
    const edu2 = researcher2.data.education || [];
    return edu1.filter(e1 => 
      edu2.some(e2 => 
        e1.institution === e2.institution && 
        Math.abs(e1.year - e2.year) <= 2
      )
    );
  }

  private static findCommonExperience(researcher1: Node, researcher2: Node): Experience[] {
    const exp1 = researcher1.data.experience || [];
    const exp2 = researcher2.data.experience || [];
    return exp1.filter(e1 => 
      exp2.some(e2 => 
        e1.organization === e2.organization && 
        (
          (e1.startYear <= (e2.endYear ?? Infinity)) && 
          (e2.startYear <= (e1.endYear ?? Infinity))
        )
      )
    );
  }

  private static findCommonPublications(researcher1: Node, researcher2: Node): Publication[] {
    const pub1 = researcher1.data.publications || [];
    const pub2 = researcher2.data.publications || [];
    return pub1.filter(p1 => 
      pub2.some(p2 => 
        p1.journal === p2.journal && 
        Math.abs(p1.year - p2.year) <= 1
      )
    );
  }

  public static generateMockData(nodeCount: number = 50): GraphData {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Generate researcher nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push(this.generateResearcherNode());
    }

    // Generate edges based on connections between researchers
    for (let i = 0; i < nodes.length; i++) {
      const researcher1 = nodes[i];
      let educationEdges = 0;
      let experienceEdges = 0;
      let publicationEdges = 0;
      for (let j = i + 1; j < nodes.length; j++) {
        const researcher2 = nodes[j];
        // Check for common education
        const commonEducation = this.findCommonEducation(researcher1, researcher2);
        if (commonEducation.length > 1 && educationEdges < 2) {
          edges.push(this.generateEdge(
            researcher1.id,
            researcher2.id,
            'researcher',
            {
              startYear: Math.min(...commonEducation.map(e => e.year)),
              endYear: Math.max(...commonEducation.map(e => e.year)),
              publications: [],
              sharedAffiliations: commonEducation.map(e => e.institution)
            }
          ));
          educationEdges++;
        }
        // Check for common experience
        const commonExperience = this.findCommonExperience(researcher1, researcher2);
        if (commonExperience.length > 1 && experienceEdges < 2) {
          edges.push(this.generateEdge(
            researcher1.id,
            researcher2.id,
            'researcher',
            {
              startYear: Math.min(...commonExperience.map(e => e.startYear)),
              endYear: Math.max(...commonExperience.map(e => e.endYear || e.startYear)),
              publications: [],
              sharedAffiliations: commonExperience.map(e => e.organization)
            }
          ));
          experienceEdges++;
        }
        // Check for common publications
        const commonPublications = this.findCommonPublications(researcher1, researcher2);
        if (commonPublications.length > 1 && publicationEdges < 2) {
          edges.push(this.generateEdge(
            researcher1.id,
            researcher2.id,
            'coauthor',
            {
              startYear: Math.min(...commonPublications.map(p => p.year)),
              endYear: Math.max(...commonPublications.map(p => p.year)),
              publications: commonPublications.map(p => p.doi),
              sharedAffiliations: commonPublications.map(p => p.journal)
            }
          ));
          publicationEdges++;
        }
      }
    }
    return { nodes, links: edges };
  }
} 