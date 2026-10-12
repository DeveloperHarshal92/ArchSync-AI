import React from 'react';
import { Users, Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import {
  selectSocketConnectionState,
  selectCollaborators,
  selectCollaborationError,
} from '../../store/slices/collaborationSlice';

/**
 * Strict Brand Palette: Warm Ivory (#eae6ed), Deep Editorial Blue (#226192), Coral Orange (#ef8557).
 * Avatar indicators use calibrated opacities of Warm Ivory and Coral Orange.
 */
const AVATAR_COLORS = [
  'bg-[#B99D73]/25 text-[#D6B887] border-[#B99D73]/50',
  'bg-[#3B82F6]/25 text-blue-300 border-[#3B82F6]/50',
  'bg-[#10B981]/25 text-emerald-300 border-[#10B981]/50',
  'bg-amber-600/25 text-amber-300 border-amber-600/50',
];

function getAvatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export const CollaborationIndicator: React.FC = () => {
  const connectionState = useAppSelector(selectSocketConnectionState);
  const collaborators = useAppSelector(selectCollaborators);
  const error = useAppSelector(selectCollaborationError);

  const statusConfig = {
    connected: {
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      label: 'Live',
      icon: Wifi,
    },
    connecting: {
      color: 'bg-[#B99D73] animate-pulse',
      textColor: 'text-[#D6B887]',
      label: 'Connecting...',
      icon: RefreshCw,
    },
    reconnecting: {
      color: 'bg-[#B99D73] animate-pulse',
      textColor: 'text-[#D6B887]',
      label: 'Reconnecting...',
      icon: RefreshCw,
    },
    disconnected: {
      color: 'bg-stone-500',
      textColor: 'text-stone-400',
      label: 'Offline',
      icon: WifiOff,
    },
    error: {
      color: 'bg-red-500',
      textColor: 'text-red-400',
      label: 'Connection Error',
      icon: AlertTriangle,
    },
  }[connectionState];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex items-center gap-3">
      {/* 1. Connection Status Badge */}
      <div
        className="flex items-center gap-1.5 rounded-md border border-[#B99D73]/20 bg-[#11110F] px-2.5 py-1 text-xs font-mono"
        title={error ? `${error.code}: ${error.message}` : `Status: ${statusConfig.label}`}
      >
        <StatusIcon className={`h-3.5 w-3.5 ${statusConfig.textColor}`} />
        <span className={`font-medium ${statusConfig.textColor}`}>{statusConfig.label}</span>
      </div>

      {/* 2. Active Collaborators Avatars & Count */}
      {connectionState === 'connected' && collaborators.length > 0 && (
        <div className="flex items-center gap-1.5 rounded-md border border-[#B99D73]/20 bg-[#11110F] px-2.5 py-1 font-mono">
          <div className="flex -space-x-1.5 overflow-hidden">
            {collaborators.slice(0, 4).map((c) => {
              const initials = c.name
                ? c.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : 'U';
              const colorClass = getAvatarColor(c.userId);

              return (
                <div
                  key={c.userId}
                  className={`relative flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold ${colorClass}`}
                  title={`${c.name} (collaborating)`}
                >
                  {initials}
                </div>
              );
            })}
          </div>

          <span className="text-xs text-[#B9B1A5] flex items-center gap-1 pl-1">
            <Users className="h-3 w-3 text-[#B99D73]" />
            <span>{collaborators.length}</span>
          </span>
        </div>
      )}
    </div>
  );
};
