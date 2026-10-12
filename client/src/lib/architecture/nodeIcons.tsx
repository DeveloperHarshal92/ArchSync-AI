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
 * DESIGN.md v3.0.0 — Canonical Dark Architectural Visual Tokens for Nodes
 * Distinct semantic accents matching input_file_0.png and input_file_1.png
 */
export const NODE_TYPE_VISUALS: Record<ArchitectureNodeType, NodeTypeVisualConfig> = {
  client: {
    icon: Monitor,
    accentColor: '#3B82F6',
    badgeBg: 'bg-[#3B82F6]/15',
    badgeBorder: 'border-[#3B82F6]/40',
    badgeText: 'text-[#60A5FA]',
    glowColor: 'shadow-[#3B82F6]/10',
    borderStyle: 'border-solid',
  },
  'web-app': {
    icon: Globe,
    accentColor: '#3B82F6',
    badgeBg: 'bg-[#3B82F6]/15',
    badgeBorder: 'border-[#3B82F6]/40',
    badgeText: 'text-[#60A5FA]',
    glowColor: 'shadow-[#3B82F6]/10',
    borderStyle: 'border-solid',
  },
  'mobile-app': {
    icon: Smartphone,
    accentColor: '#3B82F6',
    badgeBg: 'bg-[#3B82F6]/15',
    badgeBorder: 'border-dashed border-[#3B82F6]/40',
    badgeText: 'text-[#60A5FA]',
    glowColor: 'shadow-[#3B82F6]/10',
    borderStyle: 'border-dashed',
  },
  'api-gateway': {
    icon: Network,
    accentColor: '#B99D73',
    badgeBg: 'bg-[#B99D73]/15',
    badgeBorder: 'border-[#B99D73]/40',
    badgeText: 'text-[#D6B887]',
    glowColor: 'shadow-[#B99D73]/10',
    borderStyle: 'border-solid',
  },
  server: {
    icon: Server,
    accentColor: '#3B82F6',
    badgeBg: 'bg-[#3B82F6]/15',
    badgeBorder: 'border-[#3B82F6]/40',
    badgeText: 'text-[#60A5FA]',
    glowColor: 'shadow-[#3B82F6]/10',
    borderStyle: 'border-solid',
  },
  microservice: {
    icon: Boxes,
    accentColor: '#3B82F6',
    badgeBg: 'bg-[#3B82F6]/15',
    badgeBorder: 'border-dotted border-[#3B82F6]/40',
    badgeText: 'text-[#60A5FA]',
    glowColor: 'shadow-[#3B82F6]/10',
    borderStyle: 'border-dotted',
  },
  database: {
    icon: Database,
    accentColor: '#38BDF8',
    badgeBg: 'bg-[#38BDF8]/15',
    badgeBorder: 'border-[#38BDF8]/40',
    badgeText: 'text-[#38BDF8]',
    glowColor: 'shadow-[#38BDF8]/10',
    borderStyle: 'border-solid',
  },
  cache: {
    icon: Zap,
    accentColor: '#10B981',
    badgeBg: 'bg-[#10B981]/15',
    badgeBorder: 'border-[#10B981]/40',
    badgeText: 'text-[#34D399]',
    glowColor: 'shadow-[#10B981]/10',
    borderStyle: 'border-solid',
  },
  queue: {
    icon: Layers,
    accentColor: '#F59E0B',
    badgeBg: 'bg-[#F59E0B]/15',
    badgeBorder: 'border-[#F59E0B]/40',
    badgeText: 'text-[#FBBF24]',
    glowColor: 'shadow-[#F59E0B]/10',
    borderStyle: 'border-solid',
  },
  'external-api': {
    icon: CloudUpload,
    accentColor: '#A78BFA',
    badgeBg: 'bg-[#A78BFA]/15',
    badgeBorder: 'border-[#A78BFA]/40',
    badgeText: 'text-[#C4B5FD]',
    glowColor: 'shadow-[#A78BFA]/10',
    borderStyle: 'border-solid',
  },
  'cloud-service': {
    icon: Cloud,
    accentColor: '#B99D73',
    badgeBg: 'bg-[#B99D73]/15',
    badgeBorder: 'border-[#B99D73]/40',
    badgeText: 'text-[#D6B887]',
    glowColor: 'shadow-[#B99D73]/10',
    borderStyle: 'border-solid',
  },
};

export const getNodeVisual = (type: ArchitectureNodeType): NodeTypeVisualConfig => {
  return (
    NODE_TYPE_VISUALS[type] || {
      icon: Server,
      accentColor: '#B99D73',
      badgeBg: 'bg-[#B99D73]/15',
      badgeBorder: 'border-[#B99D73]/30',
      badgeText: 'text-[#D6B887]',
      glowColor: 'shadow-[#B99D73]/5',
      borderStyle: 'border-solid',
    }
  );
};
