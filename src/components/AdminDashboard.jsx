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
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [session]);

  if (!session) {
    return <div className="container">You must <a href="/">sign in</a> first.</div>;
  }
  if (error) {
    return <div className="container" style={{ color: '#ff8a8a' }}>
      {/permission|denied|not allowed/i.test(error) ? 'Admin access only.' : error}
    </div>;
  }
  if (!stats) return <div className="container">Loading stats…</div>;

  return (
    <div className="container">
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>Cadence — Admin</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, margin: '20px 0 30px' }}>
        <Stat label="Active members" value={stats.active_members} />
        <Stat label="Generations (7d)" value={stats.gens_7d} />
        <Stat label="Generations (30d)" value={stats.gens_30d} />
        <Stat label="Error rate (7d)" value={`${(stats.error_rate_7d * 100).toFixed(1)}%`} />
      </div>

      <Card title="Generations per day (last 30)">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stats.per_day || []}>
            <XAxis dataKey="day" stroke="#8B85B8" fontSize={11} />
            <YAxis stroke="#8B85B8" fontSize={11} />
            <Tooltip contentStyle={{ background: '#1C1533', border: '1px solid #3D3570' }} />
            <Bar dataKey="count" fill="#7F77DD" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Top niches (30 days)">
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {(stats.top_niches || []).map((n) => (
            <li key={n.niche} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
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
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, marginTop: 6 }}>{value ?? '–'}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
      <h2 style={{ fontSize: 14, margin: '0 0 14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{title}</h2>
      {children}
    </div>
  );
}
