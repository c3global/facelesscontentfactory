export default function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      margin: '0 0 20px', padding: 14, borderRadius: 12,
      background: 'rgba(255,107,107,0.10)', border: '1px solid var(--danger)',
      color: '#ffd0d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
    }}>
      <span style={{ fontSize: 14 }}>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-ghost" style={{ fontSize: 13, padding: '6px 12px' }}>
          Dismiss
        </button>
      )}
    </div>
  );
}
