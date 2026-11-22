import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  ChevronDown,
  LayoutDashboard,
  Library,
  ListChecks,
  LogOut,
  Menu,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  X,
} from 'lucide-react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../lib/auth';

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
};

const NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/interview', label: 'Mock interview', icon: MessagesSquare },
  { to: '/practice', label: 'MCQ practice', icon: ListChecks },
  { to: '/questions', label: 'Question bank', icon: Library },
  { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/admin', label: 'Admin', icon: ShieldCheck, adminOnly: true },
];

const MOBILE_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/interview', label: 'Mock', icon: MessagesSquare },
  { to: '/practice', label: 'MCQ', icon: ListChecks },
  { to: '/questions', label: 'Bank', icon: Library },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

function NavRow({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      title={item.label}
      className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium
                 text-ink-500 transition hover:bg-ink-100/80 hover:text-ink-900
                 dark:text-ink-400 dark:hover:bg-ink-800/70 dark:hover:text-ink-100
                 lg:text-[#C9B9A8] lg:hover:bg-white/[0.06] lg:hover:text-white
                 dark:lg:text-ink-400"
    >
      {({ isActive }) => (
        <>
          <span
            aria-hidden="true"
            className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-indigo-500 transition-opacity ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <Icon
            className={`h-[17px] w-[17px] shrink-0 transition ${
              isActive ? 'text-indigo-600 lg:text-indigo-300 dark:text-indigo-400' : ''
            }`}
          />
          <span
            className={`flex-1 whitespace-nowrap ${
              isActive ? 'text-ink-900 lg:text-white dark:text-white' : ''
            }`}
          >
            {item.label}
          </span>
          {isActive && (
            <span className="hidden h-1.5 w-1.5 rounded-full bg-indigo-500 lg:block" />
          )}
        </>
      )}
    </NavLink>
  );
}

function UserCard({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  if (!user) return null;
  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const dark = variant === 'dark';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex w-full items-center gap-3 rounded-xl border px-2.5 py-2 text-left transition ${
          dark
            ? 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]'
            : 'border-ink-200 bg-white hover:border-ink-300 dark:border-ink-800 dark:bg-ink-900'
        }`}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-600 text-[11px] font-semibold text-white">
          {initials}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={`block truncate text-[12.5px] font-semibold ${
              dark ? 'text-ink-100' : 'text-ink-900 dark:text-white'
            }`}
          >
            {user.name}
          </span>
          <span
            className={`block truncate text-[10.5px] ${
              dark ? 'text-[#A8978A]' : 'text-ink-400'
            }`}
          >
            {user.role === 'admin' ? 'Administrator' : user.targetRole}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition ${open ? 'rotate-180' : ''} ${
            dark ? 'text-[#8A7A6D]' : 'text-ink-400'
          }`}
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-lift dark:border-ink-700 dark:bg-ink-900"
          >
            <div className="border-b border-ink-100 px-3 py-2.5 dark:border-ink-800">
              <p className="truncate text-[11.5px] text-ink-500 dark:text-ink-400">{user.email}</p>
              <p className="mt-1 text-[10.5px] text-ink-400">
                {user.experienceLevel} · {user.streakCount} day streak
              </p>
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                navigate('/profile');
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-[12.5px] font-medium text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
            >
              <UserRound className="h-4 w-4" />
              View profile
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                logout();
                navigate('/');
              }}
              className="flex w-full items-center gap-2 border-t border-ink-100 px-3 py-2.5 text-[12.5px] font-medium text-ink-600 transition hover:bg-ink-100 dark:border-ink-800 dark:text-ink-300 dark:hover:bg-ink-800"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const visibleNav = NAV.filter((item) => !item.adminOnly || user?.role === 'admin');

  return (
    <div className="min-h-dvh bg-ink-50 dark:bg-ink-950">
      {/* ---------- Desktop sidebar: espresso ink panel ---------- */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] flex-col border-r border-ink-200 bg-white px-3.5 py-5 dark:border-ink-800 dark:bg-ink-900 lg:flex lg:border-r-0 lg:bg-espresso lg:dark:bg-ink-900">
        <Link to="/dashboard" className="px-1" aria-label="PrepPulse AI dashboard">
          <span className="lg:hidden">
            <Logo />
          </span>
          <span className="hidden lg:block">
            <Logo onDark />
          </span>
        </Link>

        <p className="data-label mt-7 mb-2 px-3 hidden lg:block lg:text-[#8A7A6D]">Workspace</p>
        <p className="data-label mb-2 mt-7 px-3 lg:hidden">Workspace</p>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto no-scrollbar" aria-label="Main">
          {visibleNav.map((item) => (
            <NavRow key={item.to} item={item} />
          ))}

          <div className="mt-auto hidden rounded-xl border border-white/10 bg-white/[0.04] p-3 lg:block">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              Phase 3 · Final
            </div>
            <p className="mt-1 text-[10.5px] leading-relaxed text-[#A8978A]">
              Admin CRUD, student progress monitoring and profile editing are all live.
            </p>
          </div>

          <div className="mt-3 hidden border-t border-white/10 pt-3 lg:block">
            <UserCard variant="dark" />
          </div>

          <div className="mt-auto block border-t border-ink-100 pt-3 lg:hidden dark:border-ink-800">
            <UserCard />
          </div>
        </nav>
      </aside>

      {/* ---------- Mobile drawer ---------- */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/50 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[280px] animate-rise-in flex-col bg-espresso px-3.5 py-4">
            <div className="flex items-center justify-between px-1">
              <Logo onDark />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="grid h-9 w-9 place-items-center rounded-lg text-[#C9B9A8] hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-6 flex flex-1 flex-col gap-0.5" aria-label="Mobile main">
              {visibleNav.map((item) => (
                <NavRow key={item.to} item={item} onNavigate={() => setMobileOpen(false)} />
              ))}
            </nav>
            <div className="border-t border-white/10 pt-3">
              <UserCard variant="dark" />
            </div>
          </div>
        </div>
      )}

      {/* ---------- Main column ---------- */}
      <div className="lg:pl-[252px]">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-ink-200 bg-ink-50/90 px-4 backdrop-blur-md sm:px-6 dark:border-ink-800 dark:bg-ink-950/85">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="grid h-9 w-9 place-items-center rounded-lg border border-ink-200 bg-white text-ink-600 lg:hidden dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/dashboard" className="lg:hidden">
            <Logo size="sm" showWord={false} />
          </Link>

          <div className="hidden min-w-0 flex-1 items-center gap-2 lg:flex">
            <Target className="h-4 w-4 text-ink-400" />
            <p className="truncate text-[12.5px] text-ink-500 dark:text-ink-400">
              Goal:{' '}
              <span className="font-semibold text-ink-800 dark:text-ink-100">
                {user?.targetRole}
              </span>
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/dashboard"
              className="hidden items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100 sm:inline-flex dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Placement track
            </Link>
            <ThemeToggle />
            <div className="hidden lg:block">
              <UserCard />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1180px] px-4 pb-24 pt-5 sm:px-6 sm:pt-7 lg:pb-10">
          {children}
        </main>
      </div>

      {/* ---------- Mobile bottom nav ---------- */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden dark:border-ink-800 dark:bg-ink-900/95"
        aria-label="Bottom"
      >
        <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-ink-400 hover:text-ink-600 dark:hover:text-ink-200'
                  }`
                }
              >
                <Icon className="h-[19px] w-[19px]" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
