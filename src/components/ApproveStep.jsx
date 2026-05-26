import { useState } from 'react';
import { PLATFORM_MAP } from '../lib/platforms.js';
import IdeaCard from './IdeaCard.jsx';

export default function ApproveStep({
  niche, ideas, approved, platforms, approvedCount,
  onToggle, onRegenerate, onApproveAll, onBack, onWrite, onWritePremium, busy,
}) {
  const [activeTab, setActiveTab] = useState(platforms[0]);
  const [regeneratingDay, setRegeneratingDay] = useState(null);
  const items = ideas[activeTab]?.items || [];
  const approvedSet = approved[activeTab] || new Set();

  async function handleRegen(platform, day) {
    setRegeneratingDay(day);
    try { await onRegenerate(platform, day); }
    finally { setRegeneratingDay(null); }
  }

  return (
    <section className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div className="eyebrow">STEP 02 · APPROVE</div>
        <h1 style={{ fontSize: 36, margin: '10px 0 6px', fontWeight: 500 }}>
          Pick the ones <em style={{ color: 'var(--rose-gold)', fontStyle: 'italic' }}>worth writing</em>.
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 600, margin: '0 auto', lineHeight: 1.5 }}>
          Tap to approve. Regenerate the ones that don't quite land. You only pay to write the ones you keep.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 6, overflowX: 'auto', padding: '4px 0',
        borderBottom: '1px solid var(--border-muted)', marginBottom: 20,
      }}>
        {platforms.map((pid) => {
          const p = PLATFORM_MAP[pid];
          const isActive = pid === activeTab;
          const count = approved[pid]?.size || 0;
          return (
            <button
              key={pid}
              onClick={() => setActiveTab(pid)}
              style={{
                padding: '10px 16px',
                background: isActive ? 'var(--surface)' : 'transparent',
                color: isActive ? 'var(--text)' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '10px 10px 0 0',
                fontSize: 14,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 8,
                position: 'relative',
              }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: 5,
                background: p.accent, color: '#0a0a0a',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700,
              }}>{p.icon}</span>
              {p.label}
              {count > 0 && (
                <span style={{
                  background: 'var(--mint)', color: '#0a2a1a',
                  borderRadius: 999, padding: '1px 8px', fontSize: 11, fontWeight: 600,
                }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          {approvedSet.size} of {items.length} approved on {PLATFORM_MAP[activeTab]?.label}
        </div>
        <button onClick={() => onApproveAll(activeTab)} className="btn btn-ghost" style={{ fontSize: 13, padding: '8px 14px' }}>
          Approve all 30
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 12,
      }}>
        {items.map((item) => (
          <IdeaCard
            key={item.day}
            item={item}
            approved={approvedSet.has(item.day)}
            regenerating={regeneratingDay === item.day}
            onToggle={() => onToggle(activeTab, item.day)}
            onRegenerate={() => handleRegen(activeTab, item.day)}
            accent={PLATFORM_MAP[activeTab]?.accent}
          />
        ))}
      </div>

      {/* Sticky action bar */}
      <div style={{
        position: 'sticky',
        bottom: 16,
        marginTop: 30,
        background: 'rgba(11,22,56,0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        gap: 12,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total approved</div>
          <div className="wordmark" style={{ fontSize: 26 }}>
            {approvedCount} <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>ready to write</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={onBack} className="btn btn-ghost" disabled={busy}>← Back</button>
          <button onClick={onWrite} className="btn btn-primary" disabled={busy || approvedCount === 0}>
            {busy ? 'Writing…' : `Write ${approvedCount} (Sonnet)`}
          </button>
          <button onClick={onWritePremium} className="btn btn-ghost" disabled={busy || approvedCount === 0} title="Higher quality, ~5x cost">
            Premium (Opus)
          </button>
        </div>
      </div>
    </section>
  );
}
