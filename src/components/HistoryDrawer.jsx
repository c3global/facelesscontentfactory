import { useEffect, useState } from 'react';
import { listPlans, getPlan } from '../lib/api.js';

export default function HistoryDrawer({ onClose, onSelect }) {
  const [plans, setPlans] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    listPlans().then(setPlans).catch((e) => setError(e.message));
  }, []);

  async function open(id) {
    try {
      const p = await getPlan(id);
      onSelect(p);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50,
      }} />
      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(420px, 92vw)',
        background: 'var(--surface)', borderLeft: '1px solid var(--border)',
        padding: 24, overflowY: 'auto', zIndex: 51,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>My Plans</h2>
          <button onClick={onClose} style={{
            background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)',
            padding: '6px 12px', borderRadius: 8,
          }}>Close</button>
        </div>
        {error && <div style={{ color: '#ff8a8a', marginBottom: 12 }}>{error}</div>}
        {!plans && !error && <div style={{ color: 'var(--text-muted)' }}>Loading…</div>}
        {plans?.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No saved plans yet.</div>}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {plans?.map((p) => (
            <li key={p.id}>
              <button onClick={() => open(p.id)} style={{
                width: '100%', textAlign: 'left', padding: 14,
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 10, color: 'var(--text)',
              }}>
                <div style={{ fontWeight: 500 }}>{p.niche}</div>
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
