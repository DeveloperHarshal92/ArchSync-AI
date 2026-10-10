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
  borderStyle?: string;
}

/**
 * Strict Brand Color Restriction (Warm Ivory #eae6ed, Deep Editorial Blue #226192, Coral Orange #ef8557).
 * Categories are differentiated through distinct Lucide icons, labels, border styles, and opacities.
 */
export const NODE_TYPE_VISUALS: Record<ArchitectureNodeType, NodeTypeVisualConfig> = {
  client: {
    icon: Monitor,
    accentColor: '#226192',
    badgeBg: 'bg-[#226192]/10',
    badgeBorder: 'border-[#226192]/25',
    badgeText: 'text-[#226192]',
    glowColor: 'shadow-[#226192]/5',
    borderStyle: 'border-solid',
  },
  'web-app': {
    icon: Globe,
    accentColor: '#ef8557',
    badgeBg: 'bg-[#ef8557]/15',
    badgeBorder: 'border-[#ef8557]/40',
    badgeText: 'text-[#ef8557]',
    glowColor: 'shadow-[#ef8557]/5',
    borderStyle: 'border-solid',
  },
  'mobile-app': {
    icon: Smartphone,
    accentColor: '#226192',
    badgeBg: 'bg-[#226192]/10',
    badgeBorder: 'border-dashed border-[#226192]/35',
    badgeText: 'text-[#226192]',
    glowColor: 'shadow-[#226192]/5',
    borderStyle: 'border-dashed',
  },
  'api-gateway': {
    icon: Network,
    accentColor: '#ef8557',
    badgeBg: 'bg-[#ef8557]/15',
    badgeBorder: 'border-double border-2 border-[#ef8557]/50',
    badgeText: 'text-[#ef8557]',
    glowColor: 'shadow-[#ef8557]/5',
    borderStyle: 'border-double border-2',
  },
  server: {
    icon: Server,
    accentColor: '#226192',
    badgeBg: 'bg-[#226192]/10',
    badgeBorder: 'border-[#226192]/30',
    badgeText: 'text-[#226192]',
    glowColor: 'shadow-[#226192]/5',
    borderStyle: 'border-solid',
  },
  microservice: {
    icon: Boxes,
    accentColor: '#226192',
    badgeBg: 'bg-[#226192]/10',
    badgeBorder: 'border-dotted border-[#226192]/35',
    badgeText: 'text-[#226192]',
    glowColor: 'shadow-[#226192]/5',
    borderStyle: 'border-dotted',
  },
  database: {
    icon: Database,
    accentColor: '#ef8557',
    badgeBg: 'bg-[#ef8557]/15',
    badgeBorder: 'border-[#ef8557]/40',
    badgeText: 'text-[#ef8557]',
    glowColor: 'shadow-[#ef8557]/5',
    borderStyle: 'border-solid',
  },
  cache: {
    icon: Zap,
    accentColor: '#ef8557',
    badgeBg: 'bg-[#ef8557]/20',
    badgeBorder: 'border-dashed border-[#ef8557]/50',
    badgeText: 'text-[#ef8557]',
    glowColor: 'shadow-[#ef8557]/5',
    borderStyle: 'border-dashed',
  },
  queue: {
    icon: Layers,
    accentColor: '#226192',
    badgeBg: 'bg-[#226192]/10',
    badgeBorder: 'border-double border-2 border-[#226192]/40',
    badgeText: 'text-[#226192]',
    glowColor: 'shadow-[#226192]/5',
    borderStyle: 'border-double border-2',
  },
  'external-api': {
    icon: CloudUpload,
    accentColor: '#ef8557',
    badgeBg: 'bg-[#ef8557]/15',
    badgeBorder: 'border-dotted border-[#ef8557]/50',
    badgeText: 'text-[#ef8557]',
    glowColor: 'shadow-[#ef8557]/5',
    borderStyle: 'border-dotted',
  },
  'cloud-service': {
    icon: Cloud,
    accentColor: '#226192',
    badgeBg: 'bg-[#226192]/10',
    badgeBorder: 'border-[#226192]/25',
    badgeText: 'text-[#226192]',
    glowColor: 'shadow-[#226192]/5',
    borderStyle: 'border-solid',
  },
};

export const getNodeVisual = (type: ArchitectureNodeType): NodeTypeVisualConfig => {
  return (
    NODE_TYPE_VISUALS[type] || {
      icon: Server,
      accentColor: '#226192',
      badgeBg: 'bg-[#226192]/10',
      badgeBorder: 'border-[#226192]/25',
      badgeText: 'text-[#226192]',
      glowColor: 'shadow-[#226192]/5',
      borderStyle: 'border-solid',
    }
  );
};
