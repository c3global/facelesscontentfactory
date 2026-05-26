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
          ? "This email isn't on our active member list. Join the Faceless Content Collective to get access."
          : error.message
      );
    } else {
      setStatus('sent');
    }
  }

  return (
    <div className="container" style={{ maxWidth: 480, paddingTop: 90 }}>
      <div className="eyebrow">C3 GLOBAL · FACELESS CONTENT COLLECTIVE</div>
      <h1 className="wordmark" style={{ fontSize: 56, margin: '14px 0 4px', fontWeight: 500 }}>
        Cadence
      </h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 0, fontSize: 16, lineHeight: 1.5 }}>
        Thirty days of ready-to-post content, planned and written with you in mind. Members only.
      </p>

      {status === 'sent' ? (
        <div className="card fade-in" style={{ marginTop: 30 }}>
          <div className="eyebrow" style={{ color: 'var(--mint)' }}>CHECK YOUR EMAIL</div>
          <p style={{ marginTop: 10, marginBottom: 0, color: 'var(--text)' }}>
            We sent a sign-in link to <b style={{ color: 'var(--rose-gold)' }}>{email}</b>. It expires in 1 hour.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="card" style={{ marginTop: 30 }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--text-muted)', letterSpacing: 0.5 }}>
            MEMBER EMAIL
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={input}
          />
          <button type="submit" disabled={status === 'sending'} className="btn btn-primary" style={{ width: '100%', padding: 14 }}>
            {status === 'sending' ? 'Sending…' : 'Send me a sign-in link'}
          </button>
          {error && <div style={{ color: 'var(--danger)', marginTop: 12, fontSize: 14, lineHeight: 1.5 }}>{error}</div>}
        </form>
      )}
    </div>
  );
}

const input = {
  width: '100%',
  padding: '13px 14px',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  color: 'var(--text)',
  fontSize: 15,
  marginBottom: 14,
  outline: 'none',
};
