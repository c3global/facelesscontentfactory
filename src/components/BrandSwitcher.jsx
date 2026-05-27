// Brand switcher: chip in the sidebar showing the active brand's beat
// signature + name + sample/plan counts, opening a dropdown of all the
// user's brands plus links to the Brand Hub and a "+ New brand" action.

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBrands } from '../lib/brand-context.jsx';
import BeatSignature from './BeatSignature.jsx';

export default function BrandSwitcher() {
  const navigate = useNavigate();
  const { brands, activeBrand, setActiveBrandId, loading } = useBrands();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  if (loading) {
    return (
      <div style={chipStyle()}>
        <div style={{
          width: 56, height: 28, borderRadius: 6,
          background: 'var(--surface-alt)',
        }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ height: 14, width: 80, background: 'var(--surface-alt)', borderRadius: 3 }} />
          <div style={{ height: 10, width: 120, background: 'var(--surface-alt)', borderRadius: 3, marginTop: 6 }} />
        </div>
      </div>
    );
  }

  if (!activeBrand) {
    return (
      <button
        onClick={() => navigate('/brands')}
        style={{ ...chipStyle(), cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{
          width: 56, height: 28, borderRadius: 6,
          background: 'var(--surface-alt)',
          display: 'grid', placeItems: 'center',
          color: 'var(--text-faint)', fontSize: 20,
        }}>+</div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 15,
            color: 'var(--text)',
          }}>
            No brand yet
          </div>
          <div style={{
            marginTop: 3,
            fontFamily: 'var(--font-ui)', fontSize: 'var(--text-ec-sm)',
            fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: 'var(--text-faint)',
          }}>
            Create one →
          </div>
        </div>
      </button>
    );
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ ...chipStyle(), cursor: 'pointer', textAlign: 'left', width: '100%' }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <BeatSignature
          seed={activeBrand.name}
          accent={activeBrand.accent_color}
          size="sm"
          framed
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 15,
            color: 'var(--text)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {activeBrand.name}
          </div>
          <div style={{
            marginTop: 3,
            fontFamily: 'var(--font-ui)', fontSize: 'var(--text-ec-sm)',
            fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: 'var(--text-faint)',
          }}>
            {brands.length} BRAND{brands.length === 1 ? '' : 'S'}
          </div>
        </div>
        <Chevron open={open} />
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            left: 0, right: 0, top: 'calc(100% + 6px)',
            background: 'var(--surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            padding: 6,
            zIndex: 50,
          }}
        >
          {brands.map((b) => {
            const isActive = b.id === activeBrand.id;
            return (
              <button
                key={b.id}
                onClick={() => { setActiveBrandId(b.id); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid transparent',
                  background: isActive ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <BeatSignature seed={b.name} accent={b.accent_color} size="xs" framed />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14,
                    color: 'var(--text)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {b.name}
                  </div>
                </div>
                {isActive && (
                  <span style={{ color: 'var(--primary)', fontSize: 16, fontWeight: 700 }}>✓</span>
                )}
              </button>
            );
          })}
          <div style={{ height: 1, background: 'var(--border)', margin: '6px 4px' }} />
          <button
            onClick={() => { navigate('/brands'); setOpen(false); }}
            style={actionStyle()}
          >
            ▦ All brands
          </button>
          <button
            onClick={() => { navigate('/brands?new=1'); setOpen(false); }}
            style={actionStyle()}
          >
            + New brand
          </button>
        </div>
      )}
    </div>
  );
}

function chipStyle() {
  return {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px',
    background: 'var(--surface)',
    border: '1px solid var(--border-strong)',
    borderRadius: 'var(--radius-md)',
    width: '100%',
    minWidth: 0,
  };
}

function actionStyle() {
  return {
    display: 'flex', alignItems: 'center', gap: 8,
    width: '100%',
    padding: '8px 10px',
    borderRadius: 'var(--radius-sm)',
    background: 'transparent',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--text-ec-sm)',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'var(--primary)',
  };
}

function Chevron({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
      style={{
        flexShrink: 0,
        color: 'var(--text-faint)',
        transform: open ? 'rotate(180deg)' : 'none',
        transition: 'transform 120ms',
      }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
