import React from 'react';

export interface ArchitectureThumbnailProps {
  variant?: 'ecommerce' | 'pipeline' | 'multiregion' | 'analytics' | 'payment' | 'portal';
  className?: string;
  isDark?: boolean;
}

/**
 * ArchitectureThumbnail — Renders a crisp vector software architecture diagram preview
 * matching the visual cards in Reference Images 1, 5, 6, and 7.
 */
export const ArchitectureThumbnail: React.FC<ArchitectureThumbnailProps> = ({
  variant = 'ecommerce',
  className = '',
  isDark = false,
}) => {
  if (variant === 'pipeline') {
    return (
      <div className={`relative w-full h-full min-h-[140px] flex items-center justify-center overflow-hidden rounded-xl bg-slate-900 border border-slate-800 text-white select-none ${className}`}>
        <svg className="w-full h-full p-3" viewBox="0 0 360 170" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Grid dots */}
          <pattern id="grid-dots-pipe" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.8" fill="rgba(255,255,255,0.08)" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid-dots-pipe)" />

          {/* Connections */}
          <path d="M 180 32 L 80 80" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M 180 32 L 180 80" stroke="#3B82F6" strokeWidth="1.5" />
          <path d="M 180 32 L 280 80" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M 180 106 L 120 144" stroke="#F59E0B" strokeWidth="1.5" />
          <path d="M 180 106 L 240 144" stroke="#10B981" strokeWidth="1.5" />

          {/* Top Ingestion */}
          <g transform="translate(130, 10)">
            <rect width="100" height="26" rx="6" fill="#1E293B" stroke="#3B82F6" strokeWidth="1.5" />
            <text x="50" y="17" fill="#F8FAFC" fontSize="9" fontWeight="600" textAnchor="middle" fontFamily="Montserrat">Data Ingestion</text>
          </g>

          {/* Middle tier */}
          <g transform="translate(35, 70)">
            <rect width="90" height="24" rx="6" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.2" />
            <text x="45" y="16" fill="#F8FAFC" fontSize="8" fontWeight="500" textAnchor="middle" fontFamily="Montserrat">Data Sources</text>
          </g>

          <g transform="translate(135, 70)">
            <rect width="90" height="24" rx="6" fill="#1E293B" stroke="#3B82F6" strokeWidth="1.5" />
            <text x="45" y="16" fill="#F8FAFC" fontSize="8" fontWeight="600" textAnchor="middle" fontFamily="Montserrat">Processing Workers</text>
          </g>

          <g transform="translate(235, 70)">
            <rect width="90" height="24" rx="6" fill="#1E293B" stroke="#8B5CF6" strokeWidth="1.2" />
            <text x="45" y="16" fill="#F8FAFC" fontSize="8" fontWeight="500" textAnchor="middle" fontFamily="Montserrat">Data Storage S3</text>
          </g>

          {/* Bottom tier */}
          <g transform="translate(80, 132)">
            <rect width="80" height="22" rx="5" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.2" />
            <text x="40" y="15" fill="#F8FAFC" fontSize="8" fontWeight="500" textAnchor="middle" fontFamily="Montserrat">AI Inference</text>
          </g>

          <g transform="translate(200, 132)">
            <rect width="80" height="22" rx="5" fill="#1E293B" stroke="#10B981" strokeWidth="1.2" />
            <text x="40" y="15" fill="#F8FAFC" fontSize="8" fontWeight="500" textAnchor="middle" fontFamily="Montserrat">Analytics View</text>
          </g>
        </svg>
      </div>
    );
  }

  if (variant === 'multiregion') {
    return (
      <div className={`relative w-full h-full min-h-[140px] flex items-center justify-center overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white select-none ${className}`}>
        <svg className="w-full h-full p-3" viewBox="0 0 360 170" fill="none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid-dots-multi" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.8" fill={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid-dots-multi)" />

          {/* Connections */}
          <path d="M 180 32 L 80 75" stroke="#10B981" strokeWidth="1.5" />
          <path d="M 180 32 L 180 75" stroke="#3B82F6" strokeWidth="1.5" />
          <path d="M 180 32 L 280 75" stroke="#F59E0B" strokeWidth="1.5" />
          <path d="M 180 98 L 120 138" stroke="#3B82F6" strokeWidth="1.5" />
          <path d="M 180 98 L 240 138" stroke="#10B981" strokeWidth="1.5" />

          {/* Top Global Traffic */}
          <g transform="translate(130, 10)">
            <rect width="100" height="26" rx="6" fill={isDark ? '#1E293B' : '#FFFFFF'} stroke="#10B981" strokeWidth="1.5" />
            <text x="50" y="17" fill={isDark ? '#F8FAFC' : '#0F172A'} fontSize="9" fontWeight="600" textAnchor="middle" fontFamily="Montserrat">Global Traffic DNS</text>
          </g>

          {/* Regions */}
          <g transform="translate(35, 68)">
            <rect width="90" height="24" rx="6" fill={isDark ? '#1E293B' : '#FFFFFF'} stroke="#10B981" strokeWidth="1.2" />
            <text x="45" y="16" fill={isDark ? '#F8FAFC' : '#0F172A'} fontSize="8" fontWeight="500" textAnchor="middle" fontFamily="Montserrat">US Region (Active)</text>
          </g>

          <g transform="translate(135, 68)">
            <rect width="90" height="24" rx="6" fill={isDark ? '#1E293B' : '#FFFFFF'} stroke="#3B82F6" strokeWidth="1.5" />
            <text x="45" y="16" fill={isDark ? '#F8FAFC' : '#0F172A'} fontSize="8" fontWeight="600" textAnchor="middle" fontFamily="Montserrat">EU Region (Active)</text>
          </g>

          <g transform="translate(235, 68)">
            <rect width="90" height="24" rx="6" fill={isDark ? '#1E293B' : '#FFFFFF'} stroke="#F59E0B" strokeWidth="1.2" />
            <text x="45" y="16" fill={isDark ? '#F8FAFC' : '#0F172A'} fontSize="8" fontWeight="500" textAnchor="middle" fontFamily="Montserrat">APAC (Standby)</text>
          </g>

          {/* Monitoring & Logging */}
          <g transform="translate(75, 128)">
            <rect width="90" height="24" rx="5" fill={isDark ? '#1E293B' : '#FFFFFF'} stroke="#3B82F6" strokeWidth="1.2" />
            <text x="45" y="16" fill={isDark ? '#F8FAFC' : '#0F172A'} fontSize="8" fontWeight="500" textAnchor="middle" fontFamily="Montserrat">Prometheus</text>
          </g>

          <g transform="translate(195, 128)">
            <rect width="90" height="24" rx="5" fill={isDark ? '#1E293B' : '#FFFFFF'} stroke="#10B981" strokeWidth="1.2" />
            <text x="45" y="16" fill={isDark ? '#F8FAFC' : '#0F172A'} fontSize="8" fontWeight="500" textAnchor="middle" fontFamily="Montserrat">ELK Logging</text>
          </g>
        </svg>
      </div>
    );
  }

  // Default: E-Commerce Platform (Matches Reference 1 & 2 directly)
  return (
    <div className={`relative w-full h-full min-h-[140px] flex items-center justify-center overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white select-none ${className}`}>
      <svg className="w-full h-full p-3" viewBox="0 0 360 170" fill="none" xmlns="http://www.w3.org/2000/svg">
        <pattern id="grid-dots-ecom" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.8" fill={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid-dots-ecom)" />

        {/* Lines */}
        <path d="M 180 32 L 180 62" stroke="#3B82F6" strokeWidth="1.5" />
        <path d="M 180 84 C 180 96, 75 92, 75 106" stroke="#F59E0B" strokeWidth="1.5" />
        <path d="M 180 84 L 180 106" stroke="#3B82F6" strokeWidth="1.5" />
        <path d="M 180 84 C 180 96, 285 92, 285 106" stroke="#8B5CF6" strokeWidth="1.5" />
        <path d="M 75 130 C 75 140, 140 144, 180 146" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="3 3" />
        <path d="M 285 130 C 285 140, 220 144, 180 146" stroke="#8B5CF6" strokeWidth="1.2" strokeDasharray="3 3" />

        {/* Client */}
        <g transform="translate(135, 8)">
          <rect width="90" height="24" rx="6" fill={isDark ? '#1E293B' : '#FFFFFF'} stroke="#3B82F6" strokeWidth="1.5" />
          <text x="45" y="16" fill={isDark ? '#F8FAFC' : '#0F172A'} fontSize="8.5" fontWeight="600" textAnchor="middle" fontFamily="Montserrat">Client Web/App</text>
        </g>

        {/* Load Balancer */}
        <g transform="translate(130, 60)">
          <rect width="100" height="24" rx="6" fill={isDark ? '#1E293B' : '#FFFFFF'} stroke="#3B82F6" strokeWidth="1.5" />
          <text x="50" y="16" fill={isDark ? '#F8FAFC' : '#0F172A'} fontSize="8.5" fontWeight="600" textAnchor="middle" fontFamily="Montserrat">Load Balancer (ALB)</text>
        </g>

        {/* Auth Service */}
        <g transform="translate(25, 106)">
          <rect width="95" height="24" rx="6" fill={isDark ? '#1E293B' : '#FFFFFF'} stroke="#F59E0B" strokeWidth="1.5" />
          <text x="47.5" y="16" fill={isDark ? '#F8FAFC' : '#0F172A'} fontSize="8" fontWeight="600" textAnchor="middle" fontFamily="Montserrat">Auth Service (Node)</text>
        </g>

        {/* User Service */}
        <g transform="translate(132, 106)">
          <rect width="95" height="24" rx="6" fill={isDark ? '#1E293B' : '#FFFFFF'} stroke="#3B82F6" strokeWidth="1.5" />
          <text x="47.5" y="16" fill={isDark ? '#F8FAFC' : '#0F172A'} fontSize="8" fontWeight="600" textAnchor="middle" fontFamily="Montserrat">User Service (Node)</text>
        </g>

        {/* Database */}
        <g transform="translate(240, 106)">
          <rect width="95" height="24" rx="6" fill={isDark ? '#1E293B' : '#FFFFFF'} stroke="#8B5CF6" strokeWidth="1.5" />
          <text x="47.5" y="16" fill={isDark ? '#F8FAFC' : '#0F172A'} fontSize="8" fontWeight="600" textAnchor="middle" fontFamily="Montserrat">PostgreSQL DB</text>
        </g>
      </svg>
    </div>
  );
};
