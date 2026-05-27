// Brand Hub — one page that lists every brand the user owns. Each card
// shows the brand's beat signature, name, sample/plan counts, and an
// "open" action that switches the active brand and navigates to the Brand
// page. A "+ New brand" CTA opens an inline form (also auto-opened by the
// ?new=1 query param coming from the sidebar dropdown).

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useBrands } from '../lib/brand-context.jsx';
import BeatSignature from '../components/BeatSignature.jsx';
import PageHeader from '../components/PageHeader.jsx';

const ACCENT_OPTIONS = [
  { label: 'Copper', value: '#A6604C' },
  { label: 'Rose Gold', value: '#D9C0A6' },
  { label: 'Aquamarine', value: '#3FCFB6' },
  { label: 'Magenta', value: '#E1306C' },
  { label: 'Slate Blue', value: '#5FB0E8' },
  { label: 'Amber', value: '#F59E0B' },
  { label: 'Violet', value: '#9C27B0' },
];

export default function BrandHub() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const {
    brands, activeBrandId, setActiveBrandId,
    createBrand, updateBrand, deleteBrand,
    loading, error,
  } = useBrands();

  const [creating, setCreating] = useState(params.get('new') === '1');
  const [counts, setCounts] = useState({}); // { brandId: { samples, plans } }
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (params.get('new') === '1' && !creating) setCreating(true);
  }, [params, creating]);

  // Load counts in parallel for the brands list
  useEffect(() => {
    let cancelled = false;
    async function loadCounts() {
      if (brands.length === 0) { setCounts({}); return; }
      try {
        const [{ data: samples }, { data: plans }] = await Promise.all([
          supabase.from('brand_samples').select('brand_id').eq('archived', false),
          supabase.from('plans').select('brand_id'),
        ]);
        if (cancelled) return;
        const c = {};
        for (const b of brands) c[b.id] = { samples: 0, plans: 0 };
        for (const s of samples || []) {
          if (c[s.brand_id]) c[s.brand_id].samples++;
        }
        for (const p of plans || []) {
          if (c[p.brand_id]) c[p.brand_id].plans++;
        }
        setCounts(c);
      } catch {/* counts are decorative */}
    }
    loadCounts();
    return () => { cancelled = true; };
  }, [brands]);

  const openBrand = (id) => {
    setActiveBrandId(id);
    navigate('/brand');
  };

  const handleCreate = async ({ name, accent_color }) => {
    setBusy(true);
    try {
      await createBrand({ name, accent_color });
      setCreating(false);
      const next = new URLSearchParams(params);
      next.delete('new');
      setParams(next, { replace: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 1200 }}>
      <PageHeader
        eyebrow="Brand Hub"
        title="All your brands."
        subtitle="Each brand carries its own voice, samples, and plans. Switch the active brand to scope the rest of the app to it."
        actions={(
          <button
            className="btn btn-primary"
            onClick={() => setCreating(true)}
            disabled={creating}
          >
            + New brand
          </button>
        )}
      />

      {error === 'migration-needed' ? (
        <div className="card" style={{
          marginTop: 24,
          padding: 24,
          borderLeft: '3px solid var(--accent)',
        }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Database migration needed</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.55 }}>
            Multi-brand support requires running <code style={{ background: 'var(--surface-alt)', padding: '2px 6px', borderRadius: 4 }}>supabase/migrations/0005_brands.sql</code> against your Supabase database. Open the Supabase SQL editor, paste the file's contents, and run it — then refresh this page.
          </p>
          <p style={{ color: 'var(--text-faint)', fontSize: 13, margin: 0 }}>
            The migration is rerun-safe and backfills your existing data into a default brand named after your <i>default niche</i>.
          </p>
        </div>
      ) : error ? (
        <div style={{ color: 'var(--danger)', marginTop: 16 }}>{error}</div>
      ) : null}

      {creating && (
        <NewBrandForm
          onCancel={() => setCreating(false)}
          onCreate={handleCreate}
          busy={busy}
        />
      )}

      {loading && brands.length === 0 ? (
        <div className="card" style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading brands…
        </div>
      ) : brands.length === 0 && !creating ? (
        <div className="card" style={{ marginTop: 24, textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          You don't have any brands yet. <button className="btn btn-ghost" style={{ marginLeft: 12 }} onClick={() => setCreating(true)}>+ Create your first brand</button>
        </div>
      ) : (
        <div style={{
          marginTop: 28,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
        }}>
          {brands.map((b) => (
            <BrandCard
              key={b.id}
              brand={b}
              counts={counts[b.id] || { samples: 0, plans: 0 }}
              active={b.id === activeBrandId}
              onOpen={() => openBrand(b.id)}
              onActivate={() => setActiveBrandId(b.id)}
              onRename={(name) => updateBrand(b.id, { name })}
              onRecolor={(accent_color) => updateBrand(b.id, { accent_color })}
              onDelete={() => deleteBrand(b.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BrandCard({ brand, counts, active, onOpen, onActivate, onRename, onRecolor, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(brand.name);
  const [showColors, setShowColors] = useState(false);

  return (
    <div
      className="card"
      style={{
        position: 'relative',
        borderColor: active ? 'var(--primary)' : 'var(--border)',
        boxShadow: active ? '0 0 0 1px var(--primary), var(--shadow-sm)' : 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <BeatSignature seed={brand.name} accent={brand.accent_color} size="lg" framed />
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-ghost"
            onClick={() => setShowColors((v) => !v)}
            title="Change accent color"
            style={{ padding: '6px 10px' }}
            aria-label="Change accent color"
          >
            <span style={{
              width: 16, height: 16, borderRadius: 4,
              background: brand.accent_color, display: 'inline-block',
              border: '1px solid var(--border-strong)',
            }} />
          </button>
          {showColors && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 6px)',
              background: 'var(--surface)', border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)', padding: 8,
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6,
              boxShadow: 'var(--shadow-md)', zIndex: 5,
            }}>
              {ACCENT_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => { onRecolor(c.value); setShowColors(false); }}
                  title={c.label}
                  style={{
                    width: 24, height: 24, borderRadius: 6,
                    background: c.value,
                    border: brand.accent_color === c.value ? '2px solid var(--text)' : '1px solid var(--border-strong)',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = name.trim();
              if (trimmed && trimmed !== brand.name) onRename(trimmed);
              setEditing(false);
            }}
            style={{ display: 'flex', gap: 6 }}
          >
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => { setEditing(false); setName(brand.name); }}
            />
          </form>
        ) : (
          <button
            onClick={() => setEditing(true)}
            style={{
              background: 'transparent', border: 'none', padding: 0,
              fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 22,
              color: 'var(--text)', cursor: 'text', textAlign: 'left',
            }}
            title="Click to rename"
          >
            {brand.name}
          </button>
        )}
      </div>

      <div style={{
        marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)',
        display: 'flex', gap: 18, alignItems: 'baseline',
      }}>
        <Stat n={counts.samples} label="Samples" />
        <Stat n={counts.plans}   label="Plans"   />
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={onOpen}>Open brand →</button>
        {!active && (
          <button className="btn btn-ghost" onClick={onActivate}>Set active</button>
        )}
        <div style={{ flex: 1 }} />
        <button
          className="btn btn-danger"
          onClick={() => {
            if (confirm(`Delete "${brand.name}"?\n\nThis permanently removes the brand and all its samples and plans.`)) {
              onDelete();
            }
          }}
          title="Delete brand"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function Stat({ n, label }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22 }}>{n}</div>
      <div className="label" style={{ marginTop: 2 }}>{label}</div>
    </div>
  );
}

function NewBrandForm({ onCancel, onCreate, busy }) {
  const [name, setName] = useState('');
  const [accent, setAccent] = useState(ACCENT_OPTIONS[0].value);

  const previewSeed = useMemo(() => name.trim() || 'New brand', [name]);

  return (
    <div className="card" style={{ marginTop: 24, padding: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 24, alignItems: 'center' }}>
        <BeatSignature seed={previewSeed} accent={accent} size="lg" framed />
        <div>
          <h2 style={{ fontSize: 22, marginBottom: 14 }}>Create a new brand</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = name.trim();
              if (!trimmed) return;
              onCreate({ name: trimmed, accent_color: accent });
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="label">Brand name</span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mamas & Mentors"
                disabled={busy}
              />
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="label">Accent color</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ACCENT_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setAccent(c.value)}
                    title={c.label}
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: c.value,
                      border: accent === c.value ? '2px solid var(--text)' : '1px solid var(--border-strong)',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!name.trim() || busy}
              >
                {busy ? 'Creating…' : 'Create brand'}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onCancel}
                disabled={busy}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
