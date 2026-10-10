/**
 * Pure, client-side permission evaluation helpers matching F05 & F08 specifications.
 * Backend authorization remains the ultimate authority; these helpers power UI state and access gating.
 */

export function normalizeRole(role?: string | null): 'owner' | 'editor' | 'viewer' | null {
  if (!role) return null;
  const r = role.toLowerCase().trim();
  if (r === 'owner' || r === 'editor' || r === 'viewer') {
    return r;
  }
  return null;
}

export function canViewProject(role?: string | null): boolean {
  const normalized = normalizeRole(role);
  return normalized === 'owner' || normalized === 'editor' || normalized === 'viewer';
}

export function canEditProject(role?: string | null): boolean {
  const normalized = normalizeRole(role);
  return normalized === 'owner' || normalized === 'editor';
}

export function canManageMembers(role?: string | null): boolean {
  const normalized = normalizeRole(role);
  return normalized === 'owner';
}

export function canDeleteProject(role?: string | null): boolean {
  const normalized = normalizeRole(role);
  return normalized === 'owner';
}

export function canEditArchitecture(role?: string | null): boolean {
  const normalized = normalizeRole(role);
  return normalized === 'owner' || normalized === 'editor';
}

export function canExportArchitecture(role?: string | null): boolean {
  const normalized = normalizeRole(role);
  return normalized === 'owner' || normalized === 'editor' || normalized === 'viewer';
}
