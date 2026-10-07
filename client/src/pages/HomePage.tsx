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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400 mb-6">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>F03 Authentication & Backend Complete</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
          Real-Time Collaborative{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Architecture Workspace
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400 sm:text-lg">
          Design, review, and persist complex software systems collaboratively.
          The production foundation below verifies all core architectural layers.
        </p>

        {/* Hero Auth CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:from-cyan-400 hover:to-blue-500"
            >
              <span>Go to Workspace Dashboard</span>
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:from-cyan-400 hover:to-blue-500"
              >
                <span>Get Started Free</span>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-700 hover:text-white"
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
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-400">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Backend Health Verification</h2>
                <p className="text-xs text-slate-400">Validated via RTK Query to <code className="text-cyan-400">/api/v1/health</code></p>
              </div>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 disabled:opacity-50"
              title="Refetch Health Status"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>Poll</span>
            </button>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Status</span>
              {isLoading ? (
                <span className="text-amber-400 font-mono">loading...</span>
              ) : isError ? (
                <span className="text-rose-400 font-mono">offline / unreachable</span>
              ) : (
                <span className="text-emerald-400 font-mono font-semibold">
                  {healthResponse?.data?.status ?? 'healthy'}
                </span>
              )}
            </div>

            <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Server Timestamp</span>
              <span className="font-mono text-xs text-slate-300">
                {healthResponse?.data?.timestamp ?? 'Waiting for response...'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Uptime</span>
              <span className="font-mono text-xs text-slate-300">
                {healthResponse?.data?.uptime ? `${healthResponse.data.uptime} seconds` : '—'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Environment</span>
              <span className="font-mono text-xs text-cyan-400 uppercase">
                {healthResponse?.data?.environment ?? 'development'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Database Layer (F02)</span>
              <span className="font-mono text-xs text-amber-400 uppercase">
                {healthResponse?.data?.database ?? 'unconfigured'}
              </span>
            </div>
          </div>
        </div>

        {/* Client State Verification (Redux Toolkit) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-cyan-500/10 p-2.5 text-cyan-400">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Redux Toolkit State Verification</h2>
                <p className="text-xs text-slate-400">Proves React + Redux Toolkit + RTK Query integration</p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div className="rounded-lg bg-slate-950/60 border border-slate-800/80 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-400">Slice:</span>
                  <span className="ml-2 font-mono text-sm text-white">uiSlice</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Sidebar State:</span>
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-xs font-semibold ${
                      sidebarOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {sidebarOpen ? 'OPEN' : 'CLOSED'}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => dispatch(toggleSidebar())}
                  className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-500 active:scale-95"
                >
                  Dispatch toggleSidebar() Action
                </button>
              </div>
            </div>

            <div className="rounded-lg bg-slate-950/40 border border-slate-800/60 p-3 text-xs text-slate-400">
              <p>
                <strong className="text-slate-300">Rules Compliance:</strong> Redux Toolkit manages centralized client state, while RTK Query handles server state with zero tokens stored in localStorage.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Stack Matrix */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold text-white mb-4">Architecture Matrix</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stackItems.map((item) => (
            <div
              key={item.name}
              className={`rounded-xl border p-3.5 transition ${
                item.active
                  ? 'border-slate-800 bg-slate-900/40 text-slate-200'
                  : 'border-slate-800/40 bg-slate-900/10 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <item.icon className={`h-4 w-4 ${item.active ? 'text-cyan-400' : 'text-slate-600'}`} />
                <span className="text-xs font-medium">{item.name}</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">{item.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
