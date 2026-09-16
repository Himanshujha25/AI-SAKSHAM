import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Sun, ArrowRight, Shield, Crown, Eye, Zap } from 'lucide-react';
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
    <header className="shrink-0 z-50 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-[#04060d]/70">
      <div className="flex h-14 md:h-16 w-full items-center justify-between px-4 md:px-8">
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
              className="group flex min-h-[40px] items-center rounded-xl border border-slate-900 bg-slate-900 px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-slate-800 sm:px-4 dark:border-white/[0.14] dark:bg-white/[0.08] dark:backdrop-blur-xl dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:bg-white/[0.12] dark:hover:border-white/20"
            >
              <span>Get started</span> <ArrowRight size={14} className="ml-1 inline transition group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <Link
              to="/auth/login"
              className="flex min-h-[40px] items-center rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-100 sm:px-4 dark:border-white/10 dark:bg-white/[0.04] dark:backdrop-blur-xl dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:text-white dark:hover:border-white/15"
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
    <div className="h-screen max-h-screen w-full flex flex-col overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#04060d] dark:text-slate-100">
      <AuthNav mode={mode} />
      <div className="relative flex-1 flex flex-col items-center justify-center min-h-0 overflow-y-auto sm:overflow-hidden px-4 py-2 sm:py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-80 opacity-80" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-full max-w-[36rem] -translate-x-1/2 rounded-full bg-blue-600/15 blur-3xl dark:bg-blue-600/20" />
        <main className="relative mx-auto w-full max-w-md my-auto">
          <Card className="w-full shadow-2xl p-4 sm:p-5 my-auto border-slate-200 dark:border-slate-800">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
            <p className="mb-3 mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
            {children}
            <p className="mt-2.5 text-center text-xs text-slate-500 dark:text-slate-400">
              {switchHint} <Link to={switchTo} className="font-semibold text-cyan-500 hover:text-cyan-400 underline underline-offset-4">{switchLabel}</Link>
            </p>
          </Card>
        </main>
      </div>
    </div>
  );
}

export function Login() {
  const { login, demoLogin, register } = useAuth();
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

  const handleDemo = async (role) => {
    setBusy(true);
    setError('');
    try {
      await demoLogin(role);
      navigate(target, { replace: true });
    } catch (err) {
      if (import.meta.env.PROD) {
        setError('1-Click Demo accounts are disabled in production mode. Please sign in with your enterprise credentials.');
        return;
      }
      // Dev mode fallback only
      const demoUsers = {
        ANALYST: { name: 'Lead SOC Analyst', email: 'analyst@saksham.ai', password: 'DemoPassword123!' },
        ADMIN: { name: 'Security Administrator', email: 'admin@saksham.ai', password: 'DemoPassword123!' },
        VIEWER: { name: 'Compliance Auditor', email: 'viewer@saksham.ai', password: 'DemoPassword123!' },
      };
      const creds = demoUsers[role] || demoUsers.ANALYST;
      try {
        await login(creds.email, creds.password);
        navigate(target, { replace: true });
      } catch {
        try {
          await register(creds.name, creds.email, creds.password, role);
          navigate(target, { replace: true });
        } catch (regErr) {
          setError(errMsg(regErr, 'Demo access failed'));
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      mode="login"
      title="Welcome back"
      subtitle="Sign in to your security workspace · Analyst, Admin, or Auditor"
      switchHint="No account?"
      switchTo="/auth/register"
      switchLabel="Create one"
    >
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Zap size={13} className="text-cyan-400 shrink-0" />
            <span>1-Click Demo Role Access:</span>
          </span>
          <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-500">Instant</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemo('ANALYST')}
            disabled={busy}
            className="group flex min-h-[44px] flex-col items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/5 p-2 text-center transition hover:border-blue-500 hover:bg-blue-500/15 active:scale-[0.98] disabled:opacity-50"
            title="Log in as Security Analyst"
          >
            <Shield size={18} className="text-blue-400" />
            <span className="mt-1 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">Analyst</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">SOC & Audits</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemo('ADMIN')}
            disabled={busy}
            className="group flex min-h-[44px] flex-col items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/5 p-2 text-center transition hover:border-purple-500 hover:bg-purple-500/15 active:scale-[0.98] disabled:opacity-50"
            title="Log in as System Admin"
          >
            <Crown size={18} className="text-purple-400" />
            <span className="mt-1 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">Admin</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Full Control</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemo('VIEWER')}
            disabled={busy}
            className="group flex min-h-[44px] flex-col items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-2 text-center transition hover:border-emerald-500 hover:bg-emerald-500/15 active:scale-[0.98] disabled:opacity-50"
            title="Log in as Compliance Auditor"
          >
            <Eye size={18} className="text-emerald-400" />
            <span className="mt-1 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">Auditor</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Read-Only</span>
          </button>
        </div>
      </div>

      <OrDivider />

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
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'ANALYST' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form.name, form.email, form.password, form.role);
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
      title="Create account"
      subtitle="Select your organizational role with strict RBAC enforcement"
      switchHint="Have an account?"
      switchTo="/auth/login"
      switchLabel="Sign in"
    >
      <form onSubmit={submit} className="flex flex-col gap-2.5">
        <div><Label className="text-[11px] mb-0.5">Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><Label className="text-[11px] mb-0.5">Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div><Label className="text-[11px] mb-0.5">Password</Label><Input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        <div>
          <Label className="text-[11px] mb-0.5">Select Role (RBAC)</Label>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {[
              { id: 'ANALYST', label: 'Analyst', icon: Shield, tone: 'text-blue-500 dark:text-blue-400', desc: 'SOC & Scans' },
              { id: 'ADMIN', label: 'Admin', icon: Crown, tone: 'text-purple-500 dark:text-purple-400', desc: 'Full Control' },
              { id: 'VIEWER', label: 'Auditor', icon: Eye, tone: 'text-emerald-500 dark:text-emerald-400', desc: 'Read-Only' },
            ].map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.id })}
                  className={`flex flex-col items-center justify-center rounded-xl border p-1.5 sm:p-2 text-center transition ${
                    form.role === r.id
                      ? 'border-blue-500 bg-blue-500/15 ring-2 ring-blue-500/30 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Icon size={16} className={form.role === r.id ? '' : r.tone} />
                  <span className="mt-1 text-xs font-bold leading-none">{r.label}</span>
                  <span className="text-[9px] mt-0.5 opacity-75 leading-none">{r.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <Button disabled={busy} className="mt-1 min-h-[40px]">{busy ? 'Creating…' : 'Create account →'}</Button>
        <OrDivider />
        <GoogleAuth text="signup_with" />
      </form>
    </AuthShell>
  );
}
