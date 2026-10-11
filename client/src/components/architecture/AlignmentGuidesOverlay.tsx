import React from 'react';
import { ViewportPortal } from '@xyflow/react';
import { AlignmentGuide } from '../../lib/architecture/alignment';

interface AlignmentGuidesOverlayProps {
  guides: AlignmentGuide[];
}

export const AlignmentGuidesOverlay: React.FC<AlignmentGuidesOverlayProps> = ({ guides }) => {
  if (!guides || guides.length === 0) return null;

  return (
    <ViewportPortal>
      <svg
        className="pointer-events-none absolute inset-0 overflow-visible z-50"
        style={{ width: '100%', height: '100%' }}
      >
        {guides.map((g) => {
          if (g.type === 'vertical') {
            return (
              <line
                key={g.id}
                x1={g.coordinate}
                y1={g.start}
                x2={g.coordinate}
                y2={g.end}
                stroke="#ef8557"
                strokeWidth={1.5}
                strokeDasharray="4,4"
              />
            );
          } else {
            return (
              <line
                key={g.id}
                x1={g.start}
                y1={g.coordinate}
                x2={g.end}
                y2={g.coordinate}
                stroke="#ef8557"
                strokeWidth={1.5}
                strokeDasharray="4,4"
              />
            );
          }
        })}
      </svg>
    </ViewportPortal>
  );
};
