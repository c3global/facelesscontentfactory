export default function Stepper({ steps, active, onNavigate }) {
  const activeIdx = steps.findIndex((s) => s.id === active);
  return (
    <nav style={{ display: 'flex', justifyContent: 'center', margin: '30px 0 36px' }}>
      <ol style={{ display: 'flex', gap: 0, listStyle: 'none', padding: 0, margin: 0, alignItems: 'center' }}>
        {steps.map((s, i) => {
          const isActive = s.id === active;
          const isDone = i < activeIdx;
          return (
            <li key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => onNavigate(s.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 14px',
                  borderRadius: 999,
                  background: isActive ? 'rgba(201,149,108,0.12)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--rose-gold)' : 'transparent'}`,
                  color: isActive ? 'var(--rose-gold)' : isDone ? 'var(--mint)' : 'var(--text-muted)',
                  fontFamily: 'inherit',
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  background: isActive ? 'var(--rose-gold)' : isDone ? 'var(--mint)' : 'var(--border)',
                  color: isActive ? '#1a1208' : isDone ? '#0a2a1a' : 'var(--text-muted)',
                }}>
                  {isDone ? '✓' : i + 1}
                </span>
                <span>{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <span style={{
                  width: 36, height: 1, background: 'var(--border)', margin: '0 6px',
                }} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
