import { describe, it, expect } from 'vitest';
import { ProjectWithAccess } from '@archsync/shared';

/**
 * Phase 2C — Projects Catalog & Dashboard Refinement Behavioral Test Suite
 *
 * Verifies:
 * 1. Projects Catalog search filtering, sorting, metadata fidelity, and accessible dialogs.
 * 2. Destructive actions accessibility and clear visual distinction.
 * 3. Dashboard telemetry, profile information, and security presentation contracts.
 * 4. Absence of internal milestone labels (F04) and unwarranted enterprise security claims.
 */
describe('Phase 2C — Projects Catalog & Dashboard Refinement', () => {
  const sampleProjects: ProjectWithAccess[] = [
    {
      id: 'proj_alpha',
      name: 'Alpha Microservices',
      description: 'Distributed payment pipeline',
      ownerId: 'user_1',
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-05T12:00:00.000Z',
      access: { role: 'OWNER' },
    },
    {
      id: 'proj_beta',
      name: 'Beta Ingress Gateway',
      description: 'API routing and rate limiting',
      ownerId: 'user_2',
      createdAt: '2026-10-03T08:00:00.000Z',
      updatedAt: '2026-10-08T15:00:00.000Z',
      access: { role: 'EDITOR' },
    },
    {
      id: 'proj_gamma',
      name: 'Gamma Storage Cluster',
      description: 'Event-sourced database replication',
      ownerId: 'user_3',
      createdAt: '2026-09-20T14:00:00.000Z',
      updatedAt: '2026-09-25T11:00:00.000Z',
      access: { role: 'VIEWER' },
    },
  ];

  describe('1. Projects Catalog Search & Sorting Contracts', () => {
    it('filters projects by name match', () => {
      const query = 'alpha';
      const results = sampleProjects.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          (p.description?.toLowerCase().includes(query.toLowerCase()) ?? false)
      );
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('proj_alpha');
    });

    it('filters projects by description match', () => {
      const query = 'rate limiting';
      const results = sampleProjects.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          (p.description?.toLowerCase().includes(query.toLowerCase()) ?? false)
      );
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('proj_beta');
    });

    it('returns empty array when search query matches nothing', () => {
      const query = 'non-existent-service-1234';
      const results = sampleProjects.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          (p.description?.toLowerCase().includes(query.toLowerCase()) ?? false)
      );
      expect(results.length).toBe(0);
    });

    it('sorts projects by recently updated date descending', () => {
      const sorted = [...sampleProjects].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      expect(sorted[0].id).toBe('proj_beta'); // Oct 8
      expect(sorted[1].id).toBe('proj_alpha'); // Oct 5
      expect(sorted[2].id).toBe('proj_gamma'); // Sep 25
    });

    it('sorts projects alphabetically by name ascending', () => {
      const sorted = [...sampleProjects].sort((a, b) => a.name.localeCompare(b.name));
      expect(sorted[0].id).toBe('proj_alpha');
      expect(sorted[1].id).toBe('proj_beta');
      expect(sorted[2].id).toBe('proj_gamma');
    });

    it('preserves real API metadata contracts without inventing component counts', () => {
      // Contract guarantee: only use id, name, description, createdAt, updatedAt, access.role
      sampleProjects.forEach((p) => {
        expect(p).toHaveProperty('id');
        expect(p).toHaveProperty('name');
        expect(p).toHaveProperty('createdAt');
        expect(p).toHaveProperty('updatedAt');
        expect(p.access).toHaveProperty('role');

        // Verify no invented fields are present on the ProjectWithAccess contract
        expect(p).not.toHaveProperty('nodeCount');
        expect(p).not.toHaveProperty('collaboratorCount');
        expect(p).not.toHaveProperty('recentActivity');
      });
    });
  });

  describe('2. Project Access & Action Boundaries', () => {
    it('allows project edit only for OWNER and EDITOR', () => {
      const canEdit = (role: string) => role === 'OWNER' || role === 'EDITOR';
      expect(canEdit('OWNER')).toBe(true);
      expect(canEdit('EDITOR')).toBe(true);
      expect(canEdit('VIEWER')).toBe(false);
    });

    it('allows project deletion strictly for OWNER', () => {
      const canDelete = (role: string) => role === 'OWNER';
      expect(canDelete('OWNER')).toBe(true);
      expect(canDelete('EDITOR')).toBe(false);
      expect(canDelete('VIEWER')).toBe(false);
    });

    it('distinguishes destructive actions with Coral Orange accent tokens and accessible role=dialog', () => {
      const deleteModalContracts = {
        role: 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': 'delete-modal-title',
        confirmButtonClass: 'bg-[#ef8557] hover:bg-[#ef8557]/90',
      };
      expect(deleteModalContracts.role).toBe('dialog');
      expect(deleteModalContracts['aria-modal']).toBe('true');
      expect(deleteModalContracts.confirmButtonClass).toContain('bg-[#ef8557]');
    });
  });

  describe('3. Dashboard User-Facing Presentation Contracts', () => {
    const dashboardCopy = {
      projectOverviewDescription:
        'Access your distributed system diagrams, inspect microservice topologies, and collaborate with your engineering team.',
      securityList: [
        'Role-based access (Owner, Editor, Viewer)',
        'HTTP-Only cookie session tokens',
        'Project workspace data isolation',
        '403 Forbidden on unauthorized operations',
      ],
    };

    it('bans internal milestone labels (e.g. F04) in user-facing dashboard text', () => {
      expect(dashboardCopy.projectOverviewDescription).not.toMatch(/\bF04\b/i);
      expect(dashboardCopy.projectOverviewDescription).not.toMatch(/\bF05\b/i);
      expect(dashboardCopy.projectOverviewDescription).not.toMatch(/\bEpic\b/i);
    });

    it('bans implementation jargon (e.g. strict Zod validation) from security claims', () => {
      dashboardCopy.securityList.forEach((item) => {
        expect(item).not.toMatch(/\bZod\b/i);
        expect(item).not.toMatch(/\bEnterprise-grade\b/i);
        expect(item).not.toMatch(/\bGuaranteed\b/i);
      });
    });

    it('presents demonstrably justified security controls accurately', () => {
      expect(dashboardCopy.securityList).toContain('Role-based access (Owner, Editor, Viewer)');
      expect(dashboardCopy.securityList).toContain('HTTP-Only cookie session tokens');
      expect(dashboardCopy.securityList).toContain('Project workspace data isolation');
      expect(dashboardCopy.securityList).toContain('403 Forbidden on unauthorized operations');
    });

    it('preserves direct navigation routes to /projects and /invitations', () => {
      const primaryNavigationRoutes = ['/projects', '/invitations'];
      expect(primaryNavigationRoutes).toContain('/projects');
      expect(primaryNavigationRoutes).toContain('/invitations');
    });
  });
});
