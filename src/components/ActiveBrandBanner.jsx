// Shown at the top of pages whose content is scoped to the active brand
// (Brand, Library, Calendar). Tells the user which brand they're inside
// and provides a quick path to switch.

import { Link } from 'react-router-dom';
import BeatSignature from './BeatSignature.jsx';
import { useBrands } from '../lib/brand-context.jsx';

export default function ActiveBrandBanner({ brand: brandOverride, message }) {
  const { activeBrand } = useBrands();
  const brand = brandOverride || activeBrand;
  if (!brand) return null;

  return (
    <div
      style={{
        marginTop: 18,
        padding: '12px 16px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: '3px solid var(--primary)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <BeatSignature seed={brand.name} accent={brand.accent_color} size="sm" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 'var(--text-ec-sm)',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-faint)',
        }}>
          Active brand
        </div>
        <div style={{
          marginTop: 2,
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          fontWeight: 500,
          color: 'var(--text)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {brand.name}
          {message && (
            <span style={{
              marginLeft: 10,
              fontSize: 14,
              fontFamily: 'var(--font-body)',
              color: 'var(--text-muted)',
              fontWeight: 400,
            }}>
              · {message}
            </span>
          )}
        </div>
      </div>
      <Link
        to="/brands"
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 'var(--text-ec-sm)',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--primary)',
          flexShrink: 0,
        }}
      >
        Switch →
      </Link>
    </div>
  );
}
