// Reusable page header: eyebrow tag, big serif title, optional subtitle and
// trailing actions slot. Sits at the top of every main route.

export default function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <header style={{
      display: 'flex',
      gap: 24,
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      paddingBottom: 20,
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ minWidth: 0 }}>
        {eyebrow && (
          <div className="eyebrow" style={{ marginBottom: 8 }}>{eyebrow}</div>
        )}
        <h1 style={{ fontSize: 36, fontWeight: 500, lineHeight: 1.1 }}>{title}</h1>
        {subtitle && (
          <p style={{ marginTop: 10, color: 'var(--text-muted)', fontSize: 15, maxWidth: 620 }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{actions}</div>
      )}
    </header>
  );
}
