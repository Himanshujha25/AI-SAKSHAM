import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  FlaskConical,
  Bug,
  FileText,
  LogOut,
  Menu,
  X,
  Settings as SettingsIcon,
  FlaskRound,
  ScrollText,
  HelpCircle,
  Zap,
  Shield,
  Eye,
  Lock,
  ChevronRight,
  User,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../store/auth';
import { cn } from '../../lib/utils';
import { NotificationCenter } from './NotificationCenter';
import { SakshamLogo } from '../shared/SakshamLogo';

// Primary navigation links for desktop
const primaryLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/assessments', label: 'Assessments', icon: FlaskConical },
  { to: '/findings', label: 'Findings', icon: Bug },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/api-tester', label: 'API Tester', icon: FlaskRound },
  { to: '/activity', label: 'Activity', icon: ScrollText },
  { to: '/help', label: 'Help Guide', icon: HelpCircle },
];

// Top 5 actions for mobile bottom navigation
const bottomNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/assessments', label: 'Assessments', icon: FlaskConical },
  { to: '/assessments?action=new', label: 'New Scan', icon: Zap, isCta: true },
  { to: '/findings', label: 'Findings', icon: Bug },
  { to: '/reports', label: 'Reports', icon: FileText },
];

function Brand() {
  return (
    <Link to="/dashboard" className="group flex shrink-0 items-center gap-2.5 transition-transform hover:opacity-95" aria-label="Saksham AI Dashboard">
      <SakshamLogo size="md" variant="full" subtitle={false} />
    </Link>
  );
}

function desktopPill(isActive) {
  return cn(
    'group relative flex min-h-[44px] items-center gap-2 rounded-xl px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider transition-all duration-150 border border-transparent',
    'text-slate-400 hover:bg-white/[0.06] hover:text-slate-100 hover:border-white/10',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
    isActive && 'bg-white/[0.08] border-white/[0.14] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
  );
}

function NavIcon({ Icon, active }) {
  return (
    <span
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-md border transition-all duration-150',
        active
          ? 'border-white/20 bg-white/10 text-white'
          : 'border-slate-700/60 bg-slate-800/50 text-slate-400 group-hover:border-slate-600 group-hover:text-slate-200'
      )}
    >
      <Icon size={14} strokeWidth={2.2} />
    </span>
  );
}

