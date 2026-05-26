import { useEffect, useRef, useState } from 'react';
import {
  copyPlainText, copyMarkdown, copyHtml,
  downloadTxt, downloadMarkdown, downloadDocx, downloadPdf,
} from '../lib/export.js';

// Dropdown menu of export actions for a single piece.
// Receives `getPiece` — a thunk that returns the latest piece object, so we
// always export the most recent edits without prop-passing.

const GROUPS = [
  {
    label: 'Copy to clipboard',
    items: [
      { id: 'copy-plain',    label: 'Plain text',  run: (p) => copyPlainText(p) },
      { id: 'copy-md',       label: 'Markdown',    run: (p) => copyMarkdown(p) },
      { id: 'copy-html',     label: 'Rich (HTML)', run: (p) => copyHtml(p) },
    ],
  },
  {
    label: 'Download',
    items: [
      { id: 'dl-txt',  label: 'Plain text (.txt)', run: (p) => downloadTxt(p) },
      { id: 'dl-md',   label: 'Markdown (.md)',    run: (p) => downloadMarkdown(p) },
      { id: 'dl-docx', label: 'Word (.docx)',      run: (p) => downloadDocx(p) },
      { id: 'dl-pdf',  label: 'PDF (.pdf)',        run: (p) => downloadPdf(p) },
    ],
  },
];

export default function ExportMenu({ getPiece, align = 'right' }) {
  const [open, setOpen]   = useState(false);
  const [flash, setFlash] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  async function run(item) {
    try {
      await Promise.resolve(item.run(getPiece()));
      setFlash(`${item.label} ✓`);
      setTimeout(() => setFlash(null), 1400);
      setOpen(false);
    } catch (e) {
      setFlash(`Failed: ${e.message || e}`);
      setTimeout(() => setFlash(null), 2500);
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        Export
        <span style={{ fontSize: 10, opacity: 0.8 }}>▾</span>
      </button>

      {flash && !open && (
        <span style={{
          position: 'absolute',
          top: '110%',
          [align]: 0,
          marginTop: 6,
          padding: '6px 10px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text)',
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          whiteSpace: 'nowrap',
          boxShadow: 'var(--shadow-md)',
          zIndex: 10,
        }}>{flash}</span>
      )}

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            [align]: 0,
            minWidth: 220,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 20,
            padding: 6,
          }}
        >
          {GROUPS.map((group, gi) => (
            <div key={group.label}>
              {gi > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '6px 4px' }} />}
              <div className="label" style={{ padding: '6px 10px 4px', fontSize: 10 }}>{group.label}</div>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  role="menuitem"
                  onClick={() => run(item)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-alt)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
