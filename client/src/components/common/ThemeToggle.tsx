import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, ChevronDown, Check } from 'lucide-react';
import { useTheme, ThemePreference } from '../../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'compact' | 'segmented';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'compact', className = '' }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const options: { id: ThemePreference; label: string; icon: React.ReactNode }[] = [
    {
      id: 'light',
      label: 'Light',
      icon: <Sun className="h-4 w-4" />,
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: <Moon className="h-4 w-4" />,
    },
    {
      id: 'system',
      label: 'System',
      icon: <Laptop className="h-4 w-4" />,
    },
  ];

  if (variant === 'segmented') {
    return (
      <div
        role="radiogroup"
        aria-label="Color theme selection"
        className={`inline-flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1 text-xs ${className}`}
      >
        {options.map((opt) => {
          const isSelected = theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTheme(opt.id)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-[var(--color-accent)] text-[#FFFFFF] dark:text-[#090907] shadow-sm font-semibold'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Compact dropdown variant (default for headers and studio top bar)
  const currentIcon =
    theme === 'system' ? (
      <Laptop className="h-3.5 w-3.5 text-[var(--color-accent)]" />
    ) : resolvedTheme === 'dark' ? (
      <Moon className="h-3.5 w-3.5 text-[var(--color-accent)]" />
    ) : (
      <Sun className="h-3.5 w-3.5 text-[var(--color-accent)]" />
    );

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        id="theme-toggle-btn"
        aria-label={`Theme preference: ${theme}. Click to change theme`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-raised)] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
      >
        {currentIcon}
        <span className="capitalize hidden md:inline text-[11px] font-medium">{theme}</span>
        <ChevronDown className="h-3 w-3 text-[var(--color-text-muted)]" />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Theme options"
          className="absolute right-0 z-50 mt-1.5 w-36 origin-top-right rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1 text-xs shadow-xl backdrop-blur-md focus:outline-none animate-in fade-in zoom-in-95 duration-100"
        >
          {options.map((opt) => {
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setTheme(opt.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-semibold'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={isSelected ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}>
                    {opt.icon}
                  </span>
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-[var(--color-accent)]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
