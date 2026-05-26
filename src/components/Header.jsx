export default function Header({ email, onSignOut, onOpenHistory, onHome }) {
  return (
    <header style={{
      padding: '18px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap',
      borderBottom: '1px solid var(--border-muted)',
      background: 'rgba(11, 22, 56, 0.7)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 20,
    }}>
      <button onClick={onHome} style={{
        background: 'transparent', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer',
      }}>
        <div className="eyebrow" style={{ color: 'var(--rose-gold)' }}>C3 GLOBAL</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 2 }}>
          <span className="wordmark" style={{ fontSize: 26 }}>Cadence</span>
          <span style={{ color: 'var(--text-faint)', fontSize: 12, fontStyle: 'italic' }}>your monthly content companion</span>
        </div>
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="btn btn-ghost" onClick={onOpenHistory}>My Plans</button>
        <span style={{ color: 'var(--text-muted)', fontSize: 13, padding: '0 6px' }}>{email}</span>
        <button className="btn btn-ghost" onClick={onSignOut}>Sign out</button>
      </div>
    </header>
  );
}
