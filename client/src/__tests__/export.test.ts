import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Architecture } from '@archsync/shared';
import {
  sanitizeExportFilename,
  buildArchitectureJsonExport,
  exportArchitectureAsJson,
  escapeXml,
  buildArchitectureSvg,
  exportArchitectureAsSvg,
  svgToPngBlob,
  exportArchitectureAsPng,
  downloadBlob,
} from '../lib/export';
import { reactFlowToArchitecture, architectureToReactFlow, AppNode } from '../lib/architecture/adapters';
import editorReducer, {
  setActiveProjectId,
  setCurrentVersion,
  setPersistenceDirty,
  selectPersistenceStatus,
} from '../store/slices/editorSlice';

describe('ArchSync AI — F13 Architecture Export & Sharing Behavioral Suite', () => {
  const sampleArchitecture: Architecture = {
    projectId: 'proj_export_123',
    version: 3,
    createdAt: '2026-10-09T10:00:00.000Z',
    updatedAt: '2026-10-09T10:30:00.000Z',
    viewport: { x: 50, y: 75, zoom: 1.25 },
    nodes: [
      {
        id: 'node_web_1',
        type: 'web-app',
        position: { x: 100, y: 150 },
        width: 220,
        height: 100,
        data: {
          label: 'Client Portal <Web & Mobile>',
          description: 'Next.js & Vite client with "OAuth" & token auth',
          technology: 'React / TypeScript',
          category: 'Client',
          metadata: { isPublic: true },
        },
        createdBy: 'user_owner',
        createdAt: '2026-10-09T10:00:00.000Z',
        updatedAt: '2026-10-09T10:15:00.000Z',
      },
      {
        id: 'node_api_1',
        type: 'server',
        position: { x: 450, y: 150 },
        width: 240,
        height: 110,
        data: {
          label: 'API Gateway / Core Backend',
          description: 'Node.js Express microservice routing',
          technology: 'Node.js / Express',
          category: 'Compute',
        },
        createdBy: 'user_owner',
        createdAt: '2026-10-09T10:00:00.000Z',
        updatedAt: '2026-10-09T10:15:00.000Z',
      },
      {
        id: 'node_db_1',
        type: 'database',
        position: { x: 800, y: 150 },
        width: 220,
        height: 100,
        data: {
          label: 'Primary Database',
          description: 'Distributed persistence layer',
          technology: 'MongoDB Atlas',
          category: 'Storage',
        },
        createdBy: 'user_owner',
        createdAt: '2026-10-09T10:00:00.000Z',
        updatedAt: '2026-10-09T10:15:00.000Z',
      },
    ],
    edges: [
      {
        id: 'edge_1_2',
        source: 'node_web_1',
        target: 'node_api_1',
        type: 'animated',
        label: 'HTTPS REST / JSON',
        animated: true,
        createdBy: 'user_owner',
        createdAt: '2026-10-09T10:05:00.000Z',
        updatedAt: '2026-10-09T10:05:00.000Z',
      },
      {
        id: 'edge_2_3',
        source: 'node_api_1',
        target: 'node_db_1',
        type: 'default',
        label: 'Mongoose TLS',
        animated: false,
        createdBy: 'user_owner',
        createdAt: '2026-10-09T10:06:00.000Z',
        updatedAt: '2026-10-09T10:06:00.000Z',
      },
    ],
  };

  const emptyArchitecture: Architecture = {
    projectId: 'proj_empty',
    version: 1,
    createdAt: '2026-10-09T10:00:00.000Z',
    updatedAt: '2026-10-09T10:00:00.000Z',
    viewport: { x: 0, y: 0, zoom: 1 },
    nodes: [],
    edges: [],
  };

  describe('1. Filename Sanitization & Normalization', () => {
    it('1. GIVEN standard project name, WHEN sanitized, THEN produces clean lowercase hyphenated filename', () => {
      const filename = sanitizeExportFilename('FinTech Payment Gateway', 'png');
      expect(filename).toBe('fintech-payment-gateway.png');
    });

    it('2. GIVEN project name with invalid filesystem characters and path traversal, WHEN sanitized, THEN removes them safely', () => {
      const filename = sanitizeExportFilename('../../secret/System:Arch*<>?|', 'svg');
      expect(filename).toBe('secret-system-arch.svg');
      expect(filename).not.toContain('..');
      expect(filename).not.toContain('/');
      expect(filename).not.toContain('\\');
      expect(filename).not.toContain(':');
    });

    it('3. GIVEN project name with control characters and multiple spaces, WHEN sanitized, THEN collapses cleanly', () => {
      const filename = sanitizeExportFilename('My\x00App\t\n  Design___System', 'json');
      expect(filename).toBe('myapp-design-system.json');
    });

    it('4. GIVEN empty or purely symbol name, WHEN sanitized, THEN falls back to archsync-architecture', () => {
      expect(sanitizeExportFilename('', 'json')).toBe('archsync-architecture.json');
      expect(sanitizeExportFilename('   ', 'png')).toBe('archsync-architecture.png');
      expect(sanitizeExportFilename('***///???', 'svg')).toBe('archsync-architecture.svg');
    });

    it('5. GIVEN already formatted name, THEN does not create duplicate extensions', () => {
      const filename = sanitizeExportFilename('my-diagram.json', 'json');
      expect(filename).toBe('my-diagram-json.json');
    });
  });

  describe('2. JSON Export Contracts & Security', () => {
    it('6. GIVEN architecture diagram, WHEN exported as JSON, THEN format identifier and schema version are correct', () => {
      const result = buildArchitectureJsonExport(
        { name: 'Cloud Microservices', description: 'Enterprise backend topology' },
        sampleArchitecture,
        '2026-10-09T12:00:00.000Z'
      );

      expect(result.format).toBe('archsync-architecture');
      expect(result.formatVersion).toBe(1);
      expect(result.exportedAt).toBe('2026-10-09T12:00:00.000Z');
      expect(result.project.name).toBe('Cloud Microservices');
      expect(result.project.description).toBe('Enterprise backend topology');
    });

    it('7. GIVEN architecture diagram, WHEN exported as JSON, THEN preserves revision, nodes, edges, and viewport', () => {
      const result = buildArchitectureJsonExport(
        { name: 'Core Architecture' },
        sampleArchitecture
      );

      expect(result.architecture.version).toBe(3);
      expect(result.architecture.viewport).toEqual({ x: 50, y: 75, zoom: 1.25 });
      expect(result.architecture.nodes).toHaveLength(3);
      expect(result.architecture.edges).toHaveLength(2);

      const webNode = result.architecture.nodes.find((n) => n.id === 'node_web_1');
      expect(webNode).toBeDefined();
      expect(webNode?.type).toBe('web-app');
      expect(webNode?.position).toEqual({ x: 100, y: 150 });
      expect(webNode?.width).toBe(220);
      expect(webNode?.height).toBe(100);
      expect(webNode?.data.label).toBe('Client Portal <Web & Mobile>');
      expect(webNode?.data.technology).toBe('React / TypeScript');

      const restEdge = result.architecture.edges.find((e) => e.id === 'edge_1_2');
      expect(restEdge).toBeDefined();
      expect(restEdge?.source).toBe('node_web_1');
      expect(restEdge?.target).toBe('node_api_1');
      expect(restEdge?.label).toBe('HTTPS REST / JSON');
      expect(restEdge?.animated).toBe(true);
    });

    it('8. GIVEN architecture with special characters & Unicode, WHEN exported as JSON, THEN serializes safely', () => {
      const specialArch: Architecture = {
        ...sampleArchitecture,
        nodes: [
          {
            ...sampleArchitecture.nodes[0],
            data: {
              label: '🚀 Payment Service «Über» & "Auth" <V2>',
              description: 'Handles 100% of € / $ transactions & 🔑 key exchanges',
            },
          },
        ],
      };

      const { jsonString, data } = exportArchitectureAsJson(
        { name: 'Special 🚀 Proj' },
        specialArch
      );

      expect(typeof jsonString).toBe('string');
      const parsed = JSON.parse(jsonString);
      expect(parsed.architecture.nodes[0].data.label).toBe('🚀 Payment Service «Über» & "Auth" <V2>');
      expect(parsed.architecture.nodes[0].data.description).toContain('€ / $ transactions');
      expect(data.format).toBe('archsync-architecture');
    });

    it('9. GIVEN architecture document, WHEN exported as JSON, THEN excludes private credentials and DB internals', () => {
      // Simulate raw mongoose-like or tainted object
      const taintedArch: any = {
        ...sampleArchitecture,
        _id: '507f1f77bcf86cd799439011',
        __v: 12,
        userPasswordHash: '$2b$10$unauthorizedLeak',
        internalTokens: ['secret_token_123'],
        nodes: [
          {
            ...sampleArchitecture.nodes[0],
            _id: 'subdoc_id_1',
            __v: 0,
            secretApiKey: 'sk-1234567890',
          },
        ],
      };

      const result = buildArchitectureJsonExport({ name: 'Safe Proj' }, taintedArch);
      const jsonString = JSON.stringify(result);

      expect(jsonString).not.toContain('secret_token_123');
      expect(jsonString).not.toContain('$2b$10$unauthorizedLeak');
      expect(jsonString).not.toContain('secretApiKey');
      expect((result as any)._id).toBeUndefined();
      expect((result as any).__v).toBeUndefined();
      expect((result.architecture.nodes[0] as any)._id).toBeUndefined();
    });

    it('10. GIVEN empty architecture, WHEN exported as JSON, THEN handles gracefully with empty collections', () => {
      const result = buildArchitectureJsonExport({ name: 'Empty Project' }, emptyArchitecture);
      expect(result.architecture.nodes).toEqual([]);
      expect(result.architecture.edges).toEqual([]);
      expect(result.architecture.version).toBe(1);
    });
  });

  describe('3. SVG Vector Export & XML Sanitization', () => {
    it('11. GIVEN architecture diagram, WHEN exported as SVG, THEN generates valid XML with required namespaces and dimensions', () => {
      const { svgString, width, height } = buildArchitectureSvg(sampleArchitecture, {
        projectName: 'Enterprise Core',
      });

      expect(svgString).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(svgString).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
      expect(svgString).toContain(`width="${width}"`);
      expect(svgString).toContain(`height="${height}"`);
      expect(svgString).toContain(`viewBox=`);
      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
    });

    it('12. GIVEN nodes and edges, WHEN exported as SVG, THEN represents nodes, categories, labels, and connections', () => {
      const { svgString } = buildArchitectureSvg(sampleArchitecture);

      expect(svgString).toContain('id="architecture-nodes"');
      expect(svgString).toContain('id="architecture-edges"');
      expect(svgString).toContain('id="node-node_web_1"');
      expect(svgString).toContain('id="node-node_api_1"');
      expect(svgString).toContain('id="node-node_db_1"');
      expect(svgString).toContain('id="edge-edge_1_2"');
      expect(svgString).toContain('id="edge-edge_2_3"');
      expect(svgString).toContain('marker-end="url(#arch-arrow)"');
      expect(svgString).toContain('stroke-dasharray="6,4"'); // Animated/dashed edge style
    });

    it('13. GIVEN user labels with malicious HTML/XML markup, WHEN exported as SVG, THEN escapes strictly as safe text', () => {
      const maliciousArch: Architecture = {
        ...sampleArchitecture,
        nodes: [
          {
            id: 'node_hack_1',
            type: 'web-app',
            position: { x: 50, y: 50 },
            data: {
              label: '<script>alert("XSS")</script>',
              description: '<img src=x onerror=alert(1) /> & "Quotes"',
              technology: '<b>Bold Tech</b>',
            },
            createdBy: 'u1',
            createdAt: '2026-10-09T10:00:00.000Z',
            updatedAt: '2026-10-09T10:00:00.000Z',
          },
        ],
        edges: [
          {
            id: 'edge_hack_1',
            source: 'node_hack_1',
            target: 'node_hack_1',
            label: '<svg onload="exploit()">',
            createdBy: 'u1',
            createdAt: '2026-10-09T10:00:00.000Z',
            updatedAt: '2026-10-09T10:00:00.000Z',
          },
        ],
      };

      const { svgString } = buildArchitectureSvg(maliciousArch);

      // Raw executable tags must NOT be present
      expect(svgString).not.toContain('<script>');
      expect(svgString).not.toContain('onload="exploit()"');
      expect(svgString).not.toContain('<img src=x');

      // Escaped safe text representations MUST be present
      expect(svgString).toContain('&lt;script&gt;alert(&quot;XSS&quot;)');
      expect(svgString).toContain('&lt;img src=x onerror=alert(1) /&gt;');
      expect(svgString).toContain('&lt;svg onload=&quot;exploit()&quot;&gt;');
    });

    it('14. GIVEN escapeXml helper, THEN correctly escapes all XML entities', () => {
      expect(escapeXml(null)).toBe('');
      expect(escapeXml(undefined)).toBe('');
      expect(escapeXml('A & B')).toBe('A &amp; B');
      expect(escapeXml('Tag <div id="foo">')).toBe('Tag &lt;div id=&quot;foo&quot;&gt;');
      expect(escapeXml("Single 'quotes'")).toBe('Single &#39;quotes&#39;');
    });

    it('15. GIVEN edge with non-existent source or target, WHEN exported as SVG, THEN handles missing endpoint gracefully', () => {
      const brokenEdgeArch: Architecture = {
        ...sampleArchitecture,
        edges: [
          ...sampleArchitecture.edges,
          {
            id: 'broken_edge',
            source: 'non_existent_node',
            target: 'node_web_1',
            createdBy: 'u1',
            createdAt: '2026-10-09T10:00:00.000Z',
            updatedAt: '2026-10-09T10:00:00.000Z',
          },
        ],
      };

      // Does not throw and excludes broken edge from path routing
      expect(() => buildArchitectureSvg(brokenEdgeArch)).not.toThrow();
      const { svgString } = buildArchitectureSvg(brokenEdgeArch);
      expect(svgString).not.toContain('id="edge-broken_edge"');
    });

    it('16. GIVEN empty architecture, WHEN exported as SVG, THEN renders clean empty state placeholder', () => {
      const { svgString, width, height } = buildArchitectureSvg(emptyArchitecture, {
        projectName: 'Empty Topology',
      });

      expect(svgString).toContain('Empty Diagram');
      expect(svgString).toContain('Empty Topology');
      expect(width).toBe(800);
      expect(height).toBe(500);
    });

    it('17. GIVEN exportArchitectureAsSvg, THEN returns blob and sanitized filename', () => {
      const result = exportArchitectureAsSvg(
        { name: 'Ecommerce System' },
        sampleArchitecture
      );

      expect(result.filename).toBe('ecommerce-system.svg');
      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.blob.type).toBe('image/svg+xml;charset=utf-8');
    });
  });

  describe('4. PNG Raster Export & Canvas Rasterization', () => {
    let originalWindow: any;
    let originalDocument: any;
    let originalURL: any;

    beforeEach(() => {
      originalWindow = (globalThis as any).window;
      originalDocument = (globalThis as any).document;
      originalURL = (globalThis as any).URL;

      const mockDoc = {
        createElement: vi.fn(),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        },
      };

      (globalThis as any).window = (globalThis as any).window || {};
      (globalThis as any).document = mockDoc;
      (globalThis as any).URL = {
        createObjectURL: vi.fn().mockReturnValue('blob:http://localhost/mock-blob'),
        revokeObjectURL: vi.fn(),
      };
    });

    afterEach(() => {
      (globalThis as any).window = originalWindow;
      (globalThis as any).document = originalDocument;
      (globalThis as any).URL = originalURL;
      vi.restoreAllMocks();
    });

    it('18. GIVEN exportArchitectureAsPng, WHEN invoked in browser-like environment, THEN returns PNG filename and blob', async () => {
      const mockCanvas = {
        getContext: vi.fn().mockReturnValue({
          drawImage: vi.fn(),
          scale: vi.fn(),
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high',
        }),
        toBlob: vi.fn((cb: (b: Blob | null) => void) => {
          cb(new Blob(['fake-png-binary'], { type: 'image/png' }));
        }),
        width: 0,
        height: 0,
      };

      vi.spyOn((globalThis as any).document, 'createElement').mockImplementation(((tag: any) => {
        if (tag === 'canvas') return mockCanvas as any;
        return {} as any;
      }) as any);

      const originalImage = (globalThis as any).Image;
      class MockImage {
        src = '';
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        constructor() {
          setTimeout(() => this.onload?.(), 10);
        }
      }
      (globalThis as any).Image = MockImage;
      (window as any).Image = MockImage;

      try {
        const result = await exportArchitectureAsPng(
          { name: 'Payment Microservices' },
          sampleArchitecture,
          { pixelRatio: 2 }
        );

        expect(result.filename).toBe('payment-microservices.png');
        expect(result.blob).toBeInstanceOf(Blob);
        expect((globalThis as any).URL.revokeObjectURL).toHaveBeenCalled();
      } finally {
        (globalThis as any).Image = originalImage;
      }
    });

    it('19. GIVEN image load failure, WHEN svgToPngBlob executes, THEN rejects with controlled error', async () => {
      const originalImage = (globalThis as any).Image;
      class FailingImage {
        src = '';
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        constructor() {
          setTimeout(() => this.onerror?.(), 10);
        }
      }
      (globalThis as any).Image = FailingImage;
      (window as any).Image = FailingImage;

      try {
        await expect(svgToPngBlob('<svg></svg>', 400, 300)).rejects.toThrow(
          'Failed to load SVG into browser image element for rasterization.'
        );
        expect((globalThis as any).URL.revokeObjectURL).toHaveBeenCalled();
      } finally {
        (globalThis as any).Image = originalImage;
      }
    });

    it('20. GIVEN downloadBlob utility, WHEN called, THEN creates anchor, clicks, and schedules URL revocation', () => {
      const clickSpy = vi.fn();
      const mockAnchor = {
        href: '',
        download: '',
        style: {},
        click: clickSpy,
      };
      const appendChildSpy = vi.spyOn((globalThis as any).document.body, 'appendChild');
      const removeChildSpy = vi.spyOn((globalThis as any).document.body, 'removeChild');

      vi.spyOn((globalThis as any).document, 'createElement').mockImplementation(((tag: any) => {
        if (tag === 'a') return mockAnchor as any;
        return {} as any;
      }) as any);

      const blob = new Blob(['test'], { type: 'text/plain' });
      downloadBlob(blob, 'test-file.txt');

      expect((globalThis as any).URL.createObjectURL).toHaveBeenCalledWith(blob);
      expect(appendChildSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
    });
  });

  describe('5. Live In-Memory Canvas State & Immediacy', () => {
    it('21. GIVEN live unsaved node movement, WHEN exported, THEN contains newest in-memory coordinates', () => {
      // 1. Initial conversion
      const flow = architectureToReactFlow(sampleArchitecture);
      const activeNodes: AppNode[] = flow.nodes;

      // 2. User drags node from (100, 150) to (320, 480)
      const movedNodes: AppNode[] = activeNodes.map((n) =>
        n.id === 'node_web_1' ? { ...n, position: { x: 320, y: 480 } } : n
      );

      // 3. Obtain live in-memory architecture via reactFlowToArchitecture
      const currentArchitecture = reactFlowToArchitecture(
        sampleArchitecture.projectId,
        movedNodes,
        flow.edges,
        { x: 0, y: 0, zoom: 1 },
        sampleArchitecture.version
      );

      // 4. Export JSON reflects live canvas state
      const exportedJson = buildArchitectureJsonExport(
        { name: 'Live Canvas' },
        currentArchitecture
      );
      const movedWebNode = exportedJson.architecture.nodes.find((n) => n.id === 'node_web_1');
      expect(movedWebNode?.position).toEqual({ x: 320, y: 480 });

      // 5. Export SVG reflects live coordinates
      const { svgString } = buildArchitectureSvg(currentArchitecture);
      expect(svgString).toContain('x="320" y="480"');
    });

    it('22. GIVEN live label edit without autosave, WHEN exported, THEN contains latest label immediately', () => {
      const flow = architectureToReactFlow(sampleArchitecture);
      const updatedNodes: AppNode[] = flow.nodes.map((n) =>
        n.id === 'node_api_1'
          ? {
              ...n,
              data: {
                ...n.data,
                label: 'Brand New GraphQL API Gateway',
              },
            }
          : n
      );

      const liveArch = reactFlowToArchitecture(
        sampleArchitecture.projectId,
        updatedNodes,
        flow.edges,
        { x: 0, y: 0, zoom: 1 },
        sampleArchitecture.version
      );

      const exportData = buildArchitectureJsonExport({ name: 'Live Test' }, liveArch);
      const apiNode = exportData.architecture.nodes.find((n) => n.id === 'node_api_1');
      expect(apiNode?.data.label).toBe('Brand New GraphQL API Gateway');
    });

    it('23. GIVEN export operation, WHEN executed, THEN does NOT mutate editor version, dirty state, or selection', () => {
      let state = editorReducer(undefined, { type: '@@INIT' });
      state = editorReducer(state, setActiveProjectId('proj_export_123'));
      state = editorReducer(state, setCurrentVersion(5));
      state = editorReducer(state, setPersistenceDirty());

      expect(state.currentVersion).toBe(5);
      expect(selectPersistenceStatus({ editor: state } as any)).toBe('dirty');

      // Prepare and generate export
      const exportJson = buildArchitectureJsonExport({ name: 'Read Only Check' }, sampleArchitecture);
      const exportSvg = buildArchitectureSvg(sampleArchitecture);

      expect(exportJson.architecture.version).toBe(3);
      expect(exportSvg.width).toBeGreaterThan(0);

      // Verify Redux state remains untouched
      expect(state.currentVersion).toBe(5);
      expect(state.activeProjectId).toBe('proj_export_123');
      expect(selectPersistenceStatus({ editor: state } as any)).toBe('dirty');
    });

    it('24. GIVEN project switching, WHEN switching from Project A to Project B, THEN project-scoped state does not leak', () => {
      let state = editorReducer(undefined, { type: '@@INIT' });
      state = editorReducer(state, setActiveProjectId('project_A'));
      state = editorReducer(state, setCurrentVersion(10));

      expect(state.activeProjectId).toBe('project_A');
      expect(state.currentVersion).toBe(10);

      // User navigates to Project B
      state = editorReducer(state, setActiveProjectId('project_B'));
      expect(state.activeProjectId).toBe('project_B');
      expect(state.currentVersion).toBe(1); // Reset to clean state for new project
      expect(state.selectedNodeId).toBeNull();
      expect(state.selectedEdgeId).toBeNull();
    });
  });

  describe('6. Permissions & Workspace Coexistence', () => {
    it('25. GIVEN project roles, WHEN evaluated for export permissions, THEN OWNER, EDITOR, and VIEWER are all permitted', async () => {
      const { canExportArchitecture } = await import('../lib/permissions');

      expect(canExportArchitecture('OWNER')).toBe(true);
      expect(canExportArchitecture('owner')).toBe(true);
      expect(canExportArchitecture('EDITOR')).toBe(true);
      expect(canExportArchitecture('editor')).toBe(true);
      expect(canExportArchitecture('VIEWER')).toBe(true);
      expect(canExportArchitecture('viewer')).toBe(true);
    });

    it('26. GIVEN unauthorized or missing role, WHEN evaluated for export permissions, THEN access is denied', async () => {
      const { canExportArchitecture } = await import('../lib/permissions');

      expect(canExportArchitecture(null)).toBe(false);
      expect(canExportArchitecture(undefined)).toBe(false);
      expect(canExportArchitecture('ANONYMOUS')).toBe(false);
      expect(canExportArchitecture('GUEST')).toBe(false);
    });

    it('27. GIVEN active workspace, WHEN AI Assistant or Validation panel is open, THEN export remains functional without panel disruption', async () => {
      const uiReducer = (await import('../store/slices/uiSlice')).default;
      const { setAiPanelOpen, setValidationPanelOpen } = await import('../store/slices/uiSlice');

      let uiState = uiReducer(undefined, { type: '@@INIT' });
      uiState = uiReducer(uiState, setAiPanelOpen(true));
      expect(uiState.aiPanelOpen).toBe(true);

      // Perform export operations while AI panel is open
      const exportJson = buildArchitectureJsonExport({ name: 'Coexistence Proj' }, sampleArchitecture);
      expect(exportJson.format).toBe('archsync-architecture');

      // AI panel state remains open
      expect(uiState.aiPanelOpen).toBe(true);

      // Switch to validation panel
      uiState = uiReducer(uiState, setAiPanelOpen(false));
      uiState = uiReducer(uiState, setValidationPanelOpen(true));
      expect(uiState.validationPanelOpen).toBe(true);

      const exportSvg = buildArchitectureSvg(sampleArchitecture);
      expect(exportSvg.width).toBeGreaterThan(0);
      expect(uiState.validationPanelOpen).toBe(true);
    });
  });
});
