import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { getBrandSettings, saveBrandSettings } from '../lib/api.js';

const VOICE_TAGS = [
  'authoritative', 'warm', 'witty', 'plainspoken', 'inspirational',
  'analytical', 'irreverent', 'reflective', 'punchy', 'editorial',
];

const EMPTY = {
  default_niche: '',
  voice_tags: [],
  voice_notes: '',
  signature_cta: '',
  banned_phrases: '',
};

export default function Brand() {
  const [settings, setSettings] = useState(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getBrandSettings()
      .then((data) => { setSettings({ ...EMPTY, ...(data || {}) }); setLoaded(true); })
      .catch(() => setLoaded(true)); // table may not exist yet; treat as empty
  }, []);

  function update(field, value) {
    setSettings((s) => ({ ...s, [field]: value }));
    setSaved(false);
  }

  function toggleTag(tag) {
    setSettings((s) => ({
      ...s,
      voice_tags: s.voice_tags.includes(tag)
        ? s.voice_tags.filter((t) => t !== tag)
        : [...s.voice_tags, tag],
    }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await saveBrandSettings(settings);
      setSaved(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container">
      <PageHeader
        eyebrow="Brand"
        title="Your voice, locked in."
        subtitle="These settings shape every plan and every piece Cadence writes for you. Save once, apply everywhere."
        actions={(
          <button onClick={handleSave} className="btn btn-primary" disabled={saving || !loaded}>
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
          </button>
        )}
      />

      {error && <div style={{ color: 'var(--danger)', marginTop: 16 }}>{error}</div>}

      <div style={{ marginTop: 32, display: 'grid', gap: 20, maxWidth: 720 }}>
        <Field label="Default niche" hint="Pre-fills the Planner so you don't have to retype it every month.">
          <input
            type="text"
            value={settings.default_niche}
            placeholder="e.g., AI for solo consultants"
            onChange={(e) => update('default_niche', e.target.value)}
          />
        </Field>

        <Field label="Voice tags" hint="Pick the descriptors that fit your brand. Cadence uses these to steer tone.">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {VOICE_TAGS.map((tag) => {
              const active = settings.voice_tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 'var(--radius-pill, 999px)',
                    border: '1px solid',
                    borderColor: active ? 'transparent' : 'var(--border-strong)',
                    background: active ? 'var(--copper-gradient)' : 'transparent',
                    color: active ? '#fff' : 'var(--text)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    cursor: 'pointer',
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Voice notes" hint="Anything specific you want every piece to sound like. Examples, do's & don'ts, references.">
          <textarea
            rows={5}
            value={settings.voice_notes}
            placeholder="e.g., Sound like Seth Godin meets Naval. Short sentences. No hype. Lead with the insight, not the hook."
            onChange={(e) => update('voice_notes', e.target.value)}
          />
        </Field>

        <Field label="Signature CTA" hint="A reusable closer Cadence will weave in where appropriate.">
          <input
            type="text"
            value={settings.signature_cta}
            placeholder="e.g., DM me 'AUDIT' for a free 15-min teardown."
            onChange={(e) => update('signature_cta', e.target.value)}
          />
        </Field>

        <Field label="Banned phrases" hint="Comma-separated. Cadence avoids these in every piece.">
          <input
            type="text"
            value={settings.banned_phrases}
            placeholder="e.g., game-changer, unlock, in today's digital landscape"
            onChange={(e) => update('banned_phrases', e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label style={{ display: 'block' }}>
      <div className="label" style={{ marginBottom: 6 }}>{label}</div>
      {hint && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>{hint}</div>}
      {children}
    </label>
  );
}
