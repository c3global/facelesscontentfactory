export default function IdeaCard({ item, approved, regenerating, onToggle, onRegenerate, accent }) {
  return (
    <article
      onClick={onToggle}
      style={{
        cursor: 'pointer',
        background: approved ? 'rgba(168,224,196,0.08)' : 'var(--surface)',
        border: `1px solid ${approved ? 'var(--mint)' : 'var(--border-muted)'}`,
        borderRadius: 14,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        position: 'relative',
        transition: 'all 120ms ease',
        opacity: regenerating ? 0.5 : 1,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: accent || 'var(--rose-gold)' }}>
          DAY {item.day}
        </span>
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          background: approved ? 'var(--mint)' : 'transparent',
          border: `1.5px solid ${approved ? 'var(--mint)' : 'var(--border)'}`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: '#0a2a1a', fontSize: 12, fontWeight: 700,
        }}>{approved ? '✓' : ''}</div>
      </div>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, lineHeight: 1.3, color: 'var(--text)', fontFamily: 'var(--font-body)' }}>
        {item.title}
      </h3>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
        {item.angle}
      </p>
      <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px dashed var(--border-muted)', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={(e) => { e.stopPropagation(); onRegenerate(); }}
          disabled={regenerating}
          style={{
            background: 'transparent', border: 'none', color: 'var(--text-faint)',
            cursor: 'pointer', fontSize: 12, padding: '4px 6px', borderRadius: 6,
          }}
          title="Regenerate this idea"
        >
          {regenerating ? '…' : '↻ regenerate'}
        </button>
      </div>
    </article>
  );
}
