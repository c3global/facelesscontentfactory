// Cadence wordmark — Option E lockup.
// Fraunces italic "cadence" with a copper→rose-gold gradient fill, plus a
// "BY C3 GLOBAL" caption in Sofia Sans Extra Condensed beneath. This is the
// canonical brand mark; use the `size` prop to scale for context.

const SIZES = {
  xs: { name: 18, caption: 11, gap: 1  },
  sm: { name: 26, caption: 12, gap: 2  },
  md: { name: 40, caption: 14, gap: 3  },
  lg: { name: 72, caption: 18, gap: 6  },
  xl: { name: 112, caption: 22, gap: 8 },
};

export default function Wordmark({ size = 'md', caption = true, as: Tag = 'span' }) {
  const s = SIZES[size] || SIZES.md;
  return (
    <Tag className="wordmark" aria-label="Cadence by C3 Global">
      <span
        className="wordmark__name"
        style={{ fontSize: s.name, marginBottom: caption ? s.gap : 0 }}
      >
        cadence
      </span>
      {caption && (
        <span className="wordmark__caption" style={{ fontSize: s.caption }}>
          by C3 Global
        </span>
      )}
    </Tag>
  );
}
