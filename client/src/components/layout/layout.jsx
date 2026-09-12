import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, FlaskConical, Bug, FileText, ShieldCheck, LogOut, Moon, Sun, Menu, X, Settings as SettingsIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../store/auth';
import { cn } from '../../lib/utils';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/assessments', label: 'Assessments', icon: FlaskConical },
  { to: '/findings', label: 'Findings', icon: Bug },
  { to: '/reports', label: 'Reports', icon: FileText },
];

function Brand() {
  return (
    <Link to="/dashboard" className="group flex shrink-0 items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm transition group-hover:scale-105 dark:bg-gradient-to-br dark:from-cyan-400 dark:to-blue-600 dark:text-slate-950 dark:shadow-[0_0_24px_-6px_rgba(34,211,238,0.8)]">
        <ShieldCheck size={18} />
      </span>
      <span className="leading-tight">
        <span className="block truncate font-semibold tracking-tight">SentinelAI</span>
        <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Command Center</span>
      </span>
    </Link>
  );
}

// Frosted-glass pill (reference style) — bright, clear, no neon glow.
function navPill(isActive) {
  return cn(
    'relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition duration-200',
    'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.07] dark:hover:text-white',
    isActive && 'bg-slate-900 text-white shadow-md hover:text-white dark:bg-white/[0.16] dark:text-white dark:ring-1 dark:ring-white/30 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.25)] dark:hover:text-white'
  );
}

// Desktop pill: frosted highlight SLIDES between tabs (layoutId).
function desktopPill(isActive) {
  return cn(
    'relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
    'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
    isActive && 'text-slate-900 dark:text-white'
  );
}

function Avatar({ name, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title || 'Account settings'}
      className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-600/20 text-sm font-bold text-cyan-300 ring-1 ring-cyan-400/30 transition hover:scale-110 hover:shadow-lg hover:ring-cyan-400/60 dark:hover:shadow-[0_0_24px_-4px_rgba(34,211,238,0.5)]"
    >
      {(name || 'A').charAt(0).toUpperCase()}
    </button>
  );
}

export function TopNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('sentinelai_theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    if (!localStorage.getItem('sentinelai_theme')) document.documentElement.classList.add('dark');
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-gradient-to-r from-[#04060d]/80 to-[#0a0f1e]/80 backdrop-blur-2xl shadow-lg shadow-black/20 dark:shadow-[0_0_60px_-20px_rgba(34,211,238,0.2)]">
      <div className="grid h-16 w-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 md:px-6">
        <div className="flex min-w-0 justify-start">
          <Brand />
        </div>

        {/* Desktop nav — dead center */}
        <nav className="hidden items-center justify-center gap-1 lg:flex">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => desktopPill(isActive)}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400/20 to-blue-500/10 ring-1 ring-cyan-400/30 shadow-[0_0_24px_-8px_rgba(34,211,238,0.4)]"
                      transition={{ type: 'spring', bounce: 0.16, duration: 0.55 }}
                    />
                  )}
                  <Icon size={16} className="relative" /> <span className="relative text-sm">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2.5">
          <span className="hidden items-center gap-1.5 rounded-lg border border-emerald-400/30 bg-gradient-to-r from-emerald-500/10 to-emerald-400/5 px-3 py-1.5 text-[11px] font-semibold text-emerald-300 xl:inline-flex shadow-[0_0_12px_-4px_rgba(52,211,153,0.3)]">
            <span className="live-dot relative inline-block h-2 w-2 rounded-full bg-current" /> API LIVE
          </span>
          <button
            onClick={() => setDark((d) => !d)}
            className="rounded-lg border border-white/[0.12] bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-2 backdrop-blur transition duration-200 hover:scale-110 hover:border-white/[0.2] hover:shadow-[0_0_20px_-6px_rgba(34,211,238,0.3)]"
            title="Toggle theme"
          >
            {dark ? <Sun size={16} className="text-amber-300" /> : <Moon size={16} className="text-slate-700" />}
          </button>
          <Avatar name={user?.name} onClick={() => navigate('/settings')} title={`${user?.name || 'Account'} · ${user?.role || ''} — open settings`} />
          <button
            onClick={async () => { await logout(); navigate('/auth/login'); }}
            className="hidden items-center gap-1.5 rounded-lg border border-white/[0.12] bg-gradient-to-br from-white/[0.08] to-white/[0.03] px-3 py-2 text-sm font-medium backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-white/[0.2] hover:shadow-[0_0_20px_-6px_rgba(34,211,238,0.3)] sm:flex text-slate-300 hover:text-white"
          >
            <LogOut size={15} /> Logout
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-lg border border-white/[0.12] bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-2 backdrop-blur transition duration-200 hover:border-white/[0.2] hover:shadow-[0_0_20px_-6px_rgba(34,211,238,0.3)] lg:hidden"
            title="Menu"
          >
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-white/[0.08] lg:hidden bg-gradient-to-b from-white/[0.05] to-transparent"
          >
            <div className="grid grid-cols-2 gap-2 p-4">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => navPill(isActive)}>
                  <Icon size={15} /> {label}
                </NavLink>
              ))}
              <NavLink to="/settings" onClick={() => setOpen(false)} className={({ isActive }) => navPill(isActive)}>
                <SettingsIcon size={15} /> Settings
              </NavLink>
              <button
                onClick={async () => { setOpen(false); await logout(); navigate('/auth/login'); }}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] sm:hidden"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export function AppLayout({ children }) {
  const { pathname } = useLocation();
  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-[#04060d] text-slate-100">
      {/* Premium ambient gradient effects */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-cyan-600/[0.15] via-blue-600/[0.08] to-transparent" />
        <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-blue-600/[0.08] blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 h-96 w-96 rounded-full bg-cyan-500/[0.06] blur-3xl" />
      </div>
      <TopNavbar />
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative z-10 mx-auto w-full max-w-7xl min-w-0 flex-1 p-5 md:p-8"
      >
        {children}
      </motion.main>
    </div>
  );
}
