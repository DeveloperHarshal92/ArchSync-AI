import React from 'react';
import {
  Monitor,
  Globe,
  Smartphone,
  Network,
  Server,
  Boxes,
  Database,
  Zap,
  Layers,
  CloudUpload,
  Cloud,
} from 'lucide-react';
import { ArchitectureNodeType } from '@archsync/shared';

export interface NodeTypeVisualConfig {
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  glowColor: string;
}

export const NODE_TYPE_VISUALS: Record<ArchitectureNodeType, NodeTypeVisualConfig> = {
  client: {
    icon: Monitor,
    accentColor: '#38bdf8', // sky-400
    badgeBg: 'bg-sky-500/10',
    badgeBorder: 'border-sky-500/30',
    badgeText: 'text-sky-400',
    glowColor: 'shadow-sky-500/10',
  },
  'web-app': {
    icon: Globe,
    accentColor: '#06b6d4', // cyan-500
    badgeBg: 'bg-cyan-500/10',
    badgeBorder: 'border-cyan-500/30',
    badgeText: 'text-cyan-400',
    glowColor: 'shadow-cyan-500/10',
  },
  'mobile-app': {
    icon: Smartphone,
    accentColor: '#3b82f6', // blue-500
    badgeBg: 'bg-blue-500/10',
    badgeBorder: 'border-blue-500/30',
    badgeText: 'text-blue-400',
    glowColor: 'shadow-blue-500/10',
  },
  'api-gateway': {
    icon: Network,
    accentColor: '#a855f7', // purple-500
    badgeBg: 'bg-purple-500/10',
    badgeBorder: 'border-purple-500/30',
    badgeText: 'text-purple-400',
    glowColor: 'shadow-purple-500/10',
  },
  server: {
    icon: Server,
    accentColor: '#6366f1', // indigo-500
    badgeBg: 'bg-indigo-500/10',
    badgeBorder: 'border-indigo-500/30',
    badgeText: 'text-indigo-400',
    glowColor: 'shadow-indigo-500/10',
  },
  microservice: {
    icon: Boxes,
    accentColor: '#8b5cf6', // violet-500
    badgeBg: 'bg-violet-500/10',
    badgeBorder: 'border-violet-500/30',
    badgeText: 'text-violet-400',
    glowColor: 'shadow-violet-500/10',
  },
  database: {
    icon: Database,
    accentColor: '#10b981', // emerald-500
    badgeBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/30',
    badgeText: 'text-emerald-400',
    glowColor: 'shadow-emerald-500/10',
  },
  cache: {
    icon: Zap,
    accentColor: '#f59e0b', // amber-500
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/30',
    badgeText: 'text-amber-400',
    glowColor: 'shadow-amber-500/10',
  },
  queue: {
    icon: Layers,
    accentColor: '#f97316', // orange-500
    badgeBg: 'bg-orange-500/10',
    badgeBorder: 'border-orange-500/30',
    badgeText: 'text-orange-400',
    glowColor: 'shadow-orange-500/10',
  },
  'external-api': {
    icon: CloudUpload,
    accentColor: '#f43f5e', // rose-500
    badgeBg: 'bg-rose-500/10',
    badgeBorder: 'border-rose-500/30',
    badgeText: 'text-rose-400',
    glowColor: 'shadow-rose-500/10',
  },
  'cloud-service': {
    icon: Cloud,
    accentColor: '#14b8a6', // teal-500
    badgeBg: 'bg-teal-500/10',
    badgeBorder: 'border-teal-500/30',
    badgeText: 'text-teal-400',
    glowColor: 'shadow-teal-500/10',
  },
};

export const getNodeVisual = (type: ArchitectureNodeType): NodeTypeVisualConfig => {
  return (
    NODE_TYPE_VISUALS[type] || {
      icon: Server,
      accentColor: '#94a3b8',
      badgeBg: 'bg-slate-500/10',
      badgeBorder: 'border-slate-500/30',
      badgeText: 'text-slate-400',
      glowColor: 'shadow-slate-500/10',
    }
  );
};
