import React from 'react';
import {
  CheckCircle2,
  Server,
  Layers,
  Code2,
  Database,
  Radio,
  Sparkles,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleSidebar } from '../store/slices/uiSlice';
import { useGetHealthQuery } from '../store/api/healthApi';

import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const { isAuthenticated } = useAuth();

  const {
    data: healthResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetHealthQuery();

  const stackItems = [
    { name: 'React 18', role: 'Component Framework', icon: Code2, active: true },
    { name: 'TypeScript (Strict)', role: 'Type Safety & Contracts', icon: Layers, active: true },
    { name: 'Vite 6', role: 'Build Tooling & Dev Server', icon: Sparkles, active: true },
    { name: 'Tailwind CSS', role: 'Utility Styling System', icon: Layers, active: true },
    { name: 'Redux Toolkit + RTK Query', role: 'Centralized & Server State', icon: Server, active: true },
    { name: 'Express + Node.js', role: 'Layered Backend Architecture', icon: Server, active: true },
    { name: 'MongoDB + Mongoose', role: 'Data Persistence (F03 Auth)', icon: Database, active: true },
    { name: 'Socket.IO', role: 'Real-Time Sync (Planned F08)', icon: Radio, active: false },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-[#226192]">
      {/* Hero Section */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#ef8557]/40 bg-[#ef8557]/10 px-3.5 py-1 text-xs font-semibold text-[#226192] mb-6">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#ef8557]" />
          <span>F03 Authentication & Backend Complete</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[#226192]">
          Real-Time Collaborative{' '}
          <span className="text-[#ef8557]">
            Architecture Workspace
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-[#226192]/70 sm:text-lg">
          Design, review, and persist complex software systems collaboratively.
          The production foundation below verifies all core architectural layers.
        </p>

        {/* Hero Auth CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-[#ef8557] hover:bg-[#ef8557]/90 active:bg-[#ef8557]/80 px-6 py-3 text-sm font-semibold text-[#226192] shadow-sm transition-all focus:ring-2 focus:ring-[#ef8557]"
            >
              <span>Go to Workspace Dashboard</span>
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-[#ef8557] hover:bg-[#ef8557]/90 active:bg-[#ef8557]/80 px-6 py-3 text-sm font-semibold text-[#226192] shadow-sm transition-all focus:ring-2 focus:ring-[#ef8557]"
              >
                <span>Get Started Free</span>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-[#226192]/20 bg-[#eae6ed] px-6 py-3 text-sm font-semibold text-[#226192] transition-colors hover:border-[#226192] hover:bg-[#226192]/5 focus:ring-2 focus:ring-[#ef8557]"
              >
                <span>Sign In</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Verification Cards Grid */}
      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Backend Health Check Verification (RTK Query) */}
        <div className="rounded-2xl border border-[#226192]/15 bg-[#eae6ed] p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#226192]/15">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#226192]/10 border border-[#226192]/20 p-2.5 text-[#226192]">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-base font-semibold text-[#226192]">Backend Health Verification</h2>
                <p className="text-xs text-[#226192]/70">Validated via RTK Query to <code className="text-[#ef8557] font-mono">/api/v1/health</code></p>
              </div>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#226192]/20 bg-[#eae6ed] px-3 py-1.5 text-xs font-semibold text-[#226192] transition-colors hover:border-[#226192] hover:bg-[#226192]/5 disabled:opacity-50"
              title="Refetch Health Status"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>Poll</span>
            </button>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-[#226192]/5 border border-[#226192]/10">
              <span className="text-[#226192]/70">Status</span>
              {isLoading ? (
                <span className="text-[#ef8557] font-mono">loading...</span>
              ) : isError ? (
                <span className="text-[#ef8557] font-mono">offline / unreachable</span>
              ) : (
                <span className="text-[#226192] font-mono font-semibold">
                  {healthResponse?.data?.status ?? 'healthy'}
                </span>
              )}
            </div>

            <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-[#226192]/5 border border-[#226192]/10">
              <span className="text-[#226192]/70">Server Timestamp</span>
              <span className="font-mono text-xs text-[#226192]/80">
                {healthResponse?.data?.timestamp ?? 'Waiting for response...'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-[#226192]/5 border border-[#226192]/10">
              <span className="text-[#226192]/70">Uptime</span>
              <span className="font-mono text-xs text-[#226192]/80">
                {healthResponse?.data?.uptime ? `${healthResponse.data.uptime} seconds` : '—'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-[#226192]/5 border border-[#226192]/10">
              <span className="text-[#226192]/70">Environment</span>
              <span className="font-mono text-xs text-[#ef8557] uppercase font-semibold">
                {healthResponse?.data?.environment ?? 'development'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-[#226192]/5 border border-[#226192]/10">
              <span className="text-[#226192]/70">Database Layer (F02)</span>
              <span className="font-mono text-xs text-[#ef8557] uppercase font-semibold">
                {healthResponse?.data?.database ?? 'unconfigured'}
              </span>
            </div>
          </div>
        </div>

        {/* Client State Verification (Redux Toolkit) */}
        <div className="rounded-2xl border border-[#226192]/15 bg-[#eae6ed] p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#226192]/15">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#226192]/10 border border-[#226192]/20 p-2.5 text-[#226192]">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-base font-semibold text-[#226192]">Redux Toolkit State Verification</h2>
                <p className="text-xs text-[#226192]/70">Proves React + Redux Toolkit + RTK Query integration</p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div className="rounded-lg bg-[#226192]/5 border border-[#226192]/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#226192]/70">Slice:</span>
                  <span className="ml-2 font-mono text-sm text-[#226192] font-semibold">uiSlice</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#226192]/70">Sidebar State:</span>
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-xs font-semibold border ${
                      sidebarOpen ? 'border-[#ef8557] bg-[#ef8557]/15 text-[#226192]' : 'border-[#226192]/20 bg-transparent text-[#226192]/70'
                    }`}
                  >
                    {sidebarOpen ? 'OPEN' : 'CLOSED'}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => dispatch(toggleSidebar())}
                  className="rounded-xl bg-[#ef8557] hover:bg-[#ef8557]/90 px-4 py-2 text-xs font-semibold text-[#226192] shadow-sm transition active:scale-95 focus:ring-2 focus:ring-[#ef8557]"
                >
                  Dispatch toggleSidebar() Action
                </button>
              </div>
            </div>

            <div className="rounded-lg bg-[#226192]/5 border border-[#226192]/10 p-3 text-xs text-[#226192]/70">
              <p>
                <strong className="text-[#226192]">Rules Compliance:</strong> Redux Toolkit manages centralized client state, while RTK Query handles server state with zero tokens stored in localStorage.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Stack Matrix */}
      <div className="mt-12">
        <h3 className="font-serif text-lg font-semibold text-[#226192] mb-4">Architecture Matrix</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stackItems.map((item) => (
            <div
              key={item.name}
              className={`rounded-xl border p-3.5 transition ${
                item.active
                  ? 'border-[#226192]/15 bg-[#eae6ed] text-[#226192]'
                  : 'border-[#226192]/10 bg-[#eae6ed]/50 text-[#226192]/40 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <item.icon className={`h-4 w-4 ${item.active ? 'text-[#ef8557]' : 'text-[#226192]/40'}`} />
                <span className="text-xs font-medium">{item.name}</span>
              </div>
              <p className="mt-1 text-[11px] text-[#226192]/60">{item.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
