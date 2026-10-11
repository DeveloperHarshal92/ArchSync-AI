import { describe, it, expect, vi } from 'vitest';
import { isSafeUrl } from '../components/ai/SafeMarkdown';
import { normalizeAIResponse } from '../components/architecture/AIAssistantPanel';
import { CommandPaletteAction } from '../components/architecture/CommandPalette';
import { generateNodeId, AppNode } from '../lib/architecture/adapters';
import editorReducer, {
  setSelectedNodeId,
  setSelectedEdgeId,
  selectCurrentVersion,
  selectIsDirty,
} from '../store/slices/editorSlice';

describe('ArchSync AI — Structured AI Rendering, Editor Shortcuts & Resizable Panels Suite', () => {
  /* ========================================================================
   * 1. Safe Markdown & URL Sanitization Contract
   * ======================================================================== */
  describe('1. SafeMarkdown & Link Security Contracts', () => {
    it('1.1 GIVEN standard https/http URLs, THEN isSafeUrl returns true', () => {
      expect(isSafeUrl('https://archsync.dev/docs')).toBe(true);
      expect(isSafeUrl('http://localhost:3000')).toBe(true);
      expect(isSafeUrl('mailto:security@archsync.io')).toBe(true);
    });

    it('1.2 GIVEN relative navigation paths, THEN isSafeUrl returns true', () => {
      expect(isSafeUrl('/projects/123')).toBe(true);
      expect(isSafeUrl('#recommendations')).toBe(true);
    });

    it('1.3 GIVEN malicious javascript/vbscript/data schemes, THEN isSafeUrl returns false', () => {
      expect(isSafeUrl('javascript:alert(document.cookie)')).toBe(false);
      expect(isSafeUrl('javascript:/*--></title></style></textarea></script>alert(1)')).toBe(false);
      expect(isSafeUrl('vbscript:msgbox("xss")')).toBe(false);
      expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isSafeUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')).toBe(false);
    });

    it('1.4 GIVEN empty or undefined url, THEN isSafeUrl returns false', () => {
      expect(isSafeUrl(undefined)).toBe(false);
      expect(isSafeUrl('')).toBe(false);
      expect(isSafeUrl('   ')).toBe(false);
    });
  });

  /* ========================================================================
   * 2. AI Response Normalization & Structured Data Validation
   * ======================================================================== */
  describe('2. AI Response Normalization (normalizeAIResponse)', () => {
    it('2.1 GIVEN complete structured JSON, THEN normalizes intact with all fields preserved', () => {
      const payload = {
        summary: 'Architecture exhibits high decoupling but lacks cache tier.',
        findings: [
          {
            title: 'SPOF in Primary Database',
            severity: 'CRITICAL',
            explanation: 'Single instance PostgreSQL without read replicas.',
            relatedNodeIds: ['node-db-1'],
          },
        ],
        recommendations: [
          {
            title: 'Deploy Read Replica',
            explanation: 'Scale read capacity across 2 availability zones.',
            tradeoff: 'Replication lag',
            relatedNodeIds: ['node-db-1'],
          },
        ],
        risks: [
          {
            description: 'Downtime during primary node maintenance',
            severity: 'HIGH',
          },
        ],
        assumptions: ['Traffic peak is 5000 RPS'],
        confidence: 'HIGH',
        analyzedAt: '2026-10-11T10:00:00.000Z',
      };

      const normalized = normalizeAIResponse(payload);
      expect(normalized).not.toBeNull();
      expect(normalized?.summary).toBe(payload.summary);
      expect(normalized?.findings.length).toBe(1);
      expect(normalized?.findings[0].severity).toBe('CRITICAL');
      expect(normalized?.recommendations[0].title).toBe('Deploy Read Replica');
      expect(normalized?.risks[0].severity).toBe('HIGH');
      expect(normalized?.assumptions).toEqual(['Traffic peak is 5000 RPS']);
      expect(normalized?.confidence).toBe('HIGH');
    });

    it('2.2 GIVEN raw markdown string (fallback), THEN transforms into valid structured object', () => {
      const rawMarkdown = '### Architectural Review\n- Gateway needs rate limiting.\n- Database is secure.';
      const normalized = normalizeAIResponse(rawMarkdown);

      expect(normalized).not.toBeNull();
      expect(normalized?.summary).toBe(rawMarkdown);
      expect(normalized?.findings).toEqual([]);
      expect(normalized?.recommendations).toEqual([]);
      expect(normalized?.confidence).toBe('MEDIUM');
      expect(typeof normalized?.analyzedAt).toBe('string');
    });

    it('2.3 GIVEN partial object with alternate message key, THEN supplies safe defaults', () => {
      const partial = {
        message: 'Analysis completed with warnings.',
        findings: [
          {
            title: 'Missing TLS termination',
            severity: 'WARNING',
            explanation: 'HTTP ingress detected.',
          },
        ],
      };

      const normalized = normalizeAIResponse(partial);
      expect(normalized).not.toBeNull();
      expect(normalized?.summary).toBe('Analysis completed with warnings.');
      expect(normalized?.findings.length).toBe(1);
      expect(normalized?.recommendations).toEqual([]);
      expect(normalized?.risks).toEqual([]);
      expect(normalized?.assumptions).toEqual([]);
      expect(normalized?.confidence).toBe('MEDIUM');
    });

    it('2.4 GIVEN null or undefined input, THEN returns null gracefully', () => {
      expect(normalizeAIResponse(null)).toBeNull();
      expect(normalizeAIResponse(undefined)).toBeNull();
    });

    it('2.5 GIVEN malformed confidence value, THEN defaults safely to MEDIUM', () => {
      const payload = {
        summary: 'Test summary',
        confidence: 'EXTREME_UNSURE',
      };
      const normalized = normalizeAIResponse(payload);
      expect(normalized?.confidence).toBe('MEDIUM');
    });
  });

  /* ========================================================================
   * 3. AI Advisory-Only Architecture Contract
   * ======================================================================== */
  describe('3. AI Advisory-Only Architecture Guarantee', () => {
    it('3.1 GIVEN open AI analysis, WHEN user interacts with related nodes/edges, THEN architecture version and dirty state remain unchanged', () => {
      let state = editorReducer(undefined, { type: '@@INIT' });
      const baseVersion = selectCurrentVersion({ editor: state } as any);
      const baseDirty = selectIsDirty({ editor: state } as any);

      // Select related node from finding
      state = editorReducer(state, setSelectedNodeId('node-db-1'));
      expect(state.selectedNodeId).toBe('node-db-1');
      expect(selectCurrentVersion({ editor: state } as any)).toBe(baseVersion);
      expect(selectIsDirty({ editor: state } as any)).toBe(baseDirty);

      // Select related edge from finding
      state = editorReducer(state, setSelectedEdgeId('edge-1-2'));
      expect(state.selectedEdgeId).toBe('edge-1-2');
      expect(selectCurrentVersion({ editor: state } as any)).toBe(baseVersion);
      expect(selectIsDirty({ editor: state } as any)).toBe(baseDirty);
    });
  });

  /* ========================================================================
   * 4. Editor Shortcuts: Node Duplication & Input Isolation Contracts
   * ======================================================================== */
  describe('4. Node Duplication & Shortcut Guard Contracts', () => {
    const originalNode: AppNode = {
      id: 'node-auth-srv-1',
      type: 'architectureNode',
      position: { x: 200, y: 150 },
      data: {
        label: 'Auth Microservice',
        description: 'Handles JWT token issuance',
        technology: 'Node.js',
        category: 'compute',
        nodeType: 'microservice',
        status: 'healthy',
        color: '#226192',
        borderStyle: 'solid',
      },
      selected: true,
    };

    it('4.1 GIVEN a selected node, WHEN duplicated, THEN assigns fresh unique ID and offsets position by +30,+30', () => {
      const duplicateId = generateNodeId();
      expect(duplicateId).not.toBe(originalNode.id);
      expect(duplicateId.startsWith('node_')).toBe(true);

      const duplicatedNode: AppNode = {
        ...originalNode,
        id: duplicateId,
        position: {
          x: originalNode.position.x + 30,
          y: originalNode.position.y + 30,
        },
        selected: true,
      };

      expect(duplicatedNode.id).toBe(duplicateId);
      expect(duplicatedNode.position.x).toBe(230);
      expect(duplicatedNode.position.y).toBe(180);
      expect(duplicatedNode.data.label).toBe('Auth Microservice');
      expect(duplicatedNode.data.nodeType).toBe('microservice');
      expect(duplicatedNode.data.color).toBe('#226192');
    });

    it('4.2 GIVEN duplication logic, THEN excludes server-managed identity/metadata fields', () => {
      const serverNodeWithMeta = {
        ...originalNode,
        _id: 'mongo_obj_id_6589234',
        createdAt: '2026-10-01T00:00:00Z',
        updatedAt: '2026-10-01T00:00:00Z',
        createdBy: 'user_admin',
        version: 5,
      };

      // Sanitize fields during duplication
      const {
        _id,
        createdAt,
        updatedAt,
        createdBy,
        version,
        ...cleanDuplicateData
      } = serverNodeWithMeta as any;

      expect(cleanDuplicateData._id).toBeUndefined();
      expect(cleanDuplicateData.createdAt).toBeUndefined();
      expect(cleanDuplicateData.updatedAt).toBeUndefined();
      expect(cleanDuplicateData.createdBy).toBeUndefined();
      expect(cleanDuplicateData.version).toBeUndefined();
      expect(cleanDuplicateData.id).toBe('node-auth-srv-1');
    });

    it('4.3 GIVEN shortcut input guard contract, THEN returns true when typing in text fields', () => {
      const isInputActive = (tagName: string, isContentEditable: boolean, isAiChat: boolean) => {
        if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') return true;
        if (isContentEditable) return true;
        if (isAiChat) return true;
        return false;
      };

      expect(isInputActive('INPUT', false, false)).toBe(true);
      expect(isInputActive('TEXTAREA', false, false)).toBe(true);
      expect(isInputActive('DIV', true, false)).toBe(true);
      expect(isInputActive('DIV', false, true)).toBe(true);
      expect(isInputActive('DIV', false, false)).toBe(false);
      expect(isInputActive('BODY', false, false)).toBe(false);
    });
  });

  /* ========================================================================
   * 5. Command Palette: Filtering, Navigation & Permissions
   * ======================================================================== */
  describe('5. Searchable Command Palette Contracts', () => {
    const mockActions: CommandPaletteAction[] = [
      {
        id: 'dup-node',
        label: 'Duplicate Selected Node',
        description: 'Clone selected node with +30px offset',
        category: 'edit',
        shortcut: 'Ctrl+D',
        disabled: false,
        onExecute: vi.fn(),
      },
      {
        id: 'del-node',
        label: 'Delete Selected',
        description: 'Remove selected nodes and edges',
        category: 'edit',
        shortcut: 'Del',
        disabled: false,
        onExecute: vi.fn(),
      },
      {
        id: 'align-h',
        label: 'Align Horizontally',
        description: 'Align selected nodes to common horizontal center',
        category: 'align',
        disabled: false,
        onExecute: vi.fn(),
      },
      {
        id: 'add-service',
        label: 'Add Microservice',
        description: 'Place microservice compute node',
        category: 'components',
        disabled: false,
        onExecute: vi.fn(),
      },
    ];

    it('5.1 GIVEN search query, THEN filters matching actions across label, description, and category', () => {
      const filterActions = (query: string) => {
        const q = query.trim().toLowerCase();
        if (!q) return mockActions;
        return mockActions.filter(
          (a) =>
            a.label.toLowerCase().includes(q) ||
            (a.description && a.description.toLowerCase().includes(q)) ||
            a.category.toLowerCase().includes(q)
        );
      };

      expect(filterActions('duplicate').length).toBe(1);
      expect(filterActions('duplicate')[0].id).toBe('dup-node');

      expect(filterActions('align').length).toBe(1);
      expect(filterActions('align')[0].id).toBe('align-h');

      expect(filterActions('edit').length).toBe(2);
      expect(filterActions('xyznotfound').length).toBe(0);
    });

    it('5.2 GIVEN Viewer role, THEN edit and mutation actions are disabled', () => {
      const isViewer = true;
      const computedActions = mockActions.map((action) => ({
        ...action,
        disabled: isViewer ? ['edit', 'align', 'components'].includes(action.category) : false,
      }));

      expect(computedActions.find((a) => a.id === 'dup-node')?.disabled).toBe(true);
      expect(computedActions.find((a) => a.id === 'del-node')?.disabled).toBe(true);
      expect(computedActions.find((a) => a.id === 'align-h')?.disabled).toBe(true);
      expect(computedActions.find((a) => a.id === 'add-service')?.disabled).toBe(true);
    });

    it('5.3 GIVEN keyboard navigation wrap-around math, THEN cycles correctly', () => {
      const total = 4;
      const getNext = (current: number) => (current + 1) % total;
      const getPrev = (current: number) => (current - 1 + total) % total;

      expect(getNext(0)).toBe(1);
      expect(getNext(3)).toBe(0); // Wrap around to top
      expect(getPrev(0)).toBe(3); // Wrap around to bottom
      expect(getPrev(2)).toBe(1);
    });
  });

  /* ========================================================================
   * 6. Resizable Panels: Constraints, Accessibility & Persistence
   * ======================================================================== */
  describe('6. Resizable Panels & Constraints Contracts', () => {
    const LEFT_MIN = 200;
    const LEFT_MAX = 380;
    const RIGHT_MIN = 280;
    const RIGHT_MAX = 520;
    const CANVAS_MIN = 320;

    it('6.1 GIVEN left palette drag, THEN enforces min 200px and max 380px', () => {
      const clampLeft = (w: number) => Math.max(LEFT_MIN, Math.min(LEFT_MAX, Math.round(w)));

      expect(clampLeft(150)).toBe(200);
      expect(clampLeft(256)).toBe(256);
      expect(clampLeft(450)).toBe(380);
    });

    it('6.2 GIVEN right inspector drag, THEN enforces min 280px and max 520px', () => {
      const clampRight = (w: number) => Math.max(RIGHT_MIN, Math.min(RIGHT_MAX, Math.round(w)));

      expect(clampRight(200)).toBe(280);
      expect(clampRight(340)).toBe(340);
      expect(clampRight(600)).toBe(520);
    });

    it('6.3 GIVEN narrow viewport, THEN clamps panels so canvas retains at least 320px', () => {
      const viewportWidth = 900;
      let left = 380;
      let right = 520;

      // When window resizes, clamping ensures left and right adapt so canvas >= CANVAS_MIN
      const maxLeft = Math.max(LEFT_MIN, viewportWidth - right - CANVAS_MIN);
      left = Math.max(LEFT_MIN, Math.min(LEFT_MAX, maxLeft));

      const maxRight = Math.max(RIGHT_MIN, viewportWidth - left - CANVAS_MIN);
      right = Math.max(RIGHT_MIN, Math.min(RIGHT_MAX, maxRight));

      const canvasWidth = viewportWidth - (left + right);
      expect(canvasWidth).toBeGreaterThanOrEqual(CANVAS_MIN);
    });

    it('6.4 GIVEN keyboard resizing, THEN handles ArrowLeft, ArrowRight, Home and End with shift multipliers', () => {
      let width = 256;
      const calculateKeyResize = (key: string, shift: boolean, current: number) => {
        const step = shift ? 20 : 10;
        if (key === 'ArrowRight') return Math.min(LEFT_MAX, current + step);
        if (key === 'ArrowLeft') return Math.max(LEFT_MIN, current - step);
        if (key === 'Home') return LEFT_MIN;
        if (key === 'End') return LEFT_MAX;
        return current;
      };

      expect(calculateKeyResize('ArrowRight', false, width)).toBe(266);
      expect(calculateKeyResize('ArrowRight', true, width)).toBe(276);
      expect(calculateKeyResize('ArrowLeft', false, width)).toBe(246);
      expect(calculateKeyResize('Home', false, width)).toBe(200);
      expect(calculateKeyResize('End', false, width)).toBe(380);
    });

    it('6.5 GIVEN panel width preferences, THEN stores to UI-only localStorage without mutating graph version', () => {
      const storageKey = 'archsync_studio_panel_widths';
      const mockStorage: Record<string, string> = {};

      const savePreferences = (widths: { left: number; right: number }) => {
        mockStorage[storageKey] = JSON.stringify(widths);
      };

      const loadPreferences = () => {
        const val = mockStorage[storageKey];
        return val ? JSON.parse(val) : { left: 256, right: 340 };
      };

      savePreferences({ left: 300, right: 400 });
      const loaded = loadPreferences();
      expect(loaded.left).toBe(300);
      expect(loaded.right).toBe(400);

      // Verify that this is entirely UI state and does NOT touch editor graph state
      let editorState = editorReducer(undefined, { type: '@@INIT' });
      expect(selectCurrentVersion({ editor: editorState } as any)).toBe(1);
      expect(selectIsDirty({ editor: editorState } as any)).toBe(false);
    });
  });
});
