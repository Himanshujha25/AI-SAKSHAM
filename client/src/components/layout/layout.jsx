import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, FlaskConical, Bug, FileText, LogOut, Menu, X, Settings as SettingsIcon, FlaskRound, ScrollText, HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../store/auth';
import { cn } from '../../lib/utils';
import { NotificationCenter } from './NotificationCenter';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, tone: 'text-cyan-300' },
  { to: '/projects', label: 'Projects', icon: FolderKanban, tone: 'text-blue-300' },
  { to: '/assessments', label: 'Assessments', icon: FlaskConical, tone: 'text-purple-300' },
  { to: '/findings', label: 'Findings', icon: Bug, tone: 'text-amber-300' },
  { to: '/reports', label: 'Reports', icon: FileText, tone: 'text-emerald-300' },
  { to: '/api-tester', label: 'API Tester', icon: FlaskRound, tone: 'text-cyan-300' },
  { to: '/activity', label: 'Activity', icon: ScrollText, tone: 'text-violet-300' },
  { to: '/help', label: 'Help Guide', icon: HelpCircle, tone: 'text-slate-200' },
];

function Brand() {
  return (
    <Link to="/dashboard" className="group flex shrink-0 items-center gap-3">
      <span className="flex h-9 items-center rounded-lg border border-slate-700/60 bg-white px-2 shadow-sm transition duration-300 group-hover:scale-[1.03]">
        <img
          src="/Logo.png"
          alt="Saksham AI"
          className="h-6 w-auto object-contain"
        />
      </span>
      <div className="leading-none">
        <span className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] mt-0.5 group-hover:text-slate-300 transition">Command Center</span>
      </div>
    </Link>
  );
}

function desktopPill(isActive) {
  return cn(
    'group relative flex items-center gap-2 rounded-xl px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-all duration-200 border border-transparent',
    'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100 hover:border-white/10 hover:backdrop-blur-xl',
    isActive &&
      'bg-white/[0.08] backdrop-blur-xl border-white/[0.14] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
  );
}

function navPill(isActive) {
  return cn(
    'flex items-center gap-2 rounded-xl px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider transition duration-200 border border-transparent',
    'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100 hover:border-white/10 hover:backdrop-blur-xl',
    isActive && 'bg-white/[0.08] backdrop-blur-xl border-white/[0.14] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
  );
}

function NavIcon({ Icon, active }) {
  return (
    <span
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-md border transition-all duration-200',
        active
          ? 'border-white/20 bg-white/10 text-white'
          : 'border-slate-700/60 bg-slate-800/50 text-slate-500 group-hover:border-slate-600 group-hover:text-slate-200'
      )}
    >
      <Icon size={13} strokeWidth={2.2} />
    </span>
  );
}

function Avatar({ name, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title || 'Account settings'}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.08] font-mono text-xs font-extrabold text-slate-100 backdrop-blur-xl transition hover:bg-white/[0.12]"
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
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#090d16]/80 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="flex h-14 w-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Brand />
          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1.5 xl:flex">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} title={`Navigate to ${label}`} className={({ isActive }) => desktopPill(isActive)}>
                {({ isActive }) => (
                  <>
                    <NavIcon Icon={Icon} active={isActive} />
                    <span>{label}</span>
                  </>
                )}
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
            className="hidden items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-xl px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-200 transition hover:bg-white/[0.08] hover:text-white hover:border-white/15 sm:flex"
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
                  {({ isActive }) => (
                    <>
                      <NavIcon Icon={Icon} active={isActive} />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
              <NavLink to="/settings" onClick={() => setOpen(false)} className={({ isActive }) => navPill(isActive)}>
                {({ isActive }) => (
                  <>
                    <NavIcon Icon={SettingsIcon} active={isActive} />
                    Settings
                  </>
                )}
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
        className="mx-auto w-full max-w-7xl min-w-0 flex-1 px-4 md:px-6 lg:px-8 pt-6 pb-16"
      >
        {children}
      </motion.main>
    </div>
  );
}
