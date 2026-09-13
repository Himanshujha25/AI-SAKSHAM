import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Sun, ArrowRight } from 'lucide-react';
import { useAuth } from '../../store/auth';
import { errMsg, safeNext } from '../../lib/utils';
import { Button, Card, Input, Label } from '../../components/ui/primitives';
import { GoogleAuth } from '../../components/auth/GoogleAuth';
import { SakshamLogo } from '../../components/shared/SakshamLogo';

// Where to land after a successful login: the page the user was on
// (?next= or router state), falling back to the dashboard.
export function usePostLoginTarget() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  return safeNext(params.get('next') || location.state?.from);
}

function OrDivider() {
  return (
    <div className="my-1 flex items-center gap-3">
      <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">or</span>
      <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
    </div>
  );
}

function AuthThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('saksham_ai_theme', dark ? 'dark' : 'light');
  }, [dark]);
  return (
    <button
      onClick={() => setDark((d) => !d)}
      className="rounded-lg border border-slate-200 bg-white/60 p-2 text-slate-600 backdrop-blur transition hover:scale-105 hover:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800"
      title="Toggle theme"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function AuthNav({ mode }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-[#04060d]/70">
      <div className="flex h-16 w-full items-center justify-between px-4 md:px-8">
        <Link to="/" className="group flex min-w-0 items-center gap-2 transition-transform hover:opacity-95">
          <SakshamLogo size="md" variant="full" />
        </Link>
        <div className="flex min-w-0 shrink-0 items-center gap-2">
          <Link
            to="/"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:inline-flex dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <ArrowLeft size={14} /> Home
          </Link>
          {mode === 'login' ? (
            <Link
              to="/auth/register"
              className="group rounded-xl border border-slate-900 bg-slate-900 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-slate-800 sm:px-4 dark:border-white/[0.14] dark:bg-white/[0.08] dark:backdrop-blur-xl dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:bg-white/[0.12] dark:hover:border-white/20"
            >
              Get started <ArrowRight size={14} className="ml-1 inline transition group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <Link
              to="/auth/login"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-100 sm:px-4 dark:border-white/10 dark:bg-white/[0.04] dark:backdrop-blur-xl dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:text-white dark:hover:border-white/15"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function AuthShell({ mode, title, subtitle, children, switchHint, switchTo, switchLabel }) {
  return (
    <div className="min-h-screen w-full overflow-x-clip bg-slate-50 text-slate-900 dark:bg-[#04060d] dark:text-slate-100">
      <AuthNav mode={mode} />
      <div className="relative">
        <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-80 opacity-80" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-full max-w-[36rem] -translate-x-1/2 rounded-full bg-blue-600/15 blur-3xl dark:bg-blue-600/20" />
        <main className="relative mx-auto flex w-full max-w-md flex-col items-center px-4 pb-16 pt-12 md:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <Card className="w-full shadow-xl transition hover:shadow-2xl">
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
              <p className="mb-4 mt-1 text-sm text-slate-500">{subtitle}</p>
              {children}
              <p className="mt-4 text-center text-sm text-slate-500">
                {switchHint} <Link to={switchTo} className="font-medium underline underline-offset-4 transition hover:text-slate-900 dark:hover:text-white">{switchLabel}</Link>
              </p>
              </Card>
            </motion.div>
          </main>
        </div>
      </div>
    );
  }

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const target = usePostLoginTarget();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate(target, { replace: true });
    } catch (err) {
      setError(errMsg(err, 'Login failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      mode="login"
      title="Welcome back"
      subtitle="Sign in to your security analyst workspace"
      switchHint="No account?"
      switchTo="/auth/register"
      switchLabel="Create one"
    >
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div><Label>Password</Label><Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button disabled={busy}>{busy ? 'Signing in…' : 'Sign in →'}</Button>
        <OrDivider />
        <GoogleAuth text="signin_with" />
      </form>
    </AuthShell>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const target = usePostLoginTarget();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate(target, { replace: true });
    } catch (err) {
      setError(errMsg(err, 'Registration failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      mode="register"
      title="Create analyst account"
      subtitle="Role ANALYST by default · upgrade to ADMIN in the API"
      switchHint="Have an account?"
      switchTo="/auth/login"
      switchLabel="Sign in"
    >
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div><Label>Password</Label><Input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button disabled={busy}>{busy ? 'Creating…' : 'Create account →'}</Button>
        <OrDivider />
        <GoogleAuth text="signup_with" />
      </form>
    </AuthShell>
  );
}
