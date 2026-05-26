import { useState } from 'react';
import { PLATFORMS } from '../lib/platforms.js';
import PlatformPanel from './PlatformPanel.jsx';

export default function OutputTabs({ plan, status }) {
  const [active, setActive] = useState(PLATFORMS[0].id);
  const data = plan.platforms?.[active];

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto',
        borderBottom: '1px solid var(--border)', paddingBottom: 0, marginBottom: 16,
      }}>
        {PLATFORMS.map((p) => {
          const s = status?.[p.id] || 'pending';
          const isActive = p.id === active;
          return (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              style={{
                padding: '10px 14px',
                background: isActive ? 'var(--surface)' : 'transparent',
                color: isActive ? 'var(--text)' : 'var(--text-muted)',
                border: '1px solid var(--border)',
                borderBottom: isActive ? '1px solid var(--surface)' : '1px solid var(--border)',
                borderRadius: '8px 8px 0 0',
                fontSize: 13,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                position: 'relative',
                marginBottom: -1,
              }}
            >
              {p.label}
              <span style={{
                marginLeft: 8, fontSize: 10,
                color: s === 'done' ? p.accent : s === 'error' ? '#ff8a8a' : 'var(--text-muted)',
              }}>
                {s === 'done' ? '●' : s === 'error' ? '✕' : '…'}
              </span>
            </button>
          );
        })}
      </div>
      <PlatformPanel platform={active} data={data} status={status?.[active]} />
    </div>
  );
}
