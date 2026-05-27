import { useEffect, useMemo, useRef, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import {
  getBrandSettings, saveBrandSettings,
  listSamples, addSample, updateSample, deleteSample,
  fetchUrlAsText,
} from '../lib/api.js';
import { parseFile } from '../lib/sample-parsers.js';

const VOICE_TAGS = [
  'authoritative', 'warm', 'witty', 'plainspoken', 'inspirational',
  'analytical', 'irreverent', 'reflective', 'punchy', 'editorial',
];

const EMPTY_SETTINGS = {
  default_niche: '',
  voice_tags: [],
  voice_notes: '',
  signature_cta: '',
  banned_phrases: '',
};

// Training-progress weights. Samples carry the most weight because they're
// the single biggest signal we feed the model.
const WEIGHTS = {
  default_niche:  10,
  voice_tags:     10,
  voice_notes:    15,
  signature_cta: 10,
  banned_phrases: 5,
  sample_first:  15,  // first sample is a big jump
  sample_three:  20,  // three samples = trainer is real
  sample_five:   25,  // five+ samples = trained voice
};

export default function Brand() {
  // ---- Voice settings ----
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState(null);

  // ---- Samples ----
  const [samples, setSamples] = useState([]);
  const [samplesLoaded, setSamplesLoaded] = useState(false);

  useEffect(() => {
    getBrandSettings()
      .then((data) => { setSettings({ ...EMPTY_SETTINGS, ...(data || {}) }); setLoaded(true); })
      .catch(() => setLoaded(true));
    listSamples()
      .then((data) => { setSamples(data); setSamplesLoaded(true); })
      .catch(() => setSamplesLoaded(true));
  }, []);

  function updateSetting(field, value) {
    setSettings((s) => ({ ...s, [field]: value }));
    setSavedFlash(false);
  }

  function toggleTag(tag) {
    setSettings((s) => ({
      ...s,
      voice_tags: s.voice_tags.includes(tag)
        ? s.voice_tags.filter((t) => t !== tag)
        : [...s.voice_tags, tag],
    }));
    setSavedFlash(false);
  }

  async function handleSaveSettings() {
    setSaving(true);
    setError(null);
    try {
      await saveBrandSettings(settings);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  // ---- Training progress ----
  const trainingPct = useMemo(() => {
    let pct = 0;
    if (settings.default_niche?.trim()) pct += WEIGHTS.default_niche;
    if (settings.voice_tags?.length)    pct += WEIGHTS.voice_tags;
    if (settings.voice_notes?.trim())   pct += WEIGHTS.voice_notes;
    if (settings.signature_cta?.trim()) pct += WEIGHTS.signature_cta;
    if (settings.banned_phrases?.trim()) pct += WEIGHTS.banned_phrases;
    const n = samples.length;
    if (n >= 1) pct += WEIGHTS.sample_first;
    if (n >= 3) pct += WEIGHTS.sample_three;
    if (n >= 5) pct += WEIGHTS.sample_five;
    return Math.min(100, pct);
  }, [settings, samples]);

  return (
    <div className="container" style={{ maxWidth: 880 }}>
      <PageHeader
        eyebrow="Brand"
        title="Your voice, locked in."
        subtitle="Voice settings + past content together steer every piece Cadence writes. The more you feed it, the more it sounds like you."
        actions={(
          <button onClick={handleSaveSettings} className="btn btn-primary" disabled={saving || !loaded}>
            {saving ? 'Saving…' : savedFlash ? 'Saved ✓' : 'Save changes'}
          </button>
        )}
      />

      {error && <div style={{ color: 'var(--danger)', marginTop: 16 }}>{error}</div>}

      {/* ----- Training progress ----- */}
      <TrainingMeter pct={trainingPct} samplesCount={samples.length} />

      {/* ----- Content samples ----- */}
      <section style={{ marginTop: 36 }}>
        <SectionHeader
          eyebrow="Content samples"
          title="Train Cadence on your real voice"
          subtitle="Paste or upload pieces you've actually published — newsletters, posts, scripts, articles. Cadence learns your sentence rhythm and structure from these, never copies them. 3–5 strong samples usually nail it."
        />
        <SampleAdder onAdded={(s) => setSamples((cur) => [s, ...cur])} setError={setError} />
        <SampleList
          samples={samples}
          loaded={samplesLoaded}
          onUpdate={(id, patch) => {
            setSamples((cur) => cur.map((s) => (s.id === id ? { ...s, ...patch } : s)));
            updateSample(id, patch).catch((e) => setError(e.message));
          }}
          onDelete={(id) => {
            setSamples((cur) => cur.filter((s) => s.id !== id));
            deleteSample(id).catch((e) => setError(e.message));
          }}
        />
      </section>

      {/* ----- Voice settings ----- */}
      <section style={{ marginTop: 48 }}>
        <SectionHeader
          eyebrow="Voice & guardrails"
          title="The dials and rails"
          subtitle="Quick-set descriptors and rules. Cadence reads these alongside your samples."
        />

        <div style={{ display: 'grid', gap: 20 }}>
          <Field label="Default niche" hint="Pre-fills the Planner so you don't have to retype it every month.">
            <input
              type="text"
              value={settings.default_niche}
              placeholder="e.g., AI for solo consultants"
              onChange={(e) => updateSetting('default_niche', e.target.value)}
            />
          </Field>

          <Field label="Voice tags" hint="Pick the descriptors that fit your brand.">
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
                      borderRadius: 999,
                      border: '1px solid',
                      borderColor: active ? 'transparent' : 'var(--border-strong)',
                      background: active ? 'var(--copper-gradient)' : 'transparent',
                      color: active ? '#fff' : 'var(--text)',
                      fontFamily: 'var(--font-ui)',
                      fontSize: 'var(--text-ec-sm)',
                      fontWeight: 700,
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

          <Field label="Voice notes" hint="Anything specific you want every piece to sound like. Examples, do's & don'ts.">
            <textarea
              rows={5}
              value={settings.voice_notes}
              placeholder="e.g., Sound like Seth Godin meets Naval. Short sentences. No hype."
              onChange={(e) => updateSetting('voice_notes', e.target.value)}
            />
          </Field>

          <Field label="Signature CTA" hint="A reusable closer Cadence will weave in where appropriate.">
            <input
              type="text"
              value={settings.signature_cta}
              placeholder="e.g., DM me 'AUDIT' for a free 15-min teardown."
              onChange={(e) => updateSetting('signature_cta', e.target.value)}
            />
          </Field>

          <Field label="Banned phrases" hint="Comma-separated. Cadence avoids these in every piece.">
            <input
              type="text"
              value={settings.banned_phrases}
              placeholder="e.g., game-changer, unlock, in today's digital landscape"
              onChange={(e) => updateSetting('banned_phrases', e.target.value)}
            />
          </Field>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Training progress meter
// ---------------------------------------------------------------------------

function TrainingMeter({ pct, samplesCount }) {
  const status = pct >= 80 ? 'Trained' : pct >= 50 ? 'Learning' : pct >= 20 ? 'Just started' : 'Untrained';
  return (
    <div className="card" style={{ marginTop: 24, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div className="label" style={{ fontSize: 11 }}>Brand training</div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            fontWeight: 500,
            background: 'var(--copper-gradient)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            marginTop: 2,
          }}>{pct}% <span style={{ color: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--font-body)' }}>· {status}</span></div>
        </div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-ec-md)', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-faint)' }}>
          {samplesCount} SAMPLE{samplesCount === 1 ? '' : 'S'} LOADED
        </div>
      </div>
      <div style={{
        height: 8,
        background: 'var(--surface-alt)',
        borderRadius: 999,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'var(--copper-gradient)',
          transition: 'width 300ms ease',
        }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sample adder (paste + file upload)
// ---------------------------------------------------------------------------

function SampleAdder({ onAdded, setError }) {
  const [open, setOpen]       = useState(false);
  const [label, setLabel]     = useState('');
  const [content, setContent] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [showUrl, setShowUrl] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubmitting(true);
    setError(null);
    try {
      const { text, source_type } = await parseFile(file);
      const proposedLabel = label || file.name.replace(/\.[^.]+$/, '');
      const saved = await addSample({ label: proposedLabel, content: text, source_type });
      onAdded(saved);
      setLabel(''); setContent('');
      setOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
      e.target.value = '';
    }
  }

  async function handlePasteAdd() {
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const saved = await addSample({ label, content, source_type: 'paste' });
      onAdded(saved);
      setLabel(''); setContent('');
      setOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUrlImport() {
    const url = urlInput.trim();
    if (!url) return;
    setSubmitting(true);
    setError(null);
    try {
      const { text, title } = await fetchUrlAsText(url);
      const saved = await addSample({
        label: label || title || 'Imported from URL',
        content: text,
        source_type: 'url',
      });
      onAdded(saved);
      setLabel(''); setUrlInput('');
      setShowUrl(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open && !showUrl) {
    return (
      <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>+ Paste a sample</button>
        <button
          className="btn btn-ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={submitting}
        >
          {submitting ? 'Reading file…' : 'Upload .txt · .md · .docx · .pdf'}
        </button>
        <button className="btn btn-ghost" onClick={() => setShowUrl(true)} disabled={submitting}>
          Import from URL
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.markdown,.docx,.pdf,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
          onChange={handleFile}
          style={{ display: 'none' }}
        />
      </div>
    );
  }

  if (showUrl) {
    return (
      <div className="card fade-in" style={{ marginTop: 16, padding: 18 }}>
        <Field label="URL" hint="Paste the public URL of a post, article, or newsletter. Cadence fetches the page and extracts the readable text.">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://yoursubstack.substack.com/p/your-best-post"
            onKeyDown={(e) => e.key === 'Enter' && !submitting && urlInput.trim() && handleUrlImport()}
          />
        </Field>
        <div style={{ height: 14 }} />
        <Field label="Label (optional)" hint="Leave blank to use the page's title.">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., Substack — best opener I ever wrote"
          />
        </Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
          <button className="btn btn-ghost" onClick={() => { setShowUrl(false); setUrlInput(''); setLabel(''); }} disabled={submitting}>Cancel</button>
          <button className="btn btn-primary" onClick={handleUrlImport} disabled={submitting || !urlInput.trim()}>
            {submitting ? 'Fetching…' : 'Import'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card fade-in" style={{ marginTop: 16, padding: 18 }}>
      <Field label="Label" hint="A short name so you can tell samples apart.">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g., LinkedIn post — July hiring rant"
        />
      </Field>
      <div style={{ height: 14 }} />
      <Field label="Content" hint="Paste a complete piece — a newsletter issue, a long post, an article. The more representative, the better.">
        <textarea
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste your past content here…"
          style={{ resize: 'vertical' }}
        />
      </Field>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, fontSize: 12, color: 'var(--text-muted)' }}>
        <span>{content.length.toLocaleString()} chars</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => { setOpen(false); setLabel(''); setContent(''); }} disabled={submitting}>Cancel</button>
          <button className="btn btn-primary" onClick={handlePasteAdd} disabled={submitting || !content.trim()}>
            {submitting ? 'Saving…' : 'Save sample'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sample list
// ---------------------------------------------------------------------------

function SampleList({ samples, loaded, onUpdate, onDelete }) {
  if (!loaded) return <div style={{ color: 'var(--text-muted)', marginTop: 16 }}>Loading samples…</div>;
  if (!samples.length) {
    return (
      <div style={{
        marginTop: 20, padding: '28px 20px',
        textAlign: 'center', color: 'var(--text-muted)',
        border: '1px dashed var(--border-strong)',
        borderRadius: 'var(--radius-md)',
        fontSize: 14,
      }}>
        No samples yet. Add 3–5 strong pieces to teach Cadence your voice — that single change tends to lift output quality more than any other setting.
      </div>
    );
  }
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0 0', display: 'grid', gap: 10 }}>
      {samples.map((s) => (
        <SampleRow key={s.id} sample={s} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </ul>
  );
}

function SampleRow({ sample, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(sample.label);
  const [draftContent, setDraftContent] = useState(sample.content);

  function commit() {
    onUpdate(sample.id, { label: draftLabel.trim() || 'Untitled sample', content: draftContent });
    setEditing(false);
  }

  return (
    <li className="card" style={{ padding: 14 }}>
      {!editing && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {sample.label || 'Untitled sample'}
              </div>
              <div style={{ marginTop: 4, fontSize: 'var(--text-ec-sm)', color: 'var(--text-faint)', fontFamily: 'var(--font-ui)', letterSpacing: '0.04em', fontWeight: 600 }}>
                {sample.char_count.toLocaleString()} chars · {sample.source_type.toUpperCase()} · {new Date(sample.created_at).toLocaleDateString()}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button
                className="btn btn-ghost"
                style={{ padding: '6px 10px', fontSize: 12 }}
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? 'Hide' : 'Preview'}
              </button>
              <button
                className="btn btn-ghost"
                style={{ padding: '6px 10px', fontSize: 12 }}
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
              <button
                className="btn btn-ghost"
                style={{ padding: '6px 10px', fontSize: 12, color: 'var(--danger)' }}
                onClick={() => {
                  if (confirm(`Delete "${sample.label || 'this sample'}"?`)) onDelete(sample.id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
          {expanded && (
            <div style={{
              marginTop: 12,
              padding: 14,
              background: 'var(--surface-alt)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13.5,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              maxHeight: 320,
              overflowY: 'auto',
            }}>
              {sample.content}
            </div>
          )}
        </>
      )}
      {editing && (
        <div style={{ display: 'grid', gap: 10 }}>
          <input
            type="text"
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            placeholder="Label"
          />
          <textarea
            rows={8}
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            style={{ resize: 'vertical' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => { setEditing(false); setDraftLabel(sample.label); setDraftContent(sample.content); }}>Cancel</button>
            <button className="btn btn-primary" onClick={commit}>Save</button>
          </div>
        </div>
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------

function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>{eyebrow}</div>
      <h2 style={{ fontSize: 24, fontWeight: 500, lineHeight: 1.2 }}>{title}</h2>
      {subtitle && (
        <p style={{ color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.55, marginTop: 8, maxWidth: 640 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label style={{ display: 'block' }}>
      <div className="label" style={{ marginBottom: 6 }}>{label}</div>
      {hint && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{hint}</div>}
      {children}
    </label>
  );
}
