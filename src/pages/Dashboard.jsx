import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { listPlans } from '../lib/api.js';
import PageHeader from '../components/PageHeader.jsx';

export default function Dashboard() {
  const { content, niche } = useOutletContext();
  const [plans, setPlans] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    listPlans().then(setPlans).catch((e) => setError(e.message));
  }, []);

  const hasDraft = Object.keys(content || {}).length > 0;
  const recent = plans?.slice(0, 3) || [];

  return (
    <div className="container">
      <PageHeader
        eyebrow="Dashboard"
        title="Welcome back."
        subtitle="The engine behind your faceless content. Pick up where you left off, or start a fresh month."
        actions={
          <Link to="/planner" className="btn btn-primary">
            {hasDraft ? 'Resume current plan' : 'Start a new plan'}
          </Link>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginTop: 28 }}>
        <StatCard
          label="Plans saved"
          value={plans == null ? '—' : plans.length}
        />
        <StatCard
          label="Current draft"
          value={hasDraft ? niche || 'Untitled' : 'None yet'}
          accent={hasDraft}
        />
        <StatCard
          label="Active platforms"
          value={Object.keys(content || {}).length || '—'}
          subtle={hasDraft ? 'In your current draft' : 'Start a plan to populate'}
        />
      </div>

      <section style={{ marginTop: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <h2 style={{ fontSize: 22 }}>Recent plans</h2>
          <Link to="/library" style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-ec-sm)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            See all →
          </Link>
        </div>

        {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}
        {plans == null && !error && <div style={{ color: 'var(--text-muted)' }}>Loading…</div>}
        {plans?.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <p>You haven't saved any plans yet.</p>
            <Link to="/planner" className="btn btn-primary" style={{ marginTop: 16 }}>Start your first month</Link>
          </div>
        )}

        {recent.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
            {recent.map((p) => (
              <li key={p.id}>
                <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{p.niche}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      {new Date(p.created_at).toLocaleString()}
                    </div>
                  </div>
                  <Link to={`/library?open=${p.id}`} className="btn btn-ghost">Open</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, subtle, accent }) {
  return (
    <div className="card">
      <div className="label" style={{ marginBottom: 8 }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 28,
        fontWeight: 500,
        lineHeight: 1.15,
        color: accent ? 'transparent' : 'var(--text)',
        background: accent ? 'var(--copper-gradient)' : 'none',
        WebkitBackgroundClip: accent ? 'text' : 'border-box',
        backgroundClip: accent ? 'text' : 'border-box',
        wordBreak: 'break-word',
      }}>
        {value}
      </div>
      {subtle && (
        <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-faint)' }}>{subtle}</div>
      )}
    </div>
  );
}
