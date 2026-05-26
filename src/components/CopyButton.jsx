import { useState } from 'react';

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  }
  return (
    <button
      onClick={copy}
      style={{
        padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500,
        background: copied ? 'var(--mint)' : 'transparent',
        color: copied ? '#0a2a1a' : 'var(--text)',
        border: `1px solid ${copied ? 'var(--mint)' : 'var(--border)'}`,
        transition: 'all 120ms ease',
      }}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}
