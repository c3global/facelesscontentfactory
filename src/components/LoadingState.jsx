export default function LoadingState() {
  return (
    <div style={{
      marginTop: 32,
      padding: 32,
      border: '1px solid var(--border)',
      borderRadius: 12,
      background: 'var(--surface)',
      textAlign: 'center',
      color: 'var(--text-muted)',
    }}>
      <div className="spinner" style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid var(--border)', borderTopColor: 'var(--primary)',
        margin: '0 auto 16px', animation: 'spin 1s linear infinite',
      }} />
      Generating 30 days × 7 platforms of fully-written content. This usually takes 30–60 seconds.
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
