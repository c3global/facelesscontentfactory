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
        padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
        background: copied ? 'var(--teal)' : 'transparent',
        color: copied ? 'white' : 'var(--text)',
        border: '1px solid var(--border)',
      }}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
