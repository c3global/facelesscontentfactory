import CopyButton from './CopyButton.jsx';

const FIELD_ORDER = ['title', 'subject', 'hook', 'fullScript', 'fullPost', 'fullArticle', 'fullNewsletter', 'fullCaption', 'caption', 'hashtags'];

export default function PlatformPanel({ platform, data, status }) {
  if (!data && status === 'pending') {
    return <Empty>Waiting on {platform}…</Empty>;
  }
  if (!data || data.error || status === 'error') {
    return <Empty error>Failed to generate {platform}. {data?.error}</Empty>;
  }
  const items = data.items || [];
  if (items.length === 0) return <Empty>No items returned.</Empty>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {items.map((item, idx) => (
        <article key={idx} style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 18,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ color: 'var(--rose-gold)', fontWeight: 600, fontSize: 12, letterSpacing: 1 }}>
              DAY {item.day ?? idx + 1}
            </div>
            <CopyButton text={itemToPlainText(item)} />
          </div>
          {FIELD_ORDER.map((field) => {
            if (item[field] == null) return null;
            return <Field key={field} label={prettyLabel(field)} value={item[field]} />;
          })}
        </article>
      ))}
    </div>
  );
}

function Field({ label, value }) {
  const display = Array.isArray(value) ? value.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ') : value;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: 15 }}>{display}</div>
    </div>
  );
}

function Empty({ children, error }) {
  return (
    <div style={{
      padding: 24, border: '1px dashed var(--border)', borderRadius: 12,
      color: error ? '#ff8a8a' : 'var(--text-muted)', textAlign: 'center',
    }}>{children}</div>
  );
}

function prettyLabel(f) {
  return f.replace(/^full/, '').replace(/([A-Z])/g, ' $1').trim().toUpperCase();
}

function itemToPlainText(item) {
  return FIELD_ORDER
    .filter((f) => item[f] != null)
    .map((f) => {
      const v = Array.isArray(item[f]) ? item[f].map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ') : item[f];
      return v;
    })
    .join('\n\n');
}
