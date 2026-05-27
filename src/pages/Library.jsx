import { useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { listPlans } from '../lib/api.js';
import PageHeader from '../components/PageHeader.jsx';
import ActiveBrandBanner from '../components/ActiveBrandBanner.jsx';
import { useBrands } from '../lib/brand-context.jsx';

export default function Library() {
  const { loadSavedPlan } = useOutletContext();
  const { activeBrandId, activeBrand } = useBrands();
  const [plans, setPlans] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [opening, setOpening] = useState(null);
  const [params, setParams] = useSearchParams();
  const openId = params.get('open');

  useEffect(() => {
    if (!activeBrandId) {
      setPlans([]);
      return;
    }
    setPlans(null);
    listPlans(activeBrandId).then(setPlans).catch((e) => setError(e.message));
  }, [activeBrandId]);

  useEffect(() => {
    if (openId) {
      handleOpen(openId);
      setParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  async function handleOpen(id) {
    setOpening(id);
    try {
      await loadSavedPlan(id);
    } catch (e) {
      setError(e.message);
    } finally {
      setOpening(null);
    }
  }

  const filtered = plans?.filter((p) =>
    !search.trim() ? true : p.niche.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <PageHeader
        eyebrow="Library"
        title="Your saved plans."
        subtitle="Every month you've generated, ready to revisit, edit, and re-export."
      />

      {activeBrand && <ActiveBrandBanner />}

      <div style={{ marginTop: 24, marginBottom: 20 }}>
        <input
          type="search"
          placeholder="Search by niche…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: 16 }}>{error}</div>}
      {plans == null && !error && <div style={{ color: 'var(--text-muted)' }}>Loading…</div>}

      {plans?.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          No saved plans yet. Head to the Planner to generate your first month.
        </div>
      )}

      {filtered && filtered.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtered.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => handleOpen(p.id)}
                disabled={opening === p.id}
                className="card"
                style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 6,
                  transition: 'border-color 120ms ease, transform 120ms ease',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 16 }}>{p.niche}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {new Date(p.created_at).toLocaleDateString()} · {new Date(p.created_at).toLocaleTimeString()}
                </div>
                <div style={{ marginTop: 'auto', paddingTop: 12, color: 'var(--accent)', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-ec-sm)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {opening === p.id ? 'Opening…' : 'Open →'}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
