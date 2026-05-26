import { useState, useEffect } from 'react';
import { PLATFORM_MAP } from '../lib/platforms.js';
import CopyButton from './CopyButton.jsx';

const FIELD_ORDER = ['title', 'subject', 'hook', 'fullScript', 'fullPost', 'fullArticle', 'fullNewsletter', 'fullCaption', 'caption', 'hashtags'];

export default function ContentStep({ niche, content, platforms, busy, totalExpected, onStartOver }) {
  const [activeTab, setActiveTab] = useState(platforms[0]);

  useEffect(() => {
    if (!platforms.includes(activeTab) && platforms.length) setActiveTab(platforms[0]);
  }, [platforms, activeTab]);

  const written = Object.values(content).reduce((sum, arr) => sum + (arr?.length || 0), 0);

  return (
    <section className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div className="eyebrow">STEP 03 · WRITE</div>
        <h1 style={{ fontSize: 36, margin: '10px 0 6px', fontWeight: 500 }}>
          Your <em style={{ color: 'var(--rose-gold)', fontStyle: 'italic' }}>month</em> of {niche}.
        </h1>
        {busy ? (
          <p style={{ color: 'var(--text-muted)' }}>
            Writing {written} of {totalExpected}…
            <span style={{
              display: 'inline-block', marginLeft: 10, width: 14, height: 14, borderRadius: '50%',
              border: '2px solid var(--border)', borderTopColor: 'var(--rose-gold)', verticalAlign: 'middle',
              animation: 'spin 1s linear infinite',
            }} />
          </p>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>
            {written} pieces ready. Tap Copy to grab any one.
          </p>
        )}
      </div>

      <div style={{
        display: 'flex', gap: 6, overflowX: 'auto', padding: '4px 0',
        borderBottom: '1px solid var(--border-muted)', marginBottom: 20,
      }}>
        {platforms.map((pid) => {
          const p = PLATFORM_MAP[pid];
          const isActive = pid === activeTab;
          const count = content[pid]?.length || 0;
          return (
            <button
              key={pid}
              onClick={() => setActiveTab(pid)}
              style={{
                padding: '10px 16px',
                background: isActive ? 'var(--surface)' : 'transparent',
                color: isActive ? 'var(--text)' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '10px 10px 0 0',
                fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: 5, background: p.accent, color: '#0a0a0a',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700,
              }}>{p.icon}</span>
              {p.label}
              <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>{count}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {(content[activeTab] || []).map((item, idx) => (
          <article key={idx} style={{
            background: 'var(--surface)', border: '1px solid var(--border-muted)',
            borderRadius: 16, padding: 22,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div className="eyebrow" style={{ color: PLATFORM_MAP[activeTab]?.accent }}>
                DAY {item.day ?? idx + 1}
              </div>
              {!item.error && <CopyButton text={itemToPlainText(item)} />}
            </div>
            {item.error ? (
              <div style={{ color: 'var(--danger)', fontSize: 14 }}>
                Failed: {item.error}{item.title && <> — "{item.title}"</>}
              </div>
            ) : (
              FIELD_ORDER.map((field) => item[field] != null
                ? <Field key={field} label={pretty(field)} value={item[field]} />
                : null
              )
            )}
          </article>
        ))}
        {busy && (!content[activeTab] || content[activeTab].length < totalExpected) && (
          <div style={{ color: 'var(--text-faint)', textAlign: 'center', padding: 24, fontSize: 14 }}>
            Writing more…
          </div>
        )}
      </div>

      {!busy && (
        <div style={{ textAlign: 'center', marginTop: 30 }}>
          <button onClick={onStartOver} className="btn btn-ghost">Start a new plan</button>
        </div>
      )}
    </section>
  );
}

function Field({ label, value }) {
  const display = Array.isArray(value)
    ? value.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')
    : value;
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="eyebrow" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65, fontSize: 15, color: 'var(--text)' }}>{display}</div>
    </div>
  );
}

function pretty(f) { return f.replace(/^full/, '').replace(/([A-Z])/g, ' $1').trim().toUpperCase(); }

function itemToPlainText(item) {
  return FIELD_ORDER
    .filter((f) => item[f] != null)
    .map((f) => Array.isArray(item[f])
      ? item[f].map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')
      : item[f]
    )
    .join('\n\n');
}
