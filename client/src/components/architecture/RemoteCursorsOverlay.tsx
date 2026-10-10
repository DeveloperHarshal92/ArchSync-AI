import React from 'react';
import { useAppSelector } from '../../store/hooks';
import { selectCollaborators } from '../../store/slices/collaborationSlice';

/**
 * Strict Brand Palette: Warm Ivory (#eae6ed), Deep Editorial Blue (#226192), Coral Orange (#ef8557).
 * Collaborator cursors alternate between Coral Orange and Warm Ivory with Deep Editorial Blue accents.
 */
export const CURSOR_COLORS = [
  '#ef8557', // Coral Orange
  '#226192', // Deep Editorial Blue
];

function getCursorColor(userId: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  const isCoral = Math.abs(hash) % 2 === 0;
  return isCoral
    ? { bg: '#ef8557', text: '#226192' }
    : { bg: '#226192', text: '#eae6ed' };
}

export const RemoteCursorsOverlay: React.FC = () => {
  const collaborators = useAppSelector(selectCollaborators);

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {collaborators.map((c) => {
        if (!c.cursor) return null;

        const { bg, text } = getCursorColor(c.userId);

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
              stroke="#eae6ed"
              strokeWidth="1.5"
            >
              <path
                d="M3 3l7 18 3.5-7.5L21 10 3 3z"
                fill={bg}
              />
            </svg>

            {/* Collaborator Name Tag */}
            <div
              className="ml-4 -mt-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-semibold shadow-lg border border-[#226192]/20"
              style={{ backgroundColor: bg, color: text }}
            >
              {c.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};
