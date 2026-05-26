import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  useEffect(() => {
    if (!session) return;
    (async () => {
      try {
        const { data, error } = await supabase.rpc('admin_stats');
        if (error) throw error;
        setStats(data);
      } catch (e) { setError(e.message); }
    })();
  }, [session]);

  if (!session) {
    return <div className="container">You must <a href="/">sign in</a> first.</div>;
  }
  if (error) {
    return <div className="container" style={{ color: 'var(--danger)' }}>
      {/permission|denied|not allowed/i.test(error) ? 'Admin access only.' : error}
    </div>;
  }
  if (!stats) return <div className="container">Loading stats…</div>;

  return (
    <div className="container">
      <div className="eyebrow">C3 GLOBAL · CADENCE</div>
      <h1 className="wordmark" style={{ fontSize: 36, margin: '8px 0 30px' }}>Admin</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        <Stat label="Active members" value={stats.active_members} />
        <Stat label="Generations (7d)" value={stats.gens_7d} />
        <Stat label="Generations (30d)" value={stats.gens_30d} />
        <Stat label="Cost (7d)" value={`$${((stats.cost_7d_cents || 0) / 100).toFixed(2)}`} />
        <Stat label="Cost (30d)" value={`$${((stats.cost_30d_cents || 0) / 100).toFixed(2)}`} />
        <Stat label="Error rate (7d)" value={`${(stats.error_rate_7d * 100).toFixed(1)}%`} />
      </div>

      <Card title="Generations per day (last 30)">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stats.per_day || []}>
            <XAxis dataKey="day" stroke="#94A3C8" fontSize={11} />
            <YAxis stroke="#94A3C8" fontSize={11} />
            <Tooltip contentStyle={{ background: '#152759', border: '1px solid #26407A', borderRadius: 8 }} />
            <Bar dataKey="count" fill="#C9956C" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Top niches (30 days)">
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {(stats.top_niches || []).map((n) => (
            <li key={n.niche} style={{
              padding: '10px 0', borderBottom: '1px solid var(--border-muted)',
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span>{n.niche}</span>
              <span style={{ color: 'var(--text-muted)' }}>{n.count}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card">
      <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="wordmark" style={{ fontSize: 28, marginTop: 6, color: 'var(--text)' }}>{value ?? '–'}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="card" style={{ padding: 22, marginBottom: 20 }}>
      <div className="eyebrow" style={{ marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );
}
