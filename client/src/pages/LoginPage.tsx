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
  ArrowLeft,
} from 'lucide-react';
import { useLoginMutation } from '../store/api/authApi';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { resolvedTheme } = useTheme();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
    <div className="min-h-screen w-full bg-[var(--color-bg)] text-[var(--color-text)] flex items-stretch transition-colors duration-200">
      {/* LEFT COLUMN: Cinematic Architectural Monument Artwork (Hidden on mobile) */}
      <div className="hidden lg:relative lg:flex lg:w-1/2 flex-col justify-between p-12 overflow-hidden border-r border-[var(--color-border)]">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center filter contrast-[1.03] transition-all duration-300"
          style={{
            backgroundImage: `url('${
              resolvedTheme === 'light' ? '/assets/arch_monument_vertical_light.jpg' : '/assets/arch_monument_vertical.jpg'
            }')`,
          }}
        >
          <div
            className={`absolute inset-0 ${
              resolvedTheme === 'light'
                ? 'bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/20 to-[var(--color-bg)]/60'
                : 'bg-gradient-to-t from-[#090907] via-[#090907]/40 to-[#090907]/60'
            }`}
          />
        </div>

        {/* Top Header Branding on Artwork */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[var(--color-text)]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/80 text-[var(--color-accent)] backdrop-blur-md shadow-sm">
              <Layers className="h-4 w-4" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-[var(--color-text)]">ArchSync AI</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle variant="compact" />
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors backdrop-blur-sm bg-[var(--color-surface)]/70 px-3 py-1.5 rounded-full border border-[var(--color-border)] shadow-sm"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to home</span>
            </Link>
          </div>
        </div>

        {/* Central Editorial Message */}
        <div className="relative z-10 my-auto max-w-lg space-y-4">
          <div className="inline-block rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/80 px-3 py-1 text-[10px] font-mono tracking-widest text-[var(--color-accent)] uppercase backdrop-blur-md font-semibold">
            ARCHITECTURE • COLLABORATION • INTELLIGENCE
          </div>
          <h2 className="font-serif text-5xl font-normal text-[var(--color-text)] leading-[1.15] tracking-tight">
            Welcome back to your{' '}
            <span className="italic text-[var(--color-accent)]">workspace.</span>
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] font-light leading-relaxed">
            Continue designing systems that scale. Deterministic graph validation, real-time collaboration, and advisory AI co-pilot.
          </p>
        </div>

        {/* Bottom Architectural Philosophy Footer */}
        <div className="relative z-10 pt-8 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] font-mono text-[var(--color-text-muted)]">
          <div>
            <span className="text-[var(--color-accent)] uppercase tracking-wider block font-medium">TURN COMPLEXITY</span>
            <span className="opacity-70 block">INTO CLARITY</span>
          </div>
          <div className="text-right">
            <span className="text-[var(--color-text)] block font-medium">A collaborative architecture workspace</span>
            <span className="opacity-70 block">with AI-powered insights for modern teams.</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Dedicated Form Card */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-12 md:px-16 lg:px-20 bg-[var(--color-bg)]">
        {/* Mobile-only header */}
        <div className="lg:hidden mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-[var(--color-accent)]" />
            <span className="font-serif text-lg font-bold text-[var(--color-text)]">ArchSync AI</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle variant="compact" />
            <Link to="/" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">
              Back
            </Link>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          {/* Form Header */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[var(--color-text)]">Sign in</h1>
            <p className="mt-2 text-xs sm:text-sm text-[var(--color-text-muted)]">
              Welcome back to ArchSync AI
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-6 flex items-start gap-3 rounded-xl border border-status-danger/40 bg-status-danger/10 p-3.5 text-xs text-status-danger"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Form Card */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field with Persistent Label */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-[var(--color-text)] mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--color-text-muted)]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] pl-10 pr-4 py-3 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 transition-colors focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Password Field with Persistent Label & Visibility Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-[var(--color-text)]"
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setErrorMessage('Password reset service will be notified. Please contact your workspace administrator.');
                    }}
                    className="text-xs text-[var(--color-accent)] hover:underline transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--color-text-muted)]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] pl-10 pr-11 py-3 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 transition-colors focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-accent)] focus:ring-[var(--color-focus)]"
                />
                <label htmlFor="remember-me" className="text-xs text-[var(--color-text-muted)] cursor-pointer">
                  Remember me on this device
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                id="login-submit-button"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] py-3.5 px-4 text-sm font-semibold text-[#FFFFFF] dark:text-[#090907] hover:bg-[var(--color-accent-hover)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[var(--color-accent)]/20 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Switch to Register */}
          <div className="mt-8 text-center text-xs text-[var(--color-text-muted)]">
            <span>Don&apos;t have an account? </span>
            <Link
              to="/register"
              id="switch-to-register-link"
              className="font-semibold text-[var(--color-accent)] hover:underline transition-colors"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