// Touch-friendly and accessible Account Menu
function AccountMenu({ user, onOpenSettings, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { pathname } = useLocation();

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Click outside listener for touch and desktop
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="User Account Menu"
        className={cn(
          'flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 select-none items-center justify-center overflow-hidden rounded-xl border transition',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
          open
            ? 'border-cyan-400/50 bg-cyan-950/40'
            : 'border-white/15 bg-white/[0.08] hover:bg-white/[0.12]'
        )}
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || 'Account'}
            draggable={false}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-mono text-xs font-extrabold text-slate-100">
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#0b1120] shadow-2xl shadow-black/80"
          >
            {/* User Identity */}
            <div className="flex items-center gap-3 p-4">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  draggable={false}
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 shrink-0 rounded-lg border border-white/15 object-cover"
                />
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

            {/* Role & Access Badges */}
            <div className="flex flex-wrap items-center gap-1.5 px-4 pb-3">
              <span className="inline-flex items-center gap-1 rounded-md border border-cyan-500/25 bg-cyan-500/[0.08] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                <Shield className="h-2.5 w-2.5" />
                {user?.role || 'ANALYST'}
              </span>
              <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300">
                {(user?.provider || 'local') === 'google' ? 'Google Auth' : 'Password Auth'}
              </span>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-2 border-t border-white/[0.07] px-4 py-3 font-mono text-[11px]">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">Member Since</p>
                <p className="mt-0.5 font-semibold text-slate-200">{memberSince}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">Account ID</p>
                <p className="mt-0.5 font-semibold text-slate-200">
                  {user?.id || user?._id ? String(user.id || user._id).slice(-8).toUpperCase() : '—'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 border-t border-white/[0.07] p-3">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onOpenSettings();
                }}
                className="flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-white/[0.08] border border-white/[0.14] px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-white/[0.12]"
              >
                <SettingsIcon size={14} /> Settings
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact Mobile-First Top Navbar
export function TopNavbar({ onOpenMobileMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#090d16]/90 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="flex h-14 w-full items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-4 lg:gap-8">
          <Brand />
          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary Navigation">
            {primaryLinks.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => desktopPill(isActive)}>
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

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Role Indicator — Professional cybersecurity badge with standard icon */}
          {user && (
            <div
              title={`Role: ${user.role || 'ANALYST'}`}
              className={cn(
                'hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-mono text-xs font-bold uppercase tracking-wider',
                user.role === 'ADMIN'
                  ? 'border-purple-500/40 bg-purple-500/10 text-purple-300'
                  : user.role === 'VIEWER'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
              )}
            >
              {user.role === 'ADMIN' ? (
                <Lock size={12} className="text-purple-400" />
              ) : user.role === 'VIEWER' ? (
                <Eye size={12} className="text-emerald-400" />
              ) : (
                <Shield size={12} className="text-cyan-400" />
              )}
              <span>{user.role === 'ADMIN' ? 'Admin' : user.role === 'VIEWER' ? 'Auditor' : 'Analyst'}</span>
            </div>
          )}

          {user?.role !== 'VIEWER' && <NotificationCenter />}

          <AccountMenu
            user={user}
            onOpenSettings={() => navigate('/settings')}
            onLogout={async () => {
              await logout();
              navigate('/', { replace: true });
            }}
          />

          {/* Mobile Drawer Trigger (min 44px touch target) */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white xl:hidden"
            aria-label="Open Navigation Drawer"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

// Sticky Mobile Bottom Navigation for the Top 5 Primary Actions
export function MobileBottomNav({ onQuickScan }) {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-[#090d16]/95 backdrop-blur-2xl md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1 safe-area-pb">
        {bottomNavItems.map(({ to, label, icon: Icon, isCta }) => {
          const isActive = location.pathname === to.split('?')[0];

          if (isCta) {
            return (
              <Link
                key={to}
                to={to}
                onClick={onQuickScan}
                className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 text-center group"
                aria-label={label}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-transform group-active:scale-95">
                  <Zap size={18} className="fill-current" />
                </span>
                <span className="mt-1 font-mono text-[9px] font-bold uppercase tracking-wider text-cyan-400">
                  {label}
                </span>
              </Link>
            );
          }

          return (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 text-center transition group active:scale-95"
              aria-label={label}
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                      isActive ? 'bg-cyan-500/15 text-cyan-300' : 'text-slate-400 group-hover:text-slate-200'
                    )}
                  >
                    <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                  </span>
                  <span
                    className={cn(
                      'mt-0.5 font-mono text-[9px] font-bold uppercase tracking-wider truncate max-w-full px-1',
                      isActive ? 'text-cyan-300' : 'text-slate-500 group-hover:text-slate-300'
                    )}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

// Mobile Slide-Out Drawer for Secondary Navigation & Operations
export function MobileMenuDrawer({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const allLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/assessments', label: 'Assessments', icon: FlaskConical },
    { to: '/findings', label: 'Findings', icon: Bug },
    { to: '/reports', label: 'Reports', icon: FileText },
    { to: '/projects', label: 'Projects & Targets', icon: FolderKanban },
    { to: '/api-tester', label: 'API Security Tester', icon: FlaskRound },
    { to: '/activity', label: 'Audit Activity Log', icon: ScrollText },
    { to: '/help', label: 'Documentation & Guide', icon: HelpCircle },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm xl:hidden"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col border-l border-white/10 bg-[#070b16] shadow-2xl xl:hidden"
            role="dialog"
            aria-label="Navigation Menu"
          >
            {/* Drawer Header */}
            <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
                Navigation Menu
              </span>
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white"
                aria-label="Close Navigation"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {allLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-[44px] items-center justify-between rounded-xl px-3.5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition',
                      isActive
                        ? 'border border-cyan-500/40 bg-cyan-950/40 text-cyan-200'
                        : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon size={16} className={isActive ? 'text-cyan-400' : 'text-slate-500'} />
                        <span>{label}</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-600" />
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-white/10 p-4 safe-area-pb">
              <button
                type="button"
                onClick={async () => {
                  onClose();
                  await logout();
                  navigate('/', { replace: true });
                }}
                className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-red-300 hover:bg-red-500/20 transition"
              >
                <LogOut size={15} />
                <span>Logout Session</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// App Layout with Mobile-First padding & structure
export function AppLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen w-full bg-[#04060d] text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      <TopNavbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
      <MobileMenuDrawer isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="mx-auto w-full max-w-7xl min-w-0 px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-12"
      >
        {children}
      </motion.main>

      <MobileBottomNav onQuickScan={() => {}} />
    </div>
  );
}
