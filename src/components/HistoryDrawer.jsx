import { useEffect, useState } from 'react';
import { listPlans, getPlan } from '../lib/api.js';

export default function HistoryDrawer({ onClose, onSelect }) {
  const [plans, setPlans] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    listPlans().then(setPlans).catch((e) => setError(e.message));
  }, []);

  async function open(id) {
    try { onSelect(await getPlan(id)); }
    catch (e) { setError(e.message); }
  }

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(7,14,36,0.65)',
        backdropFilter: 'blur(4px)', zIndex: 50,
      }} />
      <aside className="fade-in" style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(440px, 92vw)',
        background: 'var(--bg-elevated)', borderLeft: '1px solid var(--border)',
        padding: 24, overflowY: 'auto', zIndex: 51,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div className="eyebrow">YOUR HISTORY</div>
            <h2 className="wordmark" style={{ margin: '4px 0 0', fontSize: 26 }}>My Plans</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost">Close</button>
        </div>
        {error && <div style={{ color: 'var(--danger)', marginBottom: 12 }}>{error}</div>}
        {!plans && !error && <div style={{ color: 'var(--text-muted)' }}>Loading…</div>}
        {plans?.length === 0 && (
          <div style={{ color: 'var(--text-muted)', padding: '40px 12px', textAlign: 'center' }}>
            No saved plans yet. Generate your first month and it'll appear here.
          </div>
        )}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {plans?.map((p) => (
            <li key={p.id}>
              <button onClick={() => open(p.id)} style={{
                width: '100%', textAlign: 'left', padding: 16,
                background: 'var(--surface)', border: '1px solid var(--border-muted)',
                borderRadius: 12, color: 'var(--text)', cursor: 'pointer',
                transition: 'border-color 120ms ease',
              }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{p.niche}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {new Date(p.created_at).toLocaleString()}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
