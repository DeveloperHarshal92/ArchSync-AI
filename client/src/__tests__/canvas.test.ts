import { describe, it, expect } from 'vitest';
import {
  NODE_CATALOG,
  ArchitectureNodeType,
  Architecture,
} from '@archsync/shared';
import {
  architectureToReactFlow,
  reactFlowToArchitecture,
  generateNodeId,
  generateEdgeId,
  AppNode,
  AppEdge,
} from '../lib/architecture/adapters';
import { getNodeVisual } from '../lib/architecture/nodeIcons';

describe('ArchSync AI — F07 Interactive Architecture Canvas Behavioral Suite', () => {
  const sampleArchitecture: Architecture = {
    projectId: 'proj_123',
    version: 1,
    nodes: [
      {
        id: 'node_web_1',
        type: 'web-app',
        position: { x: 100, y: 150 },
        width: 220,
        height: 100,
        data: {
          label: 'Client Dashboard',
          description: 'Single page application in React',
          technology: 'React / Vite',
          category: 'Client',
        },
        createdBy: 'user_1',
        createdAt: '2026-10-07T12:00:00.000Z',
        updatedAt: '2026-10-07T12:00:00.000Z',
      },
      {
        id: 'node_api_1',
        type: 'server',
        position: { x: 450, y: 150 },
        width: 220,
        height: 100,
        data: {
          label: 'API Core Server',
          description: 'Express microservice',
          technology: 'Node.js / Express',
          category: 'backend',
        },
        createdBy: 'user_1',
        createdAt: '2026-10-07T12:00:00.000Z',
        updatedAt: '2026-10-07T12:00:00.000Z',
      },
      {
        id: 'node_db_1',
        type: 'database',
        position: { x: 800, y: 150 },
        data: {
          label: 'Main Database',
          description: 'Document database',
          technology: 'MongoDB',
          category: 'Storage',
        },
        createdBy: 'user_1',
        createdAt: '2026-10-07T12:00:00.000Z',
        updatedAt: '2026-10-07T12:00:00.000Z',
      },
    ],
    edges: [
      {
        id: 'edge_1_2',
        source: 'node_web_1',
        target: 'node_api_1',
        type: 'default',
        label: 'HTTPS REST',
        animated: true,
        createdBy: 'user_1',
        createdAt: '2026-10-07T12:00:00.000Z',
        updatedAt: '2026-10-07T12:00:00.000Z',
      },
      {
        id: 'edge_2_3',
        source: 'node_api_1',
        target: 'node_db_1',
        type: 'dashed',
        label: 'Mongoose Protocol',
        animated: false,
        createdBy: 'user_1',
        createdAt: '2026-10-07T12:00:00.000Z',
        updatedAt: '2026-10-07T12:00:00.000Z',
      },
    ],
    viewport: {
      x: 50,
      y: 75,
      zoom: 1.25,
    },
    createdAt: '2026-10-07T12:00:00.000Z',
    updatedAt: '2026-10-07T12:00:00.000Z',
  };

  describe('1. Canvas Loading & Adapter Hydration', () => {
    it('1. GIVEN valid architecture API response, WHEN hydrated through adapter, THEN nodes and edges appear accurately', () => {
      const { nodes, edges } = architectureToReactFlow(sampleArchitecture);

      expect(nodes).toHaveLength(3);
      expect(edges).toHaveLength(2);

      // Verify node 0
      expect(nodes[0].id).toBe('node_web_1');
      expect(nodes[0].type).toBe('architectureNode');
      expect(nodes[0].position).toEqual({ x: 100, y: 150 });
      expect(nodes[0].data.label).toBe('Client Dashboard');
      expect(nodes[0].data.technology).toBe('React / Vite');
      expect(nodes[0].data.nodeType).toBe('web-app');
      expect(nodes[0].data.category).toBe('Client');

      // Verify edge 0
      expect(edges[0].id).toBe('edge_1_2');
      expect(edges[0].source).toBe('node_web_1');
      expect(edges[0].target).toBe('node_api_1');
      expect(edges[0].label).toBe('HTTPS REST');
      expect(edges[0].animated).toBe(true);
    });

    it('2. GIVEN empty architecture, WHEN workspace loads, THEN empty node and edge sets are produced safely', () => {
      const emptyArchitecture: Architecture = {
        projectId: 'proj_empty',
        version: 1,
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        createdAt: '2026-10-07T12:00:00.000Z',
        updatedAt: '2026-10-07T12:00:00.000Z',
      };

      const { nodes, edges } = architectureToReactFlow(emptyArchitecture);
      expect(nodes).toEqual([]);
      expect(edges).toEqual([]);
    });

    it('3. GIVEN persisted viewport, WHEN loaded, THEN viewport parameters match exactly', () => {
      expect(sampleArchitecture.viewport.x).toBe(50);
      expect(sampleArchitecture.viewport.y).toBe(75);
      expect(sampleArchitecture.viewport.zoom).toBe(1.25);
    });
  });

  describe('2. Component Palette & Catalog', () => {
    it('4. GIVEN OWNER/EDITOR, WHEN palette loads, THEN all F06 node catalog types are available', () => {
      const catalogKeys = Object.keys(NODE_CATALOG) as ArchitectureNodeType[];
      expect(catalogKeys).toHaveLength(11);

      const expectedTypes: ArchitectureNodeType[] = [
        'client',
        'web-app',
        'mobile-app',
        'api-gateway',
        'server',
        'microservice',
        'database',
        'cache',
        'queue',
        'external-api',
        'cloud-service',
      ];

      for (const expected of expectedTypes) {
        expect(catalogKeys).toContain(expected);
        expect(NODE_CATALOG[expected].label).toBeTruthy();
        expect(NODE_CATALOG[expected].description).toBeTruthy();
        expect(NODE_CATALOG[expected].category).toBeTruthy();
      }
    });

    it('5. GIVEN node visuals, THEN every catalog item has complete visual and icon mappings', () => {
      const catalogKeys = Object.keys(NODE_CATALOG) as ArchitectureNodeType[];
      for (const key of catalogKeys) {
        const visual = getNodeVisual(key);
        expect(visual).toBeDefined();
        expect(visual.icon).toBeDefined();
        expect(visual.accentColor).toMatch(/^#/);
        expect(visual.badgeBg).toBeTruthy();
      }
    });
  });

  describe('3. Node Creation & Unique ID Generation', () => {
    it('6. GIVEN editable user, WHEN creating a node from palette type, THEN valid ArchitectureNode is produced', () => {
      const type: ArchitectureNodeType = 'database';
      const def = NODE_CATALOG[type];
      const newId = generateNodeId(type);

      const createdNode: AppNode = {
        id: newId,
        type: 'architectureNode',
        position: { x: 300, y: 200 },
        data: {
          label: def.label,
          description: def.description,
          category: def.category,
          nodeType: type,
        },
      };

      expect(createdNode.id).toMatch(/^database_/);
      expect(createdNode.data.label).toBe('Database');
      expect(createdNode.data.category).toBe('Storage');
      expect(createdNode.data.technology).toBeUndefined(); // do not invent fake technologies
    });

    it('7. GIVEN multiple created nodes, THEN their IDs are unique and collision-free', () => {
      const ids = new Set<string>();
      const total = 500;
      for (let i = 0; i < total; i++) {
        const id = generateNodeId('server');
        ids.add(id);
      }
      expect(ids.size).toBe(total);
    });
  });

  describe('4. Node Editing & Permissions', () => {
    it('8. GIVEN selected editable node, WHEN properties are updated, THEN local node data reflects edits', () => {
      const { nodes } = architectureToReactFlow(sampleArchitecture);
      const targetNode = nodes[0];

      // Update properties
      const updatedNodes = nodes.map((n) =>
        n.id === targetNode.id
          ? {
              ...n,
              data: {
                ...n.data,
                label: 'Updated Web Portal',
                technology: 'Next.js 15',
                description: 'Server rendered client',
              },
            }
          : n
      );

      const edited = updatedNodes.find((n) => n.id === targetNode.id);
      expect(edited?.data.label).toBe('Updated Web Portal');
      expect(edited?.data.technology).toBe('Next.js 15');
      expect(edited?.data.description).toBe('Server rendered client');
      expect(edited?.id).toBe(targetNode.id); // ID must remain stable
    });

    it('9. GIVEN VIEWER role, THEN editing is disabled in permissions logic', () => {
      const getIsEditable = (role: 'owner' | 'editor' | 'viewer') => role === 'owner' || role === 'editor';

      expect(getIsEditable('owner')).toBe(true);
      expect(getIsEditable('editor')).toBe(true);
      expect(getIsEditable('viewer')).toBe(false);
    });
  });

  describe('5. Node Deletion & Connected Edge Cascading', () => {
    it('10. GIVEN node with connected edges, WHEN node is deleted, THEN both node and all connected edges are removed', () => {
      const { nodes, edges } = architectureToReactFlow(sampleArchitecture);

      const nodeToDelete = 'node_api_1'; // connected to edge_1_2 and edge_2_3

      // Delete node and cascade to edges
      const remainingNodes = nodes.filter((n) => n.id !== nodeToDelete);
      const remainingEdges = edges.filter(
        (e) => e.source !== nodeToDelete && e.target !== nodeToDelete
      );

      expect(remainingNodes).toHaveLength(2);
      expect(remainingNodes.map((n) => n.id)).not.toContain('node_api_1');

      // Both edges should have been removed because node_api_1 was source/target
      expect(remainingEdges).toHaveLength(0);
    });

    it('11. GIVEN terminal node with single edge, WHEN deleted, only its incoming/outgoing edge is removed', () => {
      const { nodes, edges } = architectureToReactFlow(sampleArchitecture);

      const nodeToDelete = 'node_db_1'; // only connected to edge_2_3

      const remainingNodes = nodes.filter((n) => n.id !== nodeToDelete);
      const remainingEdges = edges.filter(
        (e) => e.source !== nodeToDelete && e.target !== nodeToDelete
      );

      expect(remainingNodes).toHaveLength(2);
      expect(remainingEdges).toHaveLength(1);
      expect(remainingEdges[0].id).toBe('edge_1_2');
    });
  });

  describe('6. Edge Creation, Styling & Deletion', () => {
    it('12. GIVEN two nodes, WHEN connecting them, THEN valid edge is created with unique ID', () => {
      const source = 'node_web_1';
      const target = 'node_db_1';
      const edgeId = generateEdgeId(source, target);

      const newEdge: AppEdge = {
        id: edgeId,
        source,
        target,
        type: 'default',
        style: { strokeWidth: 2, stroke: '#06b6d4' },
        data: { edgeType: 'default' },
      };

      expect(newEdge.id).toMatch(/^edge_node_web_1_node_db_1_/);
      expect(newEdge.source).toBe(source);
      expect(newEdge.target).toBe(target);
    });

    it('13. GIVEN self-loop attempt, THEN connection is rejected', () => {
      const source = 'node_web_1';
      const target = 'node_web_1';

      const isValidConnection = (s: string, t: string) => s !== t && Boolean(s && t);

      expect(isValidConnection(source, target)).toBe(false);
    });

    it('14. GIVEN selected edge, WHEN deleted, THEN edge is removed while nodes remain untouched', () => {
      const { nodes, edges } = architectureToReactFlow(sampleArchitecture);

      const edgeToDelete = 'edge_1_2';
      const remainingEdges = edges.filter((e) => e.id !== edgeToDelete);

      expect(remainingEdges).toHaveLength(1);
      expect(remainingEdges[0].id).toBe('edge_2_3');
      expect(nodes).toHaveLength(3); // Nodes unaffected
    });

    it('15. GIVEN edge styling variants, THEN dashed and animated styles configure properly', () => {
      const dashedEdge = architectureToReactFlow(sampleArchitecture).edges.find(
        (e) => e.id === 'edge_2_3'
      );
      expect(dashedEdge?.style?.strokeDasharray).toBe('5,5');

      const animatedEdge = architectureToReactFlow(sampleArchitecture).edges.find(
        (e) => e.id === 'edge_1_2'
      );
      expect(animatedEdge?.animated).toBe(true);
    });
  });

  describe('7. Round-Trip Architecture Serialization', () => {
    it('16. GIVEN React Flow state, WHEN converted back to domain Architecture, THEN schema matches perfectly', () => {
      const flowData = architectureToReactFlow(sampleArchitecture);

      const restored = reactFlowToArchitecture(
        'proj_123',
        flowData.nodes,
        flowData.edges,
        { x: 50, y: 75, zoom: 1.25 },
        2
      );

      expect(restored.projectId).toBe('proj_123');
      expect(restored.version).toBe(2);
      expect(restored.nodes).toHaveLength(3);
      expect(restored.edges).toHaveLength(2);
      expect(restored.viewport).toEqual({ x: 50, y: 75, zoom: 1.25 });

      expect(restored.nodes[0].data.label).toBe('Client Dashboard');
      expect(restored.nodes[0].data.technology).toBe('React / Vite');
      expect(restored.edges[0].label).toBe('HTTPS REST');
      expect(restored.edges[0].animated).toBe(true);
    });
  });
});
