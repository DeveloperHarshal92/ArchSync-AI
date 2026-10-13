import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Layers,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  Box,
  Users,
  Sparkles,
} from 'lucide-react';
import { useRegisterMutation } from '../store/api/authApi';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { resolvedTheme } = useTheme();
  const [register, { isLoading }] = useRegisterMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect directly to destination or dashboard
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
      setErrorMessage('Full name must be at least 2 characters long.');
      return;
    }

    if (!trimmedEmail) {
      setErrorMessage('Please enter a valid work email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please accept the Terms of Service and Privacy Policy to proceed.');
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
    <div className="min-h-screen w-full bg-[var(--color-bg)] text-[var(--color-text)] flex items-stretch transition-colors duration-200">
      {/* -------------------------------------------------------------
          LEFT COLUMN: Architectural Lakeside Villa & Wireframes (Reference 10)
          ------------------------------------------------------------- */}
      <div className="hidden lg:relative lg:flex lg:w-1/2 flex-col justify-between p-12 overflow-hidden border-r border-[var(--color-border)] select-none">
        {/* Background architectural villa */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center filter contrast-[1.03] transition-all duration-300"
          style={{
            backgroundImage: `url('${
              resolvedTheme === 'light'
                ? '/assets/images/arch_monument_lake_light.jpg'
                : '/assets/images/arch_monument_lake.jpg'
            }')`,
          }}
        >
          {/* Schematic Wireframe Grid Overlay */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(239, 133, 87, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(239, 133, 87, 0.2) 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />
          {/* Gradient blend */}
          <div
            className={`absolute inset-0 ${
              resolvedTheme === 'light'
                ? 'bg-gradient-to-r from-transparent via-[var(--color-bg)]/40 to-[var(--color-bg)]'
                : 'bg-gradient-to-r from-transparent via-[#090907]/60 to-[#090907]'
            }`}
          />
        </div>

        {/* Top Header Branding */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-[var(--color-text)]">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white shadow-md shadow-[var(--color-accent)]/25">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 22h4.5l5.5-11 5.5 11H22L12 2zm0 6l3.5 7h-7L12 8z" />
              </svg>
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-[var(--color-text)]">
              ArchSync <span className="text-[var(--color-accent)] font-sans text-xl font-semibold">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle variant="compact" />
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors backdrop-blur-sm bg-[var(--color-surface)]/80 px-3.5 py-1.5 rounded-full border border-[var(--color-border)] shadow-xs"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to home</span>
            </Link>
          </div>
        </div>

        {/* Central Editorial Message (Matching Reference 10) */}
        <div className="relative z-10 my-auto max-w-lg space-y-5">
          <div className="text-[11px] font-mono tracking-widest text-[var(--color-accent)] uppercase font-semibold">
            ARCHITECT • COLLABORATE • VALIDATE • WITH AI
          </div>

          <h2 className="font-serif text-5xl sm:text-6xl font-normal text-[var(--color-text)] leading-[1.08] tracking-tight">
            Create your <br />
            <span className="text-[var(--color-accent)] italic font-medium">account.</span>
          </h2>

          <p className="text-sm text-[var(--color-text-muted)] font-normal leading-relaxed">
            Join architects, engineers, and product teams designing the next generation of systems.
          </p>

          {/* 3 Circular Feature Cards (Matching Reference 10) */}
          <div className="pt-2 space-y-3.5">
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-surface)]/90 flex items-center justify-center text-[var(--color-accent)] shadow-xs shrink-0">
                <Box className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[var(--color-text)]">Design visually</h4>
                <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                  Use intuitive building blocks to model complex architectures.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-surface)]/90 flex items-center justify-center text-[var(--color-accent)] shadow-xs shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[var(--color-text)]">Collaborate in real-time</h4>
                <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                  Work with your team with live cursors, comments and shared workspaces.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-surface)]/90 flex items-center justify-center text-[var(--color-accent)] shadow-xs shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[var(--color-text)]">Get AI insights</h4>
                <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                  Validate, optimize and follow best practices with AI-powered analysis.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="relative z-10 pt-6 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] font-mono text-[var(--color-text-muted)]">
          <div>
            <span className="text-[var(--color-accent)] uppercase tracking-wider block font-semibold">FROM CONCEPT TO CLOUD</span>
            <span className="opacity-75 block">Continuous Architecture Governance</span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          RIGHT COLUMN: Floating Sign-up Card (Matching Reference 10)
          ------------------------------------------------------------- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-10 sm:px-12 md:px-16 lg:px-20 bg-[var(--color-bg)]">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white">
              <Layers className="h-4 w-4" />
            </div>
            <span className="font-serif text-xl font-bold text-[var(--color-text)]">ArchSync AI</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle variant="compact" />
            <Link to="/" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">
              Back
            </Link>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          {/* Card Container */}
          <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 sm:p-10 shadow-xl space-y-5">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--color-text)]">
                Create <span className="text-[var(--color-accent)] italic font-medium">account</span>
              </h1>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Start building and bring your ideas to life with ArchSync AI.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div
                role="alert"
                aria-live="polite"
                className="flex items-start gap-3 rounded-xl border border-status-danger/40 bg-status-danger/10 p-3.5 text-xs text-status-danger"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="register-name"
                  className="block text-xs font-semibold text-[var(--color-text)] mb-1"
                >
                  Full name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--color-text-muted)]">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="register-name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] pl-10 pr-4 py-2.5 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Work Email */}
              <div>
                <label
                  htmlFor="register-email"
                  className="block text-xs font-semibold text-[var(--color-text)] mb-1"
                >
                  Work email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--color-text-muted)]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] pl-10 pr-4 py-2.5 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="register-password"
                  className="block text-xs font-semibold text-[var(--color-text)] mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--color-text-muted)]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] pl-10 pr-11 py-2.5 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="register-confirm-password"
                  className="block text-xs font-semibold text-[var(--color-text)] mb-1"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--color-text-muted)]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] pl-10 pr-11 py-2.5 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Agree to terms */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  id="agree-terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] mt-0.5"
                />
                <label htmlFor="agree-terms" className="text-xs text-[var(--color-text-muted)] cursor-pointer leading-tight">
                  I agree to the{' '}
                  <span className="text-[var(--color-accent)] hover:underline">Terms of Service</span> and{' '}
                  <span className="text-[var(--color-accent)] hover:underline">Privacy Policy</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                id="register-submit-button"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] py-3 px-4 text-xs font-semibold text-white shadow-md shadow-[var(--color-accent)]/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-[var(--color-border)]" />
              <span className="absolute bg-[var(--color-surface)] px-3 text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
                OR CONTINUE WITH
              </span>
            </div>

            {/* Google Sign Up */}
            <button
              type="button"
              onClick={() => {
                setErrorMessage('Google SSO is available for configured enterprise domains.');
              }}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-raised)] py-2.5 px-4 text-xs font-medium text-[var(--color-text)] transition-colors shadow-xs"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign up with Google</span>
            </button>

            {/* Switch to Login */}
            <div className="text-center text-xs text-[var(--color-text-muted)] pt-1">
              <span>Already have an account? </span>
              <Link
                to="/login"
                id="switch-to-login-link"
                className="font-semibold text-[var(--color-accent)] hover:underline"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
