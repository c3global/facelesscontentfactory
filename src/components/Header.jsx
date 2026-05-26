export default function Header({ email, onSignOut, onOpenHistory }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
    }}>
      <div>
        <div style={{ color: 'var(--rose-gold)', fontWeight: 600, letterSpacing: 1, fontSize: 12 }}>C3 GLOBAL</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Cadence</h1>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>by C3 Global</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onOpenHistory} style={btn('ghost')}>My Plans</button>
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{email}</span>
        <button onClick={onSignOut} style={btn('ghost')}>Sign out</button>
      </div>
    </header>
  );
}

function btn(variant) {
  const base = {
    padding: '8px 14px',
    borderRadius: 8,
    fontWeight: 500,
    fontSize: 13,
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text)',
  };
  return base;
}
