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
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 18px',
                  borderRadius: 999,
                  background: isActive ? 'var(--surface)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--border-strong)' : 'transparent'}`,
                  color: isActive ? 'var(--text)' : isDone ? 'var(--primary)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: 'var(--text-ec-lg)',
                  letterSpacing: '0.03em',
                  cursor: 'pointer',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <span style={{
                  width: 30, height: 30, borderRadius: '50%',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700,
                  fontFamily: 'var(--font-ui)',
                  background: isActive ? 'var(--copper-gradient)' : isDone ? 'var(--primary)' : 'var(--surface-alt)',
                  color: isActive || isDone ? '#fff' : 'var(--text-muted)',
                  border: isActive || isDone ? 'none' : '1px solid var(--border)',
                }}>
                  {isDone ? '✓' : i + 1}
                </span>
                <span>{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <span style={{
                  width: 48, height: 1, background: 'var(--border-strong)', margin: '0 8px',
                }} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
