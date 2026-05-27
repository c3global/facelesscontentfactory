import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

export default function AppShell({ session, onSignOut, plannerContext }) {
  return (
    <div
      className="app-shell"
      style={{
        display: 'grid',
        gridTemplateColumns: 'var(--sidebar-w) 1fr',
        minHeight: '100vh',
      }}
    >
      <Sidebar email={session.user.email} onSignOut={onSignOut} />
      <main style={{ minWidth: 0 }}>
        <Outlet context={plannerContext} />
      </main>

      <style>{`
        /* ---- Defaults (desktop) ---- */
        .mobile-topbar    { display: none; }
        .mobile-menu-btn  { display: none; }
        .sidebar-close-btn { display: none; }
        .mobile-overlay   { display: none; }

        /* ---- Mobile / tablet ---- */
        @media (max-width: 860px) {
          .app-shell {
            grid-template-columns: 1fr;
          }

          /* Top bar with wordmark + hamburger */
          .mobile-topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            background: var(--bg-soft);
            border-bottom: 1px solid var(--border);
            position: sticky;
            top: 0;
            z-index: 30;
          }
          .mobile-menu-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: 1px solid var(--border-strong);
            border-radius: var(--radius-md);
            padding: 8px 10px;
            color: var(--text);
            cursor: pointer;
          }
          .mobile-menu-btn:active { transform: translateY(1px); }

          /* Sidebar becomes a slide-in drawer from the right */
          .app-shell aside.sidebar {
            position: fixed;
            top: 0; right: 0; bottom: 0; left: auto;
            width: 86%;
            max-width: 360px;
            z-index: 40;
            transform: translateX(105%);
            transition: transform 240ms ease;
            border-right: none;
            border-left: 1px solid var(--border);
            box-shadow: var(--shadow-lg);
            padding-top: 56px;
            overflow-y: auto;
          }
          .app-shell aside.sidebar.is-open {
            transform: translateX(0);
          }

          /* Close button in top-right of drawer */
          .sidebar-close-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            top: 12px;
            right: 12px;
            background: transparent;
            border: none;
            width: 36px;
            height: 36px;
            font-size: 32px;
            line-height: 1;
            color: var(--text-muted);
            cursor: pointer;
          }
          .sidebar-close-btn:hover { color: var(--text); }

          .mobile-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.45);
            z-index: 35;
            animation: fadeIn 180ms ease;
          }
        }

        @media (max-width: 480px) {
          .mobile-topbar { padding: 10px 14px; }
        }
      `}</style>
    </div>
  );
}
