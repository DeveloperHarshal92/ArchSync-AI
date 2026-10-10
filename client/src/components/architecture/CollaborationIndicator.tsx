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
  'bg-[#ef8557]/20 text-[#ef8557] border-[#ef8557]/40',
  'bg-[#226192]/15 text-[#226192] border-[#226192]/30',
  'bg-[#ef8557]/30 text-[#ef8557] border-[#ef8557]/50',
  'bg-[#226192]/25 text-[#226192] border-[#226192]/40',
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
      color: 'bg-[#226192]',
      textColor: 'text-[#226192]',
      label: 'Live',
      icon: Wifi,
    },
    connecting: {
      color: 'bg-[#ef8557] animate-pulse',
      textColor: 'text-[#ef8557]',
      label: 'Connecting...',
      icon: RefreshCw,
    },
    reconnecting: {
      color: 'bg-[#ef8557] animate-pulse',
      textColor: 'text-[#ef8557]',
      label: 'Reconnecting...',
      icon: RefreshCw,
    },
    disconnected: {
      color: 'bg-[#226192]/40',
      textColor: 'text-[#226192]/60',
      label: 'Offline',
      icon: WifiOff,
    },
    error: {
      color: 'bg-[#ef8557]',
      textColor: 'text-[#ef8557]',
      label: 'Connection Error',
      icon: AlertTriangle,
    },
  }[connectionState];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex items-center gap-3">
      {/* 1. Connection Status Badge */}
      <div
        className="flex items-center gap-1.5 rounded-md border border-[#226192]/20 bg-[#eae6ed] px-2.5 py-1 text-xs font-mono"
        title={error ? `${error.code}: ${error.message}` : `Status: ${statusConfig.label}`}
      >
        <StatusIcon className={`h-3.5 w-3.5 ${statusConfig.textColor}`} />
        <span className={`font-medium ${statusConfig.textColor}`}>{statusConfig.label}</span>
      </div>

      {/* 2. Active Collaborators Avatars & Count */}
      {connectionState === 'connected' && collaborators.length > 0 && (
        <div className="flex items-center gap-1.5 rounded-md border border-[#226192]/20 bg-[#eae6ed] px-2.5 py-1 font-mono">
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

          <span className="text-xs text-[#226192]/70 flex items-center gap-1 pl-1">
            <Users className="h-3 w-3 text-[#ef8557]" />
            <span>{collaborators.length}</span>
          </span>
        </div>
      )}
    </div>
  );
};
