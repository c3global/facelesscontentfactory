import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

export default function AppShell({ session, onSignOut, plannerContext }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'var(--sidebar-w) 1fr',
      minHeight: '100vh',
    }}
    className="app-shell">
      <Sidebar email={session.user.email} onSignOut={onSignOut} />
      <main style={{ minWidth: 0 }}>
        <Outlet context={plannerContext} />
      </main>

      <style>{`
        @media (max-width: 860px) {
          .app-shell { grid-template-columns: 1fr; }
          .app-shell aside.sidebar {
            position: sticky; top: 0; z-index: 30;
            width: 100%; height: auto; min-height: auto;
            flex-direction: row; align-items: center;
            padding: 12px 16px;
            border-right: none;
            border-bottom: 1px solid var(--border);
          }
          .app-shell aside.sidebar .sidebar__nav { flex-direction: row; gap: 4px; flex: 1; margin: 0 12px; }
          .app-shell aside.sidebar .sidebar__nav a { padding: 8px 10px; font-size: 13px; }
          .app-shell aside.sidebar .sidebar__nav a .nav-label { display: none; }
          .app-shell aside.sidebar .sidebar__footer { flex-direction: row; gap: 8px; margin-top: 0; }
          .app-shell aside.sidebar .sidebar__email { display: none; }
        }
      `}</style>
    </div>
  );
}
