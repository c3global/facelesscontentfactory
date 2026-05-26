export default function NicheInput({ value, onChange, onGenerate, disabled }) {
  return (
    <div style={{ marginTop: 24 }}>
      <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-muted)', fontSize: 13 }}>
        Your niche or topic
      </label>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. personal finance for nurses"
          disabled={disabled}
          style={{
            flex: '1 1 320px',
            padding: '14px 16px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            color: 'var(--text)',
            fontSize: 16,
          }}
          onKeyDown={(e) => e.key === 'Enter' && !disabled && onGenerate()}
        />
        <button
          onClick={onGenerate}
          disabled={disabled || !value.trim()}
          style={{
            padding: '14px 22px',
            borderRadius: 12,
            border: 'none',
            background: 'var(--cta-red)',
            color: 'white',
            fontWeight: 600,
            fontSize: 15,
            opacity: disabled || !value.trim() ? 0.6 : 1,
          }}
        >
          {disabled ? 'Generating…' : 'GENERATE MY CONTENT PLAN'}
        </button>
      </div>
    </div>
  );
}
