import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, FlaskConical, Bug, FileText, LogOut, Menu, X, Settings as SettingsIcon, FlaskRound, ScrollText, HelpCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../store/auth';
import { cn } from '../../lib/utils';
import { NotificationCenter } from './NotificationCenter';
import { SakshamLogo } from '../shared/SakshamLogo';

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
    <Link to="/dashboard" className="group flex shrink-0 items-center gap-3 transition-transform hover:opacity-95">
      <SakshamLogo size="md" variant="full" subtitle={true} />
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

function Avatar({ name, avatar, onOpen }) {
  const [imgOk, setImgOk] = useState(true);
  useEffect(() => { setImgOk(true); }, [avatar]);
  // onMouseDown (left button) fires even if the browser suppresses the
  // click (e.g. micro-drag on the photo); onClick covers keyboard/assistive.
  const go = (e) => {
    if (e && e.type === 'mousedown' && e.button !== 0) return;
    onOpen?.();
  };
  return (
    <button
      type="button"
      onClick={go}
      onMouseDown={go}
      title={`${name || 'Account'} — Click to view settings`}
      className="flex h-8 w-8 shrink-0 select-none items-center justify-center overflow-hidden rounded-lg border border-white/15 bg-white/[0.08] font-mono text-xs font-extrabold text-slate-100 backdrop-blur-xl transition hover:bg-white/[0.12]"
    >
      {avatar && imgOk ? (
        <img
          src={avatar}
          alt={name || 'Account'}
          draggable={false}
          referrerPolicy="no-referrer"
          onError={() => setImgOk(false)}
          className="pointer-events-none h-full w-full object-cover"
        />
      ) : (
        (name || 'A').charAt(0).toUpperCase()
      )}
    </button>
  );
}

// SaaS-style account menu: hover the avatar → premium info card,
// move mouse away → closes, click avatar → settings page.
function AccountMenu({ user, onOpenSettings, onLogout }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);
  const { pathname } = useLocation();

  // Always hide the menu after navigation (settings opens clean).
  useEffect(() => { setOpen(false); }, [pathname]);

  const handleEnter = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    setOpen(true);
  };
  const handleLeave = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <Avatar
        name={user?.name}
        avatar={user?.avatar}
        onOpen={() => { setOpen(false); onOpenSettings(); }}
      />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-white/10 bg-[#0b1120] shadow-2xl shadow-black/60"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />
            {/* Identity */}
            <div className="flex items-center gap-3 p-4">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} draggable={false} referrerPolicy="no-referrer" className="h-10 w-10 shrink-0 rounded-lg border border-white/15 object-cover" />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.08] font-mono text-sm font-extrabold text-slate-100">
                  {(user?.name || 'A').charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold tracking-tight text-white">{user?.name || 'Account'}</p>
                <p className="truncate font-mono text-[11px] text-slate-400">{user?.email || ''}</p>
              </div>
            </div>
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 px-4 pb-3">
              <span className="rounded-md border border-cyan-500/25 bg-cyan-500/[0.08] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                {user?.role || 'ANALYST'}
              </span>
              <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300">
                {(user?.provider || 'local') === 'google' ? 'Google login' : 'Password login'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/25 bg-emerald-500/[0.08] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                <span className="h-1 w-1 rounded-full bg-current" /> Active
              </span>
            </div>
            {/* Meta */}
            <div className="grid grid-cols-2 gap-2 border-t border-white/[0.07] px-4 py-3 font-mono text-[11px]">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">Member since</p>
                <p className="mt-0.5 font-semibold text-slate-200">{memberSince}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">Account ID</p>
                <p className="mt-0.5 font-semibold text-slate-200">{user?.id ? String(user.id).slice(-8).toUpperCase() : '—'}</p>
              </div>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2 border-t border-white/[0.07] p-3">
              <button
                onClick={() => { setOpen(false); onOpenSettings(); }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/[0.08] backdrop-blur-xl border border-white/[0.14] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-white/[0.12] hover:border-white/20"
              >
                <SettingsIcon size={13} /> Settings
              </button>
              <button
                onClick={() => { setOpen(false); onLogout(); }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-xl px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300 transition hover:bg-white/[0.08] hover:text-white hover:border-white/15"
              >
                <LogOut size={13} /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
          <AccountMenu
            user={user}
            onOpenSettings={() => navigate('/settings')}
            onLogout={async () => { await logout(); navigate('/', { replace: true }); }}
          />
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
