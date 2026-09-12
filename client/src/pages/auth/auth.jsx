import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, Moon, Sun, ArrowRight } from 'lucide-react';
import { useAuth } from '../../store/auth';
import { errMsg } from '../../lib/utils';
import { Button, Card, Input, Label } from '../../components/ui/primitives';

function AuthThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('sentinelai_theme', dark ? 'dark' : 'light');
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
        <Link to="/" className="group flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white transition group-hover:scale-105 dark:bg-white dark:text-slate-900">
            <ShieldCheck size={18} />
          </span>
          <span className="truncate font-semibold tracking-tight">SentinelAI</span>
        </Link>
        <div className="flex min-w-0 shrink-0 items-center gap-2">
          <AuthThemeToggle />
          <Link
            to="/"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:inline-flex dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <ArrowLeft size={14} /> Home
          </Link>
          {mode === 'login' ? (
            <Link
              to="/auth/register"
              className="group rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:shadow-lg sm:px-4 dark:bg-white dark:text-slate-900"
            >
              Get started <ArrowRight size={14} className="ml-1 inline transition group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <Link
              to="/auth/login"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md sm:px-4 dark:border-slate-700 dark:hover:bg-slate-800"
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
            <p className="mt-4 text-center text-xs text-slate-400">Authorized testing only · JWT-protected workspace</p>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
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
        <Button disabled={busy} className="transition hover:-translate-y-0.5 hover:shadow-lg">{busy ? 'Signing in…' : 'Sign in →'}</Button>
      </form>
    </AuthShell>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
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
        <Button disabled={busy} className="transition hover:-translate-y-0.5 hover:shadow-lg">{busy ? 'Creating…' : 'Create account →'}</Button>
      </form>
    </AuthShell>
  );
}
