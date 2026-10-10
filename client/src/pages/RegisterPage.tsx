import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Layers,
  User,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { useRegisterMutation } from '../store/api/authApi';
import { useAuth } from '../hooks/useAuth';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [register, { isLoading }] = useRegisterMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect directly to dashboard
  if (!isAuthLoading && isAuthenticated) {
    const destination = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 2) {
      setErrorMessage('Full name must be at least 2 characters long');
      return;
    }
    if (!trimmedEmail) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    try {
      await register({
        name: trimmedName,
        email: trimmedEmail,
        password,
      }).unwrap();

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
        setErrorMessage('Registration failed. Please check your details and try again.');
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
              <span>SYSTEM DESIGN COLLABORATION</span>
            </div>
            <h2 className="mt-6 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#226192] leading-snug">
              Engineering-First <br />
              <span className="text-[#ef8557]">Cloud System Architecture.</span>
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-[#226192]/70 max-w-sm">
              Design resilient microservices topologies, model multi-tier storage, and enforce architectural rules automatically with your team.
            </p>
          </div>

          {/* Blueprint SVG Schematic Motif */}
          <div className="relative z-10 my-6 rounded-2xl border border-[#226192]/15 bg-[#eae6ed] p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#226192]/15 text-[11px] font-mono text-[#226192]/70">
              <span className="flex items-center gap-1.5 text-[#ef8557] font-semibold">
                <Layers className="h-3.5 w-3.5" />
                <span>MICROSERVICES MESH // BLUEPRINT</span>
              </span>
              <span className="text-[#226192] font-medium">TOPOLOGY // SPECIFICATION</span>
            </div>

            <svg
              className="mt-3 w-full h-32"
              viewBox="0 0 380 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Flow Lines */}
              <path
                d="M 60 35 L 140 35 M 60 85 L 140 85 M 210 35 L 290 60 M 210 85 L 290 60"
                stroke="#226192"
                strokeOpacity="0.25"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <path
                d="M 140 35 L 180 35"
                stroke="#226192"
                strokeOpacity="0.4"
                strokeWidth="2"
              />
              <path
                d="M 140 85 L 180 85"
                stroke="#ef8557"
                strokeWidth="2"
              />

              {/* Service 1: Client Ingress */}
              <rect x="10" y="20" width="70" height="32" rx="6" fill="#eae6ed" stroke="#226192" strokeOpacity="0.3" strokeWidth="1.5" />
              <text x="45" y="34" textAnchor="middle" fill="#226192" fontSize="8" fontFamily="monospace" fontWeight="600">CLIENT APP</text>
              <text x="45" y="44" textAnchor="middle" fill="#226192" fillOpacity="0.6" fontSize="7" fontFamily="monospace">WEB / SDK</text>

              {/* Service 2: Admin Portal */}
              <rect x="10" y="70" width="70" height="32" rx="6" fill="#eae6ed" stroke="#226192" strokeOpacity="0.3" strokeWidth="1.5" />
              <text x="45" y="84" textAnchor="middle" fill="#226192" fontSize="8" fontFamily="monospace" fontWeight="600">ADMIN API</text>
              <text x="45" y="94" textAnchor="middle" fill="#226192" fillOpacity="0.6" fontSize="7" fontFamily="monospace">ROLE MGMT</text>

              {/* Service 3: Core Mesh */}
              <rect x="140" y="20" width="74" height="32" rx="6" fill="#eae6ed" stroke="#ef8557" strokeWidth="1.5" />
              <text x="177" y="34" textAnchor="middle" fill="#226192" fontSize="8" fontFamily="monospace" fontWeight="700">SERVICE MESH</text>
              <text x="177" y="44" textAnchor="middle" fill="#226192" fillOpacity="0.7" fontSize="7" fontFamily="monospace">K8S CLUSTER</text>

              {/* Service 4: Event Stream */}
              <rect x="140" y="70" width="74" height="32" rx="6" fill="#eae6ed" stroke="#ef8557" strokeWidth="1.5" />
              <text x="177" y="84" textAnchor="middle" fill="#226192" fontSize="8" fontFamily="monospace" fontWeight="700">EVENT BROKER</text>
              <text x="177" y="94" textAnchor="middle" fill="#226192" fillOpacity="0.7" fontSize="7" fontFamily="monospace">HIGH TPS</text>

              {/* Service 5: Database Cluster */}
              <rect x="290" y="44" width="76" height="34" rx="6" fill="#eae6ed" stroke="#226192" strokeOpacity="0.3" strokeWidth="1.5" />
              <text x="328" y="58" textAnchor="middle" fill="#226192" fontSize="8" fontFamily="monospace" fontWeight="600">DATA CLUSTER</text>
              <text x="328" y="68" textAnchor="middle" fill="#226192" fillOpacity="0.6" fontSize="7" fontFamily="monospace">ACID REPLICA</text>

              {/* Status Nodes */}
              <circle cx="72" cy="24" r="2" fill="#ef8557" />
              <circle cx="72" cy="74" r="2" fill="#ef8557" />
              <circle cx="206" cy="24" r="2" fill="#226192" />
              <circle cx="206" cy="74" r="2" fill="#226192" />
              <circle cx="358" cy="48" r="2" fill="#ef8557" />
            </svg>

            {/* Micro Feature Highlights */}
            <div className="mt-2 grid grid-cols-3 gap-2 border-t border-[#226192]/15 pt-2 text-[10px] text-[#226192]/70">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-[#ef8557]" />
                <span>Bcrypt Hash</span>
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-[#ef8557]" />
                <span>RBAC Security</span>
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-[#ef8557]" />
                <span>Auto Export</span>
              </span>
            </div>
          </div>

          {/* Footer Security Note */}
          <div className="relative z-10 flex items-center gap-2 text-[11px] text-[#226192]/70">
            <ShieldCheck className="h-4 w-4 text-[#ef8557] shrink-0" />
            <span>Passwords hashed with bcrypt (cost factor 12). Sessions secured via HTTP-only cookies.</span>
          </div>
        </div>

        {/* Right Registration Form Card (6 columns on desktop, full width on mobile) */}
        <div className="col-span-1 lg:col-span-6 flex flex-col justify-center p-8 sm:p-12 lg:p-14 bg-[#eae6ed]">
          <div className="max-w-sm w-full mx-auto">
            {/* Header Title */}
            <div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#226192]/10 border border-[#226192]/20 text-[#226192] shadow-sm">
                <Layers className="h-5 w-5" />
              </div>
              <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-[#226192]">
                Create Your Account
              </h1>
              <p className="mt-1 text-xs text-[#226192]/70">
                Join ArchSync AI for real-time collaborative system design
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-2.5 rounded-xl border border-[#ef8557]/50 bg-[#ef8557]/10 p-3.5 text-xs text-[#226192]"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#ef8557]" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#226192]"
                >
                  Full Name
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#226192]/50">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Architect"
                    required
                    minLength={2}
                    className="w-full rounded-lg border border-[#226192]/20 bg-[#eae6ed] py-2.5 pl-9 pr-3 text-sm text-[#226192] placeholder-[#226192]/40 transition-colors focus:border-[#ef8557] focus:outline-none focus:ring-1 focus:ring-[#ef8557]"
                  />
                </div>
              </div>

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
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
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
                <p className="mt-1 text-[11px] text-[#226192]/60">Must be at least 8 characters long</p>
              </div>

              {/* Security Callout */}
              <div className="rounded-lg border border-[#226192]/15 bg-[#226192]/5 p-3 text-xs text-[#226192]/80">
                <div className="flex items-center gap-1.5 text-[#ef8557] font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Enterprise Security Guaranteed</span>
                </div>
                <p className="mt-1 text-[11px] text-[#226192]/60 leading-normal">
                  Zero plaintext storage. Secure session authentication for all project assets.
                </p>
              </div>

              {/* Submit Button */}
              <button
                id="register-submit-btn"
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#ef8557] hover:bg-[#ef8557]/90 active:bg-[#ef8557]/80 px-4 py-2.5 text-sm font-semibold text-[#226192] shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#ef8557] focus:ring-offset-2 focus:ring-offset-[#eae6ed] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#226192]" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4 text-[#226192]" />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 border-t border-[#226192]/15 pt-6 text-center text-xs text-[#226192]/70">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-[#ef8557] hover:underline transition-colors">
                Sign In here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
