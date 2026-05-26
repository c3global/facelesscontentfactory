import { useState } from 'react';
import { supabase } from '../lib/supabase.js';
import Wordmark from './Wordmark.jsx';

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
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '40px 20px' }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
          <Wordmark size="lg" />
        </div>

        <p style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: 16,
          lineHeight: 1.5,
          maxWidth: 380,
          margin: '0 auto 32px',
        }}>
          The engine behind your faceless content. Members of the Faceless Content Collective only.
        </p>

        {status === 'sent' ? (
          <div className="card fade-in" style={{ textAlign: 'center' }}>
            <div className="eyebrow" style={{ color: 'var(--primary)' }}>CHECK YOUR EMAIL</div>
            <p style={{ marginTop: 12, color: 'var(--text)' }}>
              We sent a sign-in link to <b style={{ background: 'var(--copper-gradient)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{email}</b>.
              <br />It expires in 1 hour.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="card">
            <label className="label" style={{ display: 'block', marginBottom: 8 }}>
              Member email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ marginBottom: 14 }}
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="btn btn-primary"
              style={{ width: '100%', padding: 14 }}
            >
              {status === 'sending' ? 'Sending…' : 'Send me a sign-in link'}
            </button>
            {error && <div style={{ color: 'var(--danger)', marginTop: 12, fontSize: 14, lineHeight: 1.5 }}>{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
}
