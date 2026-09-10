import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, FlaskConical, Bug, FileText, Settings, ShieldCheck, LogOut, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../store/auth';
import { cn } from '../../lib/utils';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/assessments', label: 'Assessments', icon: FlaskConical },
  { to: '/findings', label: 'Findings', icon: Bug },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function AppSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:flex">
      <Link to="/dashboard" className="mb-6 flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900">
          <ShieldCheck size={18} />
        </span>
        <span className="font-semibold tracking-tight">SentinelAI</span>
      </Link>
      <nav className="flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn('flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800', isActive && 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white')}
          >
            <Icon size={16} /> {label}
          </NavLink>
        ))}
      </nav>
      <p className="mt-auto px-2 pt-6 text-xs text-slate-400">SIH 2026 · PS 26163 · NTRO</p>
    </aside>
  );
}

export function TopNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('sentinelai_theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    if (localStorage.getItem('sentinelai_theme') === 'dark') document.documentElement.classList.add('dark');
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:px-6">
      <div className="md:hidden font-semibold">SentinelAI</div>
      <div className="hidden md:block text-sm text-slate-500">Authorized security assessment workspace</div>
      <div className="flex items-center gap-2">
        <button onClick={() => setDark((d) => !d)} className="rounded-lg border border-slate-200 p-2 dark:border-slate-700" title="Toggle theme">
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <span className="hidden text-sm sm:block">{user?.name} · {user?.role}</span>
        <button
          onClick={async () => { await logout(); navigate('/auth/login'); }}
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </header>
  );
}

export function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar />
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
