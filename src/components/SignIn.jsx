import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: false, emailRedirectTo: window.location.origin },
    });
    if (error) {
      setStatus('idle');
      setError(
        /not allowed|signups not allowed|user not found/i.test(error.message)
          ? "This email isn't on our active member list — join the Faceless Content Collective to get in."
          : error.message
      );
    } else {
      setStatus('sent');
    }
  }

  return (
    <div className="container" style={{ maxWidth: 460, paddingTop: 80 }}>
      <div style={{ color: 'var(--rose-gold)', fontWeight: 600, letterSpacing: 1, fontSize: 12 }}>C3 GLOBAL</div>
      <h1 style={{ fontSize: 32, margin: '8px 0 4px', fontWeight: 600 }}>Cadence</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 0 }}>
        30 days of ready-to-post content, in one click. Members only.
      </p>

      {status === 'sent' ? (
        <div style={card}>
          <strong>Check your email.</strong>
          <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>
            We sent a sign-in link to <b>{email}</b>. It expires in 1 hour.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} style={card}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--text-muted)' }}>
            Member email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={input}
          />
          <button type="submit" disabled={status === 'sending'} style={primaryBtn}>
            {status === 'sending' ? 'Sending…' : 'Send me a sign-in link'}
          </button>
          {error && <div style={{ color: '#ff8a8a', marginTop: 10, fontSize: 14 }}>{error}</div>}
        </form>
      )}
    </div>
  );
}

const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 24,
  marginTop: 24,
};
const input = {
  width: '100%',
  padding: '12px 14px',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--text)',
  fontSize: 15,
  marginBottom: 14,
};
const primaryBtn = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 8,
  border: 'none',
  background: 'var(--cta-red)',
  color: 'white',
  fontWeight: 600,
  fontSize: 15,
};
