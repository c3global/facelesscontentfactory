import { useMemo, useState, useEffect, useCallback } from 'react';
import { PLATFORM_MAP } from '../lib/platforms.js';
import TipTapEditor from './TipTapEditor.jsx';
import ExportMenu from './ExportMenu.jsx';

// SequentialEditor — the v2 write/edit experience.
//
// Replaces the old ContentStep grid with a list-rail + focused-editor pane.
// Edits are kept in component state and pushed up via `onUpdatePiece` so the
// Planner can persist them when the user explicitly saves. No autosave to
// Supabase yet — that's a deliberate next-iteration decision.
//
// The "body" of each piece is whichever of these fields the platform produced:
//   fullScript | fullPost | fullArticle | fullNewsletter | fullCaption | caption
// On first edit we promote that text into `bodyHtml` (paragraph-wrapped) so
// TipTap has a clean HTML source. Subsequent saves write back to bodyHtml.

const BODY_FIELDS = ['bodyHtml', 'fullScript', 'fullPost', 'fullArticle', 'fullNewsletter', 'fullCaption', 'caption'];

export default function SequentialEditor({ niche, content, platforms, onUpdatePiece, onStartOver, initialKey }) {
  // Build a flat, stable list of all pieces across platforms.
  const items = useMemo(() => {
    const out = [];
    for (const pid of platforms) {
      for (const it of content[pid] || []) {
        if (it.error) continue;
        out.push({ platform: pid, key: `${pid}:${it.day}`, ...it });
      }
    }
    // Sort: by day, then by platform order in the `platforms` array
    out.sort((a, b) => (a.day - b.day) || (platforms.indexOf(a.platform) - platforms.indexOf(b.platform)));
    return out;
  }, [content, platforms]);

  const [selectedKey, setSelectedKey] = useState(
    () => (initialKey && items.find((i) => i.key === initialKey) ? initialKey : items[0]?.key)
  );

  // If the caller hands us a focus target (e.g., the Calendar clicked into a
  // specific piece), jump to it even if it changes after mount.
  useEffect(() => {
    if (initialKey && items.find((i) => i.key === initialKey)) {
      setSelectedKey(initialKey);
    }
  }, [initialKey, items]);

  // Keep selection valid as items change (e.g., during streaming generation)
  useEffect(() => {
    if (!items.find((i) => i.key === selectedKey)) {
      setSelectedKey(items[0]?.key);
    }
  }, [items, selectedKey]);

  const selectedIndex = items.findIndex((i) => i.key === selectedKey);
  const selected = items[selectedIndex];

  const goPrev = useCallback(() => {
    if (selectedIndex > 0) setSelectedKey(items[selectedIndex - 1].key);
  }, [selectedIndex, items]);
  const goNext = useCallback(() => {
    if (selectedIndex < items.length - 1) setSelectedKey(items[selectedIndex + 1].key);
  }, [selectedIndex, items]);

  // Keyboard navigation: ⌘/Ctrl + ↑/↓ moves between pieces.
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goPrev, goNext]);

  if (!items.length) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', marginTop: 24 }}>
        No content to edit yet.
        <div style={{ marginTop: 16 }}>
          <button className="btn btn-ghost" onClick={onStartOver}>Start over</button>
        </div>
      </div>
    );
  }

  return (
    <div className="seq-editor" style={{
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gap: 20,
      marginTop: 24,
    }}>
      <ListRail
        items={items}
        selectedKey={selectedKey}
        onSelect={setSelectedKey}
        niche={niche}
      />

      {selected && (
        <PiecePane
          key={selected.key}
          piece={selected}
          onUpdate={(patch) => onUpdatePiece(selected.platform, selected.day, patch)}
          onPrev={selectedIndex > 0 ? goPrev : null}
          onNext={selectedIndex < items.length - 1 ? goNext : null}
          position={{ current: selectedIndex + 1, total: items.length }}
        />
      )}

      <style>{`
        @media (max-width: 900px) {
          .seq-editor { grid-template-columns: 1fr; }
          .seq-editor .list-rail { max-height: 280px; }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// List rail
// ---------------------------------------------------------------------------

function ListRail({ items, selectedKey, onSelect, niche }) {
  return (
    <aside className="list-rail card" style={{
      padding: 0,
      maxHeight: 'calc(100vh - 220px)',
      overflowY: 'auto',
      position: 'sticky',
      top: 16,
      alignSelf: 'flex-start',
    }}>
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1,
      }}>
        <div className="label" style={{ fontSize: 10 }}>Pieces</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginTop: 2, fontWeight: 500, lineHeight: 1.2 }}>
          {niche}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          {items.length} pieces
        </div>
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 6 }}>
        {items.map((it) => {
          const p = PLATFORM_MAP[it.platform] || { label: it.platform, accent: 'var(--slate)', icon: '·' };
          const active = it.key === selectedKey;
          return (
            <li key={it.key}>
              <button
                onClick={() => onSelect(it.key)}
                style={{
                  width: '100%',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: active ? 'var(--surface-alt)' : 'transparent',
                  border: '1px solid',
                  borderColor: active ? 'var(--border-strong)' : 'transparent',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  marginBottom: 2,
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: p.accent, color: '#fff',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                  fontFamily: 'var(--font-ui)',
                }}>{p.icon}</span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{
                    display: 'block',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-faint)',
                    fontWeight: 600,
                  }}>
                    Day {it.day} · {p.label}
                  </span>
                  <span style={{
                    display: '-webkit-box',
                    marginTop: 2,
                    fontSize: 13.5,
                    lineHeight: 1.35,
                    color: 'var(--text)',
                    overflow: 'hidden',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {it.title || it.subject || it.hook || 'Untitled'}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Piece pane
// ---------------------------------------------------------------------------

function PiecePane({ piece, onUpdate, onPrev, onNext, position }) {
  const platform = PLATFORM_MAP[piece.platform] || { label: piece.platform };
  const initialBody = useMemo(() => extractBodyHtml(piece), [piece.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const [title, setTitle]       = useState(piece.title || '');
  const [subject, setSubject]   = useState(piece.subject || '');
  const [hook, setHook]         = useState(piece.hook || '');
  const [bodyHtml, setBodyHtml] = useState(initialBody);
  const [hashtags, setHashtags] = useState((piece.hashtags || []).join(' '));
  const [dirty, setDirty]       = useState(false);

  // Push updates upward (debounced)
  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => {
      onUpdate({
        title:    title || undefined,
        subject:  subject || undefined,
        hook:     hook || undefined,
        bodyHtml,
        hashtags: parseHashtags(hashtags),
      });
      setDirty(false);
    }, 400);
    return () => clearTimeout(t);
  }, [title, subject, hook, bodyHtml, hashtags, dirty]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasSubject = piece.subject != null;
  const hasHook    = piece.hook != null || piece.platform === 'youtube' || piece.platform === 'shorts';
  const hasTags    = piece.hashtags != null || ['shorts', 'social', 'text'].includes(piece.platform);

  return (
    <section style={{ minWidth: 0 }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
        marginBottom: 18,
      }}>
        <div>
          <div className="label" style={{ marginBottom: 4 }}>
            Day {piece.day} · {platform.label}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-faint)', fontFamily: 'var(--font-ui)' }}>
            Piece {position.current} of {position.total} · {dirty ? 'editing…' : 'saved'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-ghost" onClick={onPrev} disabled={!onPrev} title="⌘↑">← Prev</button>
          <button className="btn btn-ghost" onClick={onNext} disabled={!onNext} title="⌘↓">Next →</button>
          <ExportMenu getPiece={() => ({
            platform: piece.platform,
            day: piece.day,
            title,
            subject,
            hook,
            bodyHtml,
            hashtags: parseHashtags(hashtags),
          })} />
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Title">
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
            placeholder="Title"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 26,
              fontWeight: 500,
              letterSpacing: '-0.015em',
              padding: '14px 16px',
            }}
          />
        </Field>

        {hasSubject && (
          <Field label="Subject line">
            <input
              type="text"
              value={subject}
              onChange={(e) => { setSubject(e.target.value); setDirty(true); }}
              placeholder="Subject line"
            />
          </Field>
        )}

        {hasHook && (
          <Field label="Hook">
            <input
              type="text"
              value={hook}
              onChange={(e) => { setHook(e.target.value); setDirty(true); }}
              placeholder="Opening hook"
              style={{ fontStyle: 'italic' }}
            />
          </Field>
        )}

        <Field label="Body">
          <TipTapEditor
            editorKey={piece.key}
            value={bodyHtml}
            onChange={(html) => { setBodyHtml(html); setDirty(true); }}
            placeholder="Start writing…"
          />
        </Field>

        {hasTags && (
          <Field label="Hashtags" hint="Space- or comma-separated. The # is added automatically.">
            <input
              type="text"
              value={hashtags}
              onChange={(e) => { setHashtags(e.target.value); setDirty(true); }}
              placeholder="contentmarketing solopreneur ai"
            />
          </Field>
        )}
      </div>
    </section>
  );
}

function Field({ label, hint, children }) {
  return (
    <label style={{ display: 'block' }}>
      <div className="label" style={{ marginBottom: 6 }}>{label}</div>
      {hint && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{hint}</div>}
      {children}
    </label>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractBodyHtml(piece) {
  // If we've already promoted body to HTML, use it.
  if (piece.bodyHtml && piece.bodyHtml.length) return piece.bodyHtml;
  // Otherwise, find the first plain-text body field and convert it.
  for (const field of BODY_FIELDS) {
    if (field === 'bodyHtml') continue;
    const value = piece[field];
    if (typeof value === 'string' && value.trim()) {
      return textToHtml(value);
    }
  }
  return '';
}

function textToHtml(text) {
  return text
    .split(/\n\s*\n/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => `<p>${escapeHtml(para).replace(/\n/g, '<br />')}</p>`)
    .join('');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function parseHashtags(input) {
  if (!input) return [];
  return input
    .split(/[\s,]+/)
    .map((t) => t.trim().replace(/^#+/, ''))
    .filter(Boolean);
}
