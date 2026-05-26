export default function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      marginTop: 16, padding: 16, borderRadius: 12,
      background: 'rgba(196, 26, 24, 0.12)', border: '1px solid var(--cta-red)',
      color: '#ffb3b3', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
    }}>
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} style={{
          padding: '8px 14px', borderRadius: 8, border: '1px solid var(--cta-red)',
          background: 'transparent', color: '#ffb3b3', fontWeight: 500,
        }}>Retry</button>
      )}
    </div>
  );
}
