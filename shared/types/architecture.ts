/**
 * Architecture domain types contract matching RULES.md Section 4 & Epic F06
 */

export type ArchitectureNodeType =
  | 'client'
  | 'web-app'
  | 'mobile-app'
  | 'api-gateway'
  | 'server'
  | 'microservice'
  | 'database'
  | 'cache'
  | 'queue'
  | 'external-api'
  | 'cloud-service';

export interface ArchitectureNodeTypeDefinition {
  type: ArchitectureNodeType;
  label: string;
  description: string;
  category: string;
}

export const NODE_CATALOG: Record<ArchitectureNodeType, ArchitectureNodeTypeDefinition> = {
  'client': {
    type: 'client',
    label: 'Client',
    description: 'Generic client device or end-user workstation',
    category: 'Client',
  },
  'web-app': {
    type: 'web-app',
    label: 'Web Application',
    description: 'Single-page or server-rendered browser web application',
    category: 'Client',
  },
  'mobile-app': {
    type: 'mobile-app',
    label: 'Mobile Application',
    description: 'Native or hybrid iOS/Android mobile application',
    category: 'Client',
  },
  'api-gateway': {
    type: 'api-gateway',
    label: 'API Gateway',
    description: 'Reverse proxy, routing, and rate-limiting gateway',
    category: 'Networking',
  },
  'server': {
    type: 'server',
    label: 'Server',
    description: 'Monolith or general backend application server',
    category: 'Compute',
  },
  'microservice': {
    type: 'microservice',
    label: 'Microservice',
    description: 'Isolated domain-specific microservice component',
    category: 'Compute',
  },
  'database': {
    type: 'database',
    label: 'Database',
    description: 'Relational or non-relational persistent database',
    category: 'Storage',
  },
  'cache': {
    type: 'cache',
    label: 'Cache',
    description: 'In-memory cache store (e.g., Redis, Memcached)',
    category: 'Storage',
  },
  'queue': {
    type: 'queue',
    label: 'Message Queue',
    description: 'Asynchronous event stream or message broker (e.g., Kafka, RabbitMQ)',
    category: 'Messaging',
  },
  'external-api': {
    type: 'external-api',
    label: 'External API',
    description: 'Third-party SaaS or external integration endpoint',
    category: 'Integration',
  },
  'cloud-service': {
    type: 'cloud-service',
    label: 'Cloud Service',
    description: 'Managed cloud resource (e.g., S3, Lambda, Cloudflare)',
    category: 'Cloud',
  },
};

export const ARCHITECTURE_NODE_TYPES: ArchitectureNodeType[] = Object.keys(
  NODE_CATALOG
) as ArchitectureNodeType[];

export interface ArchitectureNodeData {
  label: string;
  description?: string;
  technology?: string;
  category?: string;
  metadata?: Record<string, unknown>;
}

export interface ArchitectureNodePosition {
  x: number;
  y: number;
}

export interface ArchitectureNode {
  id: string;
  type: ArchitectureNodeType;
  position: ArchitectureNodePosition;
  width?: number;
  height?: number;
  data: ArchitectureNodeData;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type EdgeType = 'default' | 'animated' | 'dashed';
export const ARCHITECTURE_EDGE_TYPES: EdgeType[] = ['default', 'animated', 'dashed'];

export interface ArchitectureEdge {
  id: string;
  source: string;
  target: string;
  type?: EdgeType;
  label?: string;
  animated?: boolean;
  metadata?: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArchitectureViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface Architecture {
  projectId: string;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  viewport: ArchitectureViewport;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export type ValidationSeverity = 'ERROR' | 'WARNING' | 'INFO';

export type ValidationCode =
  | 'DISCONNECTED_NODE'
  | 'INVALID_EDGE'
  | 'INVALID_NODE'
  | 'MISSING_CONNECTION'
  | 'CIRCULAR_DEPENDENCY'
  | 'MISSING_CONFIGURATION';

export interface ValidationIssue {
  id: string;
  code: ValidationCode;
  severity: ValidationSeverity;
  message: string;
  nodeIds?: string[];
  edgeIds?: string[];
}

export interface ArchitectureValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  validatedAt: string;
}

export interface UpdateArchitectureRequest {
  nodes: Array<{
    id: string;
    type: ArchitectureNodeType;
    position: ArchitectureNodePosition;
    width?: number;
    height?: number;
    data: ArchitectureNodeData;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type?: EdgeType;
    label?: string;
    animated?: boolean;
    metadata?: Record<string, unknown>;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
  }>;
  viewport: ArchitectureViewport;
  version: number;
}

export interface ArchitectureResponseData {
  architecture: Architecture;
  validation?: ArchitectureValidationResult;
}

// Backward compatibility aliases
export type ComponentType = ArchitectureNodeType;
export interface ArchitectureNodeMeta {
  id: string;
  label: string;
  type: ArchitectureNodeType;
}
