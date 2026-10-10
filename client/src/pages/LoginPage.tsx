import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Layers,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useLoginMutation } from '../store/api/authApi';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect directly to destination or dashboard
  if (!isAuthLoading && isAuthenticated) {
    const destination = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password');
      return;
    }

    try {
      await login({ email: trimmedEmail, password }).unwrap();
      const destination = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'data' in err &&
        typeof (err as { data?: { error?: { message?: string } } }).data?.error?.message === 'string'
      ) {
        setErrorMessage((err as { data: { error: { message: string } } }).data.error.message);
      } else {
        setErrorMessage('Failed to sign in. Please verify your credentials.');
      }
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8 sm:px-6 lg:px-8 bg-[#eae6ed] text-[#226192]">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl border border-[#226192]/15 bg-[#eae6ed] shadow-xl grid grid-cols-1 lg:grid-cols-12">
        {/* Left Blueprint Hero Zone (Desktop only, 6 columns) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between p-10 sm:p-12 bg-[#eae6ed] border-r border-[#226192]/15 relative select-none">
          {/* Subtle Blueprint Grid Pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `linear-gradient(to right, #226192 1px, transparent 1px), linear-gradient(to bottom, #226192 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          {/* Top Brand Tag */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#ef8557]/40 bg-[#ef8557]/10 px-3.5 py-1 text-xs font-semibold text-[#226192]">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#ef8557]" />
              <span>PRECISION ARCHITECTURE STUDIO</span>
            </div>
            <h2 className="mt-6 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#226192] leading-snug">
              Architect Distributed Systems <br />
              <span className="text-[#ef8557]">With Intelligent Precision.</span>
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-[#226192]/70 max-w-sm">
              Real-time multi-architect canvas synchronization, deterministic graph validation, and advisory AI co-pilot.
            </p>
          </div>

          {/* Blueprint SVG Schematic Motif */}
          <div className="relative z-10 my-6 rounded-2xl border border-[#226192]/15 bg-[#eae6ed] p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#226192]/15 text-[11px] font-mono text-[#226192]/70">
              <span className="flex items-center gap-1.5 text-[#ef8557] font-semibold">
                <Layers className="h-3.5 w-3.5" />
                <span>TOPOLOGY // LIVE_PREVIEW</span>
              </span>
              <span className="text-[#226192] font-medium">REVISION v2 ● SYNCED</span>
            </div>

            <svg
              className="mt-3 w-full h-32"
              viewBox="0 0 380 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Connection Lines */}
              <path
                d="M 70 60 L 140 60 M 200 60 L 260 35 M 200 60 L 260 85"
                stroke="#226192"
                strokeOpacity="0.25"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <path
                d="M 140 60 L 170 60"
                stroke="#ef8557"
                strokeWidth="2"
              />
              <path
                d="M 230 45 L 260 35"
                stroke="#ef8557"
                strokeWidth="2"
              />

              {/* Node 1: Edge Router */}
              <rect x="10" y="42" width="60" height="36" rx="6" fill="#eae6ed" stroke="#226192" strokeOpacity="0.3" strokeWidth="1.5" />
              <text x="40" y="58" textAnchor="middle" fill="#226192" fontSize="8" fontFamily="monospace" fontWeight="600">EDGE</text>
              <text x="40" y="69" textAnchor="middle" fill="#226192" fillOpacity="0.6" fontSize="7" fontFamily="monospace">INGRESS</text>

              {/* Node 2: API Gateway */}
              <rect x="140" y="40" width="64" height="40" rx="6" fill="#eae6ed" stroke="#ef8557" strokeWidth="1.5" />
              <text x="172" y="57" textAnchor="middle" fill="#226192" fontSize="8" fontFamily="monospace" fontWeight="700">GATEWAY</text>
              <text x="172" y="69" textAnchor="middle" fill="#ef8557" fontSize="7" fontFamily="monospace">API ROUTER</text>

              {/* Node 3: Auth & Microservice */}
              <rect x="260" y="18" width="80" height="34" rx="6" fill="#eae6ed" stroke="#226192" strokeOpacity="0.3" strokeWidth="1.5" />
              <text x="300" y="34" textAnchor="middle" fill="#226192" fontSize="8" fontFamily="monospace" fontWeight="600">AUTH CLUSTER</text>
              <text x="300" y="44" textAnchor="middle" fill="#226192" fillOpacity="0.6" fontSize="7" fontFamily="monospace">STATEFUL SESS</text>

              {/* Node 4: Graph Engine / Storage */}
              <rect x="260" y="68" width="80" height="34" rx="6" fill="#eae6ed" stroke="#226192" strokeOpacity="0.3" strokeWidth="1.5" />
              <text x="300" y="84" textAnchor="middle" fill="#226192" fontSize="8" fontFamily="monospace" fontWeight="600">GRAPH ENGINE</text>
              <text x="300" y="94" textAnchor="middle" fill="#226192" fillOpacity="0.6" fontSize="7" fontFamily="monospace">TOPOLOGY DB</text>

              {/* Status Indicators */}
              <circle cx="62" cy="48" r="2.5" fill="#226192" />
              <circle cx="196" cy="46" r="2.5" fill="#ef8557" />
              <circle cx="332" cy="24" r="2.5" fill="#226192" />
              <circle cx="332" cy="74" r="2.5" fill="#226192" />
            </svg>

            {/* Micro Feature Highlights */}
            <div className="mt-2 grid grid-cols-3 gap-2 border-t border-[#226192]/15 pt-2 text-[10px] text-[#226192]/70">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-[#ef8557]" />
                <span>Multi-Cursor</span>
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-[#ef8557]" />
                <span>Graph Rule Checks</span>
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-[#ef8557]" />
                <span>Zero Slop Specs</span>
              </span>
            </div>
          </div>

          {/* Footer Security Note */}
          <div className="relative z-10 flex items-center gap-2 text-[11px] text-[#226192]/70">
            <ShieldCheck className="h-4 w-4 text-[#ef8557] shrink-0" />
            <span>Secure sessions via HTTP-only SameSite cookies and TLS encryption.</span>
          </div>
        </div>

        {/* Right Authentication Form Card (6 columns on desktop, full width on mobile) */}
        <div className="col-span-1 lg:col-span-6 flex flex-col justify-center p-8 sm:p-12 lg:p-14 bg-[#eae6ed]">
          <div className="max-w-sm w-full mx-auto">
            {/* Header Title */}
            <div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#226192]/10 border border-[#226192]/20 text-[#226192] shadow-sm">
                <Layers className="h-5 w-5" />
              </div>
              <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-[#226192]">
                Sign In to ArchSync AI
              </h1>
              <p className="mt-1 text-xs text-[#226192]/70">
                Enter your credentials to access your architecture workspace
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-2.5 rounded-xl border border-[#ef8557]/40 bg-[#ef8557]/15 p-3.5 text-xs text-[#ef8557]"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#ef8557]" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#226192]"
                >
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#226192]/50">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full rounded-lg border border-[#226192]/20 bg-[#eae6ed] py-2.5 pl-9 pr-3 text-sm text-[#226192] placeholder-[#226192]/40 transition-colors focus:border-[#ef8557] focus:outline-none focus:ring-1 focus:ring-[#ef8557]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#226192]"
                >
                  Password
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#226192]/50">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-lg border border-[#226192]/20 bg-[#eae6ed] py-2.5 pl-9 pr-10 text-sm text-[#226192] placeholder-[#226192]/40 transition-colors focus:border-[#ef8557] focus:outline-none focus:ring-1 focus:ring-[#ef8557]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#226192]/60 hover:text-[#226192] focus:outline-none focus:text-[#ef8557] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#ef8557] hover:bg-[#ef8557]/90 px-4 py-2.5 text-sm font-semibold text-[#226192] shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#ef8557] focus:ring-offset-2 focus:ring-offset-[#eae6ed] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#226192]" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4 text-[#226192]" />
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 border-t border-[#226192]/15 pt-6 text-center text-xs text-[#226192]/70">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-semibold text-[#ef8557] hover:underline transition-colors">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
