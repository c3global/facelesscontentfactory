import { PLATFORMS } from '../lib/platforms.js';

export default function PlanStep({ niche, onNicheChange, selected, onTogglePlatform, onGenerate, busy }) {
  const canGenerate = niche.trim().length > 2 && selected.length > 0 && !busy;

  return (
    <section className="fade-in" style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div className="eyebrow">STEP 01 · PLAN</div>
        <h1 style={{ fontSize: 44, margin: '12px 0 8px', fontWeight: 500 }}>
          Let's plan your <em style={{ color: 'var(--rose-gold)', fontStyle: 'italic' }}>month</em>.
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
          Tell Cadence your niche and which platforms you publish on. We'll sketch 30 days of ideas first — then write only the ones you keep.
        </p>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <label style={{ display: 'block', marginBottom: 10, fontSize: 12, color: 'var(--text-muted)', letterSpacing: 0.5 }}>
          YOUR NICHE OR TOPIC
        </label>
        <input
          value={niche}
          onChange={(e) => onNicheChange(e.target.value)}
          placeholder="e.g. personal finance for nurses"
          style={{
            width: '100%',
            padding: '14px 16px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            color: 'var(--text)',
            fontSize: 17,
            outline: 'none',
            marginBottom: 28,
          }}
          onKeyDown={(e) => e.key === 'Enter' && canGenerate && onGenerate()}
        />

        <div style={{ marginBottom: 10, fontSize: 12, color: 'var(--text-muted)', letterSpacing: 0.5, display: 'flex', justifyContent: 'space-between' }}>
          <span>PLATFORMS</span>
          <span style={{ color: 'var(--text-faint)' }}>{selected.length} selected</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 10,
          marginBottom: 28,
        }}>
          {PLATFORMS.map((p) => {
            const isSelected = selected.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => onTogglePlatform(p.id)}
                style={{
                  padding: '14px 12px',
                  borderRadius: 12,
                  border: `1px solid ${isSelected ? 'var(--rose-gold)' : 'var(--border)'}`,
                  background: isSelected ? 'rgba(201,149,108,0.10)' : 'var(--bg-elevated)',
                  color: 'var(--text)',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 14,
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'all 120ms ease',
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: isSelected ? p.accent : 'var(--border)',
                  color: isSelected ? '#0a0a0a' : 'var(--text-muted)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                }}>{p.icon}</span>
                {p.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={onGenerate}
          disabled={!canGenerate}
          className="btn btn-primary"
          style={{ width: '100%', padding: 16, fontSize: 15 }}
        >
          {busy ? 'Sketching ideas…' : `Generate ${selected.length || 0} platform${selected.length === 1 ? '' : 's'} of ideas →`}
        </button>
      </div>
    </section>
  );
}
