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
  Eye,
  EyeOff,
  ArrowLeft,
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
      setErrorMessage('Please enter a valid work email address');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }
    if (confirmPassword && password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
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
      {/* LEFT COLUMN: Cinematic Architectural Monument Artwork (Desktop only) */}
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
            SAME IDEAS • BIGGER SYSTEMS
          </div>
          <h2 className="font-serif text-5xl font-normal text-[var(--color-text)] leading-[1.15] tracking-tight">
            Create your{' '}
            <span className="italic text-[var(--color-accent)]">account.</span>
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] font-light leading-relaxed">
            Join architects, engineers, and product teams designing the next generation of scalable systems.
          </p>
        </div>

        {/* Bottom Architectural Philosophy Footer */}
        <div className="relative z-10 pt-8 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] font-mono text-[var(--color-text-muted)]">
          <div>
            <span className="text-[var(--color-accent)] uppercase tracking-wider block font-medium">A MORE INTELLIGENT</span>
            <span className="opacity-70 block">WAY TO DESIGN</span>
          </div>
          <div className="text-right">
            <span className="text-[var(--color-text)] block font-medium">Design, collaborate, and evolve</span>
            <span className="opacity-70 block">architectures with the power of AI.</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Dedicated Registration Form Card */}
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
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[var(--color-text)]">Create account</h1>
            <p className="mt-2 text-xs sm:text-sm text-[var(--color-text-muted)]">
              Start building with ArchSync AI
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Field */}
              <div>
                <label
                  htmlFor="register-name"
                  className="block text-xs font-semibold text-[var(--color-text)] mb-1.5"
                >
                  Full Name
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
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] pl-10 pr-4 py-3 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 transition-colors focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Work Email Field */}
              <div>
                <label
                  htmlFor="register-email"
                  className="block text-xs font-semibold text-[var(--color-text)] mb-1.5"
                >
                  Work Email
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
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] pl-10 pr-4 py-3 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 transition-colors focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="register-password"
                  className="block text-xs font-semibold text-[var(--color-text)] mb-1.5"
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
                    placeholder="Minimum 8 characters"
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

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="register-confirm-password"
                  className="block text-xs font-semibold text-[var(--color-text)] mb-1.5"
                >
                  Confirm Password
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
                    placeholder="Repeat password"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] pl-10 pr-11 py-3 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 transition-colors focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                id="register-submit-button"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] py-3.5 px-4 text-sm font-semibold text-[#FFFFFF] dark:text-[#090907] hover:bg-[var(--color-accent-hover)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[var(--color-accent)]/20 mt-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Switch to Login */}
          <div className="mt-8 text-center text-xs text-[var(--color-text-muted)]">
            <span>Already have an account? </span>
            <Link
              to="/login"
              id="switch-to-login-link"
              className="font-semibold text-[var(--color-accent)] hover:underline transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
