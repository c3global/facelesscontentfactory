import { useMemo, useState, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { PLATFORM_MAP } from '../lib/platforms.js';
import PageHeader from '../components/PageHeader.jsx';
import ActiveBrandBanner from '../components/ActiveBrandBanner.jsx';
import { useBrands } from '../lib/brand-context.jsx';

// Calendar — real-date schedule of the active plan, with four views:
//   month    → 6-week Sun-Sat grid, the default (drag chips to reschedule)
//   list     → chronological one-row-per-piece table
//   week     → 7-day strip, prev/next to step through weeks
//   platform → pieces grouped by platform (YouTube, LinkedIn, ...)
//
// The plan's startDate (kept in App-level state) defines Day 1. Every other
// piece is offset from there. "Save schedule" persists the calendar +
// startDate back to Supabase via updatePlanContent.

const VIEWS = [
  { id: 'month',    label: 'Month',       icon: MonthIcon    },
  { id: 'list',     label: 'List',        icon: ListIcon     },
  { id: 'week',     label: 'Week',        icon: WeekIcon     },
  { id: 'platform', label: 'By platform', icon: PlatformIcon },
];

export default function Calendar() {
  const navigate = useNavigate();
  const { activeBrand } = useBrands();
  const {
    niche, content, planId, startDate, setStartDate,
    setPieceDay, persistSchedule,
  } = useOutletContext();

  const [view, setView]     = useState('month');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState(null);
  const [dragOver, setDragOver] = useState(null);

  // Flatten content into { day → [pieces] } once; every view reads from here.
  const piecesByDay = useMemo(() => {
    const map = {};
    for (const [pid, list] of Object.entries(content || {})) {
      for (const it of list) {
        if (it.error) continue;
        (map[it.day] = map[it.day] || []).push({ ...it, platform: pid });
      }
    }
    return map;
  }, [content]);

  const totalPieces = useMemo(
    () => Object.values(piecesByDay).reduce((sum, arr) => sum + arr.length, 0),
    [piecesByDay]
  );

  // 6-week grid covering Day 1–30 and surrounding days.
  const cells = useMemo(() => buildCalendarCells(startDate), [startDate]);

  // ---- Drag handlers (used by month + week views) ----
  const handleDragStart = (e, platform, day) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/cadence-piece', JSON.stringify({ platform, day }));
  };
  const handleDragOver = (e, day) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(day);
  };
  const handleDragLeave = () => setDragOver(null);
  const handleDrop = (e, toDay) => {
    e.preventDefault();
    setDragOver(null);
    try {
      const raw = e.dataTransfer.getData('application/cadence-piece');
      if (!raw) return;
      const { platform, day } = JSON.parse(raw);
      if (typeof day === 'number' && typeof toDay === 'number' && day !== toDay) {
        setPieceDay(platform, day, toDay);
        setSaved(false);
      }
    } catch {}
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      await persistSchedule();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }, [persistSchedule]);

  const focusPiece = (platform, day) => {
    navigate('/planner', { state: { focusPiece: { platform, day } } });
  };

  const hasPlan = totalPieces > 0;

  const viewProps = {
    cells, piecesByDay, dragOver, startDate,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    onPieceClick: focusPiece,
  };

  return (
    <div className="container" style={{ maxWidth: 1200 }}>
      <PageHeader
        eyebrow="Calendar"
        title={hasPlan ? (niche || 'Your month') : 'Your month, scheduled.'}
        subtitle={hasPlan
          ? `${totalPieces} pieces mapped across 30 days. Drag any piece to reschedule it. Click to open it in the editor.`
          : 'Generate a plan in the Planner and it will appear here as a draggable, real-date schedule.'
        }
        actions={hasPlan && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="label">Day 1</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setSaved(false); }}
                style={{ width: 168, padding: '8px 10px' }}
              />
            </label>
            <button
              onClick={handleSave}
              className="btn btn-primary"
              disabled={!planId || saving}
              title={!planId
                ? 'Generate or load a plan first — calendar changes save into a real plan record.'
                : 'Save the calendar order and start date to this plan.'
              }
            >
              {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save schedule'}
            </button>
          </div>
        )}
      />

      {activeBrand && <ActiveBrandBanner />}

      {error && <div style={{ color: 'var(--danger)', marginTop: 16 }}>{error}</div>}

      {!hasPlan ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', marginTop: 32 }}>
          No plan loaded. Head to the <a href="/planner">Planner</a> to generate a month — it'll show up here automatically.
        </div>
      ) : (
        <>
          <ViewSwitcher value={view} onChange={setView} />

          {view === 'month'    && <MonthView    {...viewProps} />}
          {view === 'list'     && <ListView     {...viewProps} />}
          {view === 'week'     && <WeekView     {...viewProps} />}
          {view === 'platform' && <PlatformView {...viewProps} />}

          <div style={{ marginTop: 18, fontSize: 13, color: 'var(--text-faint)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {(view === 'month' || view === 'week') && (
              <>
                <span>↔ Drag any piece between days to reschedule</span>
                <span>· Click a piece to open it in the editor</span>
              </>
            )}
            {(view === 'list' || view === 'platform') && (
              <span>Click any piece to open it in the editor</span>
            )}
            {!planId && <span style={{ color: 'var(--accent)' }}>· Plan must be saved before schedule changes can persist</span>}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// View switcher pill control
// ============================================================================

function ViewSwitcher({ value, onChange }) {
  return (
    <div
      role="tablist"
      style={{
        marginTop: 24,
        display: 'inline-flex',
        gap: 4,
        padding: 4,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 999,
      }}
    >
      {VIEWS.map((v) => {
        const active = v.id === value;
        const Icon = v.icon;
        return (
          <button
            key={v.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(v.id)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 16px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              background: active ? 'var(--primary)' : 'transparent',
              color: active ? 'var(--primary-text)' : 'var(--text-muted)',
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--text-ec-md)',
              fontWeight: 700,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
            }}
          >
            <Icon /> {v.label}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// Month view — original Sun-Sat grid
// ============================================================================

function MonthView({ cells, piecesByDay, dragOver, onDragStart, onDragOver, onDragLeave, onDrop, onPieceClick }) {
  return (
    <div style={{ marginTop: 24 }}>
      <WeekHeader />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 6,
        marginTop: 6,
      }}>
        {cells.map((cell, idx) => (
          <DayCell
            key={idx}
            cell={cell}
            pieces={cell.day ? (piecesByDay[cell.day] || []) : []}
            isHover={dragOver === cell.day && cell.day != null}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onPieceClick={onPieceClick}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Week view — one Sun-Sat week at a time, with prev/next
// ============================================================================

function WeekView({ cells, piecesByDay, dragOver, onDragStart, onDragOver, onDragLeave, onDrop, onPieceClick }) {
  // Default to the week containing Day 1 (week 0)
  const [weekIdx, setWeekIdx] = useState(0);
  const totalWeeks = Math.ceil(cells.length / 7);
  const weekCells = cells.slice(weekIdx * 7, weekIdx * 7 + 7);

  const range = useMemo(() => {
    if (weekCells.length === 0) return '';
    const first = weekCells[0].date;
    const last  = weekCells[weekCells.length - 1].date;
    const fmt = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `${fmt(first)} – ${fmt(last)}`;
  }, [weekCells]);

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14, gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22, fontWeight: 500,
        }}>
          Week {weekIdx + 1} <span style={{ color: 'var(--text-muted)', fontSize: 16, marginLeft: 8 }}>· {range}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-ghost"
            onClick={() => setWeekIdx((w) => Math.max(0, w - 1))}
            disabled={weekIdx === 0}
          >
            ← Prev
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => setWeekIdx((w) => Math.min(totalWeeks - 1, w + 1))}
            disabled={weekIdx >= totalWeeks - 1}
          >
            Next →
          </button>
        </div>
      </div>

      <WeekHeader />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 8,
        marginTop: 6,
      }}>
        {weekCells.map((cell, idx) => (
          <DayCell
            key={idx}
            cell={cell}
            pieces={cell.day ? (piecesByDay[cell.day] || []) : []}
            isHover={dragOver === cell.day && cell.day != null}
            tall
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onPieceClick={onPieceClick}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// List view — chronological one-row-per-piece table
// ============================================================================

function ListView({ cells, piecesByDay, onPieceClick }) {
  // Build a sorted list of { date, day, piece } rows
  const rows = useMemo(() => {
    const out = [];
    for (const cell of cells) {
      if (!cell.day) continue;
      const pieces = piecesByDay[cell.day] || [];
      for (const piece of pieces) {
        out.push({ date: cell.date, dayNum: cell.day, piece });
      }
    }
    return out;
  }, [cells, piecesByDay]);

  if (rows.length === 0) {
    return (
      <div className="card" style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
        No pieces scheduled yet.
      </div>
    );
  }

  return (
    <div style={{
      marginTop: 24,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '100px 80px 160px 1fr',
        gap: 16,
        padding: '12px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface-alt)',
      }}>
        {['Date', 'Day', 'Platform', 'Title'].map((h) => (
          <div key={h} className="label" style={{ fontSize: 'var(--text-ec-sm)' }}>{h}</div>
        ))}
      </div>

      {/* Rows */}
      {rows.map((r, i) => {
        const p = PLATFORM_MAP[r.piece.platform] || { label: r.piece.platform, accent: 'var(--slate)', icon: '·' };
        const label = r.piece.title || r.piece.subject || r.piece.hook || 'Untitled';
        return (
          <button
            key={`${r.piece.platform}-${r.piece.day}-${i}`}
            onClick={() => onPieceClick(r.piece.platform, r.piece.day)}
            style={{
              display: 'grid',
              gridTemplateColumns: '100px 80px 160px 1fr',
              gap: 16,
              padding: '14px 20px',
              border: 'none',
              borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              width: '100%',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-alt)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text)',
            }}>
              {r.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}
            </div>
            <div style={{
              fontFamily: 'var(--font-ui)', fontSize: 'var(--text-ec-md)',
              fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: 'var(--text-faint)',
            }}>
              Day {r.dayNum}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--font-ui)', fontSize: 'var(--text-ec-sm)',
              fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
              color: p.accent,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: 2, background: p.accent,
              }} />
              {p.label}
            </div>
            <div style={{
              fontSize: 15, color: 'var(--text)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {label}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// By Platform view — pieces grouped by platform
// ============================================================================

function PlatformView({ cells, piecesByDay, onPieceClick }) {
  const groups = useMemo(() => {
    const map = {};
    for (const cell of cells) {
      if (!cell.day) continue;
      const pieces = piecesByDay[cell.day] || [];
      for (const piece of pieces) {
        const k = piece.platform;
        (map[k] = map[k] || []).push({ date: cell.date, dayNum: cell.day, piece });
      }
    }
    // Sort each group's rows by day
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => a.dayNum - b.dayNum);
    }
    return map;
  }, [cells, piecesByDay]);

  const platformIds = Object.keys(groups);

  if (platformIds.length === 0) {
    return (
      <div className="card" style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
        No pieces scheduled yet.
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {platformIds.map((pid) => {
        const p = PLATFORM_MAP[pid] || { label: pid, accent: 'var(--slate)', icon: '·' };
        const rows = groups[pid];
        return (
          <section
            key={pid}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderLeft: `3px solid ${p.accent}`,
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}
          >
            <header style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--surface-alt)',
              gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: p.accent, color: '#fff',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14,
                }}>{p.icon}</span>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500,
                }}>{p.label}</div>
              </div>
              <div style={{
                fontFamily: 'var(--font-ui)', fontSize: 'var(--text-ec-sm)',
                fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: 'var(--text-faint)',
              }}>
                {rows.length} PIECE{rows.length === 1 ? '' : 'S'}
              </div>
            </header>
            {rows.map((r, i) => {
              const label = r.piece.title || r.piece.subject || r.piece.hook || 'Untitled';
              return (
                <button
                  key={`${pid}-${r.dayNum}-${i}`}
                  onClick={() => onPieceClick(pid, r.dayNum)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '110px 80px 1fr',
                    gap: 16,
                    padding: '12px 20px',
                    border: 'none',
                    borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-alt)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ fontSize: 14 }}>
                    {r.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-ui)', fontSize: 'var(--text-ec-md)',
                    fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: 'var(--text-faint)',
                  }}>
                    Day {r.dayNum}
                  </div>
                  <div style={{
                    fontSize: 15,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {label}
                  </div>
                </button>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}

// ============================================================================
// Shared building blocks
// ============================================================================

function DayCell({ cell, pieces, isHover, tall, onDragStart, onDragOver, onDragLeave, onDrop, onPieceClick }) {
  return (
    <div
      onDragOver={cell.day ? (e) => onDragOver(e, cell.day) : undefined}
      onDragLeave={cell.day ? onDragLeave : undefined}
      onDrop={cell.day ? (e) => onDrop(e, cell.day) : undefined}
      style={{
        minHeight: tall ? 240 : 124,
        padding: 10,
        background: cell.day
          ? (isHover ? 'var(--surface-alt)' : 'var(--surface)')
          : 'transparent',
        border: '1px solid',
        borderColor: isHover ? 'var(--primary)' : (cell.day ? 'var(--border)' : 'transparent'),
        borderRadius: 'var(--radius-md)',
        opacity: cell.day ? 1 : 0.35,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        transition: 'background 120ms, border-color 120ms',
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 4,
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          fontWeight: 500,
          color: cell.isToday ? 'transparent' : 'var(--text)',
          background: cell.isToday ? 'var(--copper-gradient)' : 'none',
          WebkitBackgroundClip: cell.isToday ? 'text' : 'border-box',
          backgroundClip: cell.isToday ? 'text' : 'border-box',
        }}>
          {cell.dateNum}
        </span>
        {cell.day && (
          <span style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 'var(--text-ec-md)',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
          }}>
            DAY {cell.day}
          </span>
        )}
      </div>
      {pieces.map((piece) => (
        <PieceChip
          key={`${piece.platform}-${piece.day}-${piece.title || ''}`}
          piece={piece}
          onDragStart={(e) => onDragStart(e, piece.platform, piece.day)}
          onClick={() => onPieceClick(piece.platform, piece.day)}
        />
      ))}
    </div>
  );
}

function PieceChip({ piece, onDragStart, onClick }) {
  const p = PLATFORM_MAP[piece.platform] || { label: piece.platform, accent: 'var(--slate)', icon: '·' };
  const label = piece.title || piece.subject || piece.hook || 'Untitled';
  return (
    <button
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 7px',
        background: 'var(--bg)',
        border: `1px solid ${p.accent}40`,
        borderLeft: `3px solid ${p.accent}`,
        borderRadius: 'var(--radius-sm)',
        color: 'var(--text)',
        fontSize: 13,
        lineHeight: 1.3,
        textAlign: 'left',
        cursor: 'grab',
        minWidth: 0,
      }}
      title={`${p.label}: ${label}`}
    >
      <span style={{
        flexShrink: 0,
        width: 16, height: 16, borderRadius: 3,
        background: p.accent, color: '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, fontWeight: 700,
        fontFamily: 'var(--font-ui)',
      }}>{p.icon}</span>
      <span style={{
        flex: 1, minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>{label}</span>
    </button>
  );
}

function WeekHeader() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: 6,
      paddingBottom: 4,
      borderBottom: '1px solid var(--border)',
    }}>
      {days.map((d) => (
        <div key={d} className="label" style={{ textAlign: 'center', fontSize: 'var(--text-ec-lg)' }}>{d}</div>
      ))}
    </div>
  );
}

// ============================================================================
// Calendar math
// ============================================================================

function buildCalendarCells(startDateIso) {
  const startDate = parseIso(startDateIso) || new Date();
  const gridStart = new Date(startDate);
  gridStart.setDate(startDate.getDate() - startDate.getDay());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    const offset = Math.round((d - startDate) / 86400000);
    const dayInPlan = offset >= 0 && offset < 30 ? offset + 1 : null;
    cells.push({
      date: d,
      dateNum: d.getDate(),
      day: dayInPlan,
      isToday: d.getTime() === today.getTime(),
    });
  }
  return cells;
}

function parseIso(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setHours(0, 0, 0, 0);
  return date;
}

// ============================================================================
// View switcher icons
// ============================================================================

function viewIconProps() {
  return {
    width: 16, height: 16, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
  };
}
function MonthIcon() { return (
  <svg {...viewIconProps()}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 3v4"/><path d="M16 3v4"/></svg>
); }
function ListIcon() { return (
  <svg {...viewIconProps()}><line x1="8" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="8" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>
); }
function WeekIcon() { return (
  <svg {...viewIconProps()}><rect x="3" y="6" width="2.5" height="14" rx="0.5"/><rect x="7" y="6" width="2.5" height="14" rx="0.5"/><rect x="11" y="6" width="2.5" height="14" rx="0.5"/><rect x="15" y="6" width="2.5" height="14" rx="0.5"/><rect x="19" y="6" width="2" height="14" rx="0.5"/></svg>
); }
function PlatformIcon() { return (
  <svg {...viewIconProps()}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
); }
