import { NavLink } from 'react-router-dom';
import Wordmark from './Wordmark.jsx';
import { useTheme } from '../lib/theme-context.jsx';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/planner',   label: 'Planner',   icon: PlannerIcon },
  { to: '/calendar',  label: 'Calendar',  icon: CalendarIcon },
  { to: '/library',   label: 'Library',   icon: LibraryIcon },
  { to: '/brand',     label: 'Brand',     icon: BrandIcon },
];

export default function Sidebar({ email, onSignOut }) {
  const { mode, toggle } = useTheme();
  return (
    <aside className="sidebar" style={{
      display: 'flex', flexDirection: 'column',
      width: 'var(--sidebar-w)', minHeight: '100vh',
      padding: '28px 18px 20px',
      background: 'var(--bg-soft)',
      borderRight: '1px solid var(--border)',
      position: 'sticky', top: 0,
      gap: 20,
    }}>
      <div style={{ padding: '0 6px' }}>
        <Wordmark size="md" />
      </div>

      <nav className="sidebar__nav" style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8 }}>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar__link${isActive ? ' is-active' : ''}`}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--text-ec-lg)',
              fontWeight: isActive ? 700 : 600,
              letterSpacing: '0.03em',
              color: isActive ? 'var(--text)' : 'var(--text-muted)',
              background: isActive ? 'var(--surface)' : 'transparent',
              border: '1px solid',
              borderColor: isActive ? 'var(--border)' : 'transparent',
              boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
              transition: 'background 120ms, color 120ms',
            })}
          >
            <Icon />
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      <div className="sidebar__footer" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={toggle}
          className="btn btn-ghost"
          style={{ justifyContent: 'flex-start', padding: '10px 12px' }}
          aria-label="Toggle theme"
        >
          {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
          <span>{mode === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>
        <div className="sidebar__email" style={{
          fontSize: 13, color: 'var(--text-faint)',
          padding: '0 4px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{email}</div>
        <button
          onClick={onSignOut}
          className="btn btn-ghost"
          style={{ justifyContent: 'flex-start', padding: '10px 12px' }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}

/* ----- Inline icons (stroke uses currentColor) ----- */
function iconProps(extra = {}) {
  return {
    width: 18, height: 18, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
    ...extra,
  };
}
function DashboardIcon() { return (
  <svg {...iconProps()}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
); }
function PlannerIcon() { return (
  <svg {...iconProps()}><path d="M4 5h16v4H4z"/><path d="M4 11h10v4H4z"/><path d="M4 17h7v3H4z"/></svg>
); }
function CalendarIcon() { return (
  <svg {...iconProps()}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 3v4"/><path d="M16 3v4"/><circle cx="8" cy="14" r="0.8" fill="currentColor"/><circle cx="12" cy="14" r="0.8" fill="currentColor"/><circle cx="16" cy="14" r="0.8" fill="currentColor"/></svg>
); }
function LibraryIcon() { return (
  <svg {...iconProps()}><path d="M4 4v16"/><path d="M8 4v16"/><rect x="12" y="4" width="8" height="16" rx="1.5"/></svg>
); }
function BrandIcon() { return (
  <svg {...iconProps()}><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18"/><path d="M3 12h18"/></svg>
); }
function SunIcon() { return (
  <svg {...iconProps()}><circle cx="12" cy="12" r="4"/><path d="M12 3v2"/><path d="M12 19v2"/><path d="M5 5l1.5 1.5"/><path d="M17.5 17.5L19 19"/><path d="M3 12h2"/><path d="M19 12h2"/><path d="M5 19l1.5-1.5"/><path d="M17.5 6.5L19 5"/></svg>
); }
function MoonIcon() { return (
  <svg {...iconProps()}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
); }
