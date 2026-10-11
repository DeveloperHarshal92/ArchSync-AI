import { AppNode } from './adapters';

export interface AlignmentGuide {
  id: string;
  type: 'horizontal' | 'vertical';
  coordinate: number;
  start: number;
  end: number;
}

const DEFAULT_NODE_WIDTH = 220;
const DEFAULT_NODE_HEIGHT = 90;

export const getNodeBounds = (node: AppNode) => {
  const width = node.width || (node.measured?.width ?? DEFAULT_NODE_WIDTH);
  const height = node.height || (node.measured?.height ?? DEFAULT_NODE_HEIGHT);
  const left = node.position.x;
  const right = left + width;
  const centerX = left + width / 2;
  const top = node.position.y;
  const bottom = top + height;
  const centerY = top + height / 2;

  return { left, right, centerX, top, bottom, centerY, width, height };
};

/**
 * Calculates snapping position and visual alignment guides during drag
 */
export const calculateSnapAndGuides = (
  draggedNode: AppNode,
  allNodes: AppNode[],
  threshold = 6
): {
  snappedPosition: { x: number; y: number };
  guides: AlignmentGuide[];
} => {
  const otherNodes = allNodes.filter((n) => n.id !== draggedNode.id);
  const draggedBounds = getNodeBounds(draggedNode);

  let snappedX = draggedNode.position.x;
  let snappedY = draggedNode.position.y;
  const guides: AlignmentGuide[] = [];

  let minDeltaX = threshold + 1;
  let minDeltaY = threshold + 1;

  for (const other of otherNodes) {
    const ob = getNodeBounds(other);

    // Vertical guides (matching X coordinates: Left, Center, Right)
    const xAlignments = [
      { coord: ob.left, offset: 0, label: 'left-to-left' },
      { coord: ob.centerX, offset: draggedBounds.width / 2, label: 'center-to-center' },
      { coord: ob.right, offset: draggedBounds.width, label: 'right-to-right' },
      { coord: ob.right, offset: 0, label: 'left-to-right' },
      { coord: ob.left, offset: draggedBounds.width, label: 'right-to-left' },
    ];

    for (const align of xAlignments) {
      const targetX = align.coord - align.offset;
      const deltaX = Math.abs(draggedNode.position.x - targetX);
      if (deltaX <= threshold && deltaX < minDeltaX) {
        minDeltaX = deltaX;
        snappedX = targetX;

        const minY = Math.min(draggedBounds.top, ob.top) - 20;
        const maxY = Math.max(draggedBounds.bottom, ob.bottom) + 20;

        guides.push({
          id: `v-${other.id}-${align.label}`,
          type: 'vertical',
          coordinate: align.coord,
          start: minY,
          end: maxY,
        });
      }
    }

    // Horizontal guides (matching Y coordinates: Top, Middle, Bottom)
    const yAlignments = [
      { coord: ob.top, offset: 0, label: 'top-to-top' },
      { coord: ob.centerY, offset: draggedBounds.height / 2, label: 'middle-to-middle' },
      { coord: ob.bottom, offset: draggedBounds.height, label: 'bottom-to-bottom' },
      { coord: ob.bottom, offset: 0, label: 'top-to-bottom' },
      { coord: ob.left, offset: draggedBounds.height, label: 'bottom-to-top' },
    ];

    for (const align of yAlignments) {
      const targetY = align.coord - align.offset;
      const deltaY = Math.abs(draggedNode.position.y - targetY);
      if (deltaY <= threshold && deltaY < minDeltaY) {
        minDeltaY = deltaY;
        snappedY = targetY;

        const minX = Math.min(draggedBounds.left, ob.left) - 20;
        const maxX = Math.max(draggedBounds.right, ob.right) + 20;

        guides.push({
          id: `h-${other.id}-${align.label}`,
          type: 'horizontal',
          coordinate: align.coord,
          start: minX,
          end: maxX,
        });
      }
    }
  }

  return {
    snappedPosition: { x: snappedX, y: snappedY },
    guides,
  };
};

/**
 * Aligns selected nodes to their shared bounding edge or center
 */
