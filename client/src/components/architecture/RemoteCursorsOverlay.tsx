import React from 'react';
import { useAppSelector } from '../../store/hooks';
import { selectCollaborators } from '../../store/slices/collaborationSlice';

const CURSOR_COLORS = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#3b82f6', // Blue
];

function getCursorColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

export const RemoteCursorsOverlay: React.FC = () => {
  const collaborators = useAppSelector(selectCollaborators);

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {collaborators.map((c) => {
        if (!c.cursor) return null;

        const color = getCursorColor(c.userId);

        return (
          <div
            key={c.userId}
            className="absolute transition-transform duration-75 ease-out"
            style={{
              left: 0,
              top: 0,
              transform: `translate3d(${c.cursor.x}px, ${c.cursor.y}px, 0)`,
            }}
          >
            {/* SVG Mouse Cursor Arrow */}
            <svg
              className="h-5 w-5 drop-shadow-md"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
            >
              <path
                d="M3 3l7 18 3.5-7.5L21 10 3 3z"
                fill={color}
              />
            </svg>

            {/* Collaborator Name Tag */}
            <div
              className="ml-4 -mt-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg"
              style={{ backgroundColor: color }}
            >
              {c.name || 'Collaborator'}
            </div>
          </div>
        );
      })}
    </div>
  );
};
