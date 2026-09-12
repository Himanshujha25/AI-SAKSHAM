import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, FlaskConical, Bug, FileText, ShieldCheck, LogOut, Menu, X, Settings as SettingsIcon, FlaskRound, ScrollText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../store/auth';
import { cn } from '../../lib/utils';
import { NotificationCenter } from './NotificationCenter';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/assessments', label: 'Assessments', icon: FlaskConical },
  { to: '/findings', label: 'Findings', icon: Bug },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/api-tester', label: 'API Tester', icon: FlaskRound },
  { to: '/activity', label: 'Activity', icon: ScrollText },
];

function Brand() {
  return (
    <Link to="/dashboard" className="group flex shrink-0 items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
        <ShieldCheck size={18} />
      </div>
      <div className="leading-none">
        <span className="block truncate font-bold text-sm text-slate-100 tracking-tight">Saksham AI</span>
        <span className="block text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider mt-0.5">Command Center</span>
      </div>
    </Link>
  );
}

function desktopPill(isActive) {
  return cn(
    'relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-150',
    'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60',
    isActive && 'text-white bg-slate-800/90 border border-slate-700/60'
  );
}

function navPill(isActive) {
  return cn(
    'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition duration-150',
    'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
    isActive && 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
  );
}

function Avatar({ name, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title || 'Account settings'}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-xs font-bold text-cyan-400 transition hover:border-slate-700 hover:bg-slate-800"
    >
      {(name || 'A').charAt(0).toUpperCase()}
    </button>
  );
}

export function TopNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090d16]/95 backdrop-blur-md">
      <div className="flex h-14 w-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Brand />
          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1.5 xl:flex">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} title={`Navigate to ${label}`} className={({ isActive }) => desktopPill(isActive)}>
                <Icon size={14} className="text-slate-400" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <NotificationCenter />
          <Avatar name={user?.name} onClick={() => navigate('/settings')} title={`${user?.name || 'Account'} (${user?.role || 'User'}) — Click to view settings`} />
          <button
            onClick={async () => { await logout(); navigate('/', { replace: true }); }}
            title="Log out of Saksham AI Command Center"
            className="hidden items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white sm:flex"
          >
            <LogOut size={13} /> Logout
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-lg border border-slate-800 p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white xl:hidden"
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
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-t border-slate-800 bg-[#090d16] xl:hidden"
          >
            <div className="grid grid-cols-2 gap-2 p-3">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => navPill(isActive)}>
                  <Icon size={14} /> {label}
                </NavLink>
              ))}
              <NavLink to="/settings" onClick={() => setOpen(false)} className={({ isActive }) => navPill(isActive)}>
                <SettingsIcon size={14} /> Settings
              </NavLink>
              <button
                onClick={async () => { setOpen(false); await logout(); navigate('/', { replace: true }); }}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800 sm:hidden"
              >
                <LogOut size={14} /> Logout
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
    <div className="min-h-screen w-full bg-[#050811] text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      <TopNavbar />
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="mx-auto w-full max-w-7xl min-w-0 flex-1 px-4 md:px-6 lg:px-8 pt-2 pb-6 md:pb-8"
      >
        {children}
      </motion.main>
    </div>
  );
}