export const alignSelectedNodes = (
  nodes: AppNode[],
  selectedIds: string[],
  alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
): AppNode[] => {
  if (selectedIds.length < 2) return nodes;

  const selectedNodes = nodes.filter((n) => selectedIds.includes(n.id));
  if (selectedNodes.length < 2) return nodes;

  let minLeft = Infinity;
  let maxRight = -Infinity;
  let minTop = Infinity;
  let maxBottom = -Infinity;

  selectedNodes.forEach((n) => {
    const b = getNodeBounds(n);
    if (b.left < minLeft) minLeft = b.left;
    if (b.right > maxRight) maxRight = b.right;
    if (b.top < minTop) minTop = b.top;
    if (b.bottom > maxBottom) maxBottom = b.bottom;
  });

  const boundingCenterX = minLeft + (maxRight - minLeft) / 2;
  const boundingCenterY = minTop + (maxBottom - minTop) / 2;

  return nodes.map((n) => {
    if (!selectedIds.includes(n.id)) return n;
    const b = getNodeBounds(n);

    let nextX = n.position.x;
    let nextY = n.position.y;

    switch (alignment) {
      case 'left':
        nextX = minLeft;
        break;
      case 'center':
        nextX = boundingCenterX - b.width / 2;
        break;
      case 'right':
        nextX = maxRight - b.width;
        break;
      case 'top':
        nextY = minTop;
        break;
      case 'middle':
        nextY = boundingCenterY - b.height / 2;
        break;
      case 'bottom':
        nextY = maxBottom - b.height;
        break;
    }

    return {
      ...n,
      position: {
        x: Math.round(nextX),
        y: Math.round(nextY),
      },
    };
  });
};

/**
 * Distributes selected nodes with equal space along horizontal or vertical axis
 */
export const distributeSelectedNodes = (
  nodes: AppNode[],
  selectedIds: string[],
  axis: 'horizontal' | 'vertical'
): AppNode[] => {
  if (selectedIds.length < 3) return nodes;

  const targetNodes = nodes.filter((n) => selectedIds.includes(n.id));
  if (targetNodes.length < 3) return nodes;

  if (axis === 'horizontal') {
    const sorted = [...targetNodes].sort((a, b) => a.position.x - b.position.x);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const totalWidthOfNodes = sorted.reduce((sum, n) => sum + getNodeBounds(n).width, 0);
    const totalSpan = getNodeBounds(last).right - getNodeBounds(first).left;
    const availableGap = Math.max(0, (totalSpan - totalWidthOfNodes) / (sorted.length - 1));

    let currentX = first.position.x;
    const positionMap = new Map<string, number>();

    sorted.forEach((n, idx) => {
      if (idx === 0) {
        positionMap.set(n.id, n.position.x);
        currentX += getNodeBounds(n).width + availableGap;
      } else if (idx === sorted.length - 1) {
        positionMap.set(n.id, last.position.x);
      } else {
        positionMap.set(n.id, Math.round(currentX));
        currentX += getNodeBounds(n).width + availableGap;
      }
    });

    return nodes.map((n) => {
      if (positionMap.has(n.id)) {
        return {
          ...n,
          position: { ...n.position, x: positionMap.get(n.id)! },
        };
      }
      return n;
    });
  } else {
    const sorted = [...targetNodes].sort((a, b) => a.position.y - b.position.y);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const totalHeightOfNodes = sorted.reduce((sum, n) => sum + getNodeBounds(n).height, 0);
    const totalSpan = getNodeBounds(last).bottom - getNodeBounds(first).top;
    const availableGap = Math.max(0, (totalSpan - totalHeightOfNodes) / (sorted.length - 1));

    let currentY = first.position.y;
    const positionMap = new Map<string, number>();

    sorted.forEach((n, idx) => {
      if (idx === 0) {
        positionMap.set(n.id, n.position.y);
        currentY += getNodeBounds(n).height + availableGap;
      } else if (idx === sorted.length - 1) {
        positionMap.set(n.id, last.position.y);
      } else {
        positionMap.set(n.id, Math.round(currentY));
        currentY += getNodeBounds(n).height + availableGap;
      }
    });

    return nodes.map((n) => {
      if (positionMap.has(n.id)) {
        return {
          ...n,
          position: { ...n.position, y: positionMap.get(n.id)! },
        };
      }
      return n;
    });
  }
};
