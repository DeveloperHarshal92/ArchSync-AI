import React from 'react';
import { Users, Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import {
  selectSocketConnectionState,
  selectCollaborators,
  selectCollaborationError,
} from '../../store/slices/collaborationSlice';

const AVATAR_COLORS = [
  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'bg-violet-500/20 text-violet-400 border-violet-500/30',
  'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'bg-blue-500/20 text-blue-400 border-blue-500/30',
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
      color: 'bg-cyan-500 animate-pulse',
      textColor: 'text-cyan-400',
      label: 'Connecting...',
      icon: RefreshCw,
    },
    reconnecting: {
      color: 'bg-amber-500 animate-pulse',
      textColor: 'text-amber-400',
      label: 'Reconnecting...',
      icon: RefreshCw,
    },
    disconnected: {
      color: 'bg-slate-500',
      textColor: 'text-slate-400',
      label: 'Offline',
      icon: WifiOff,
    },
    error: {
      color: 'bg-rose-500',
      textColor: 'text-rose-400',
      label: 'Connection Error',
      icon: AlertTriangle,
    },
  }[connectionState];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex items-center gap-3">
      {/* 1. Connection Status Badge */}
      <div
        className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs backdrop-blur-md"
        title={error ? `${error.code}: ${error.message}` : `Status: ${statusConfig.label}`}
      >
        <StatusIcon className={`h-3.5 w-3.5 ${statusConfig.textColor}`} />
        <span className={`font-medium ${statusConfig.textColor}`}>{statusConfig.label}</span>
      </div>

      {/* 2. Active Collaborators Avatars & Count */}
      {connectionState === 'connected' && collaborators.length > 0 && (
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-2.5 py-1 backdrop-blur-md">
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

          <span className="text-xs text-slate-400 flex items-center gap-1 pl-1">
            <Users className="h-3 w-3 text-cyan-400" />
            <span>{collaborators.length}</span>
          </span>
        </div>
      )}
    </div>
  );
};
