import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, FlaskConical, Bug, FileText, Settings, ShieldCheck, LogOut, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-200/70 bg-white/80 p-4 backdrop-blur-xl md:flex dark:border-slate-800/70 dark:bg-slate-900/80">
      <Link to="/dashboard" className="group mb-6 flex items-center gap-2.5 px-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition group-hover:scale-105 group-hover:shadow-md dark:bg-white dark:text-slate-900">
          <ShieldCheck size={18} />
        </span>
        <span className="truncate font-semibold tracking-tight">SentinelAI</span>
      </Link>
      <nav className="flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition duration-200 hover:translate-x-0.5 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
              isActive && 'translate-x-0 border border-slate-200 bg-white text-slate-900 shadow-md hover:translate-x-0 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
            )}
          >
            <Icon size={16} className="shrink-0 transition group-hover:scale-110" /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto px-2 pt-6">
        <div className="rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2.5 text-xs text-slate-500 transition hover:shadow-md dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
          SentinelAI · Security workspace
        </div>
      </div>
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
    <header className="sticky top-0 z-40 flex w-full items-center justify-between gap-3 border-b border-slate-200/70 bg-white/70 px-4 py-3 backdrop-blur-xl md:px-6 dark:border-slate-800/70 dark:bg-slate-900/70">
      <div className="flex min-w-0 items-center gap-2">
        <span className="font-semibold md:hidden">SentinelAI</span>
        <span className="hidden truncate text-sm text-slate-500 md:block">Authorized security assessment workspace</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={() => setDark((d) => !d)}
          className="rounded-lg border border-slate-200 bg-white/60 p-2 backdrop-blur transition hover:scale-105 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/60"
          title="Toggle theme"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <span className="hidden rounded-lg border border-slate-200 bg-white/60 px-3 py-2 text-sm backdrop-blur sm:block dark:border-slate-700 dark:bg-slate-800/60">
          {user?.name} · <span className="font-medium">{user?.role}</span>
        </span>
        <button
          onClick={async () => { await logout(); navigate('/auth/login'); }}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/60 px-3 py-2 text-sm backdrop-blur transition hover:-translate-y-px hover:shadow-md dark:border-slate-700 dark:bg-slate-800/60"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </header>
  );
}

export function AppLayout({ children }) {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar />
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mx-auto w-full max-w-6xl min-w-0 flex-1 p-4 md:p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
