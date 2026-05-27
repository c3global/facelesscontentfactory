import { useMemo, useState, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { PLATFORM_MAP } from '../lib/platforms.js';
import PageHeader from '../components/PageHeader.jsx';

// Calendar — real-date monthly view of the current plan.
//
// The plan's startDate (kept in App-level state) defines when "Day 1" lands
// on the calendar; every other piece is offset from there. Pieces are
// draggable between days; dropping a piece updates only its own .day value,
// preserving all other pieces' positions.
//
// "Save schedule" persists the in-memory plan back to Supabase via
// updatePlanContent. No autosave — explicit save mirrors editor behavior.

export default function Calendar() {
  const navigate = useNavigate();
  const {
    niche, content, planId, startDate, setStartDate,
    setPieceDay, persistSchedule,
  } = useOutletContext();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState(null);
  const [dragOver, setDragOver] = useState(null); // day number

  // Flatten content into a single { day → [pieces] } map.
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

  // Build the calendar grid. Always show 6 weeks (42 cells) starting from the
  // Sunday on or before the start date. Each cell holds either a "day-in-plan"
  // (Day 1–30) or an "out-of-plan" date (greyed out).
  const cells = useMemo(() => buildCalendarCells(startDate), [startDate]);

  // ---- Drag handlers ----
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

      {error && <div style={{ color: 'var(--danger)', marginTop: 16 }}>{error}</div>}

      {!hasPlan && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', marginTop: 32 }}>
          No plan loaded. Head to the <a href="/planner">Planner</a> to generate a month — it'll show up here automatically.
        </div>
      )}

      {hasPlan && (
        <div style={{ marginTop: 28 }}>
          <WeekHeader />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 6,
            marginTop: 6,
          }}>
            {cells.map((cell, idx) => {
              const pieces = cell.day ? (piecesByDay[cell.day] || []) : [];
              const isHover = dragOver === cell.day && cell.day != null;
              return (
                <div
                  key={idx}
                  onDragOver={cell.day ? (e) => handleDragOver(e, cell.day) : undefined}
                  onDragLeave={cell.day ? handleDragLeave : undefined}
                  onDrop={cell.day ? (e) => handleDrop(e, cell.day) : undefined}
                  style={{
                    minHeight: 124,
                    padding: 8,
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
                      onDragStart={(e) => handleDragStart(e, piece.platform, piece.day)}
                      onClick={() => focusPiece(piece.platform, piece.day)}
                    />
                  ))}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 18, fontSize: 13, color: 'var(--text-faint)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span>↔ Drag any piece between days to reschedule</span>
            <span>· Click a piece to open it in the editor</span>
            {!planId && <span style={{ color: 'var(--accent)' }}>· Plan must be saved before schedule changes can persist</span>}
          </div>
        </div>
      )}
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
        fontSize: 11.5,
        lineHeight: 1.3,
        textAlign: 'left',
        cursor: 'grab',
        minWidth: 0,
      }}
      onMouseDown={(e) => { e.currentTarget.style.cursor = 'grabbing'; }}
      onMouseUp={(e) => { e.currentTarget.style.cursor = 'grab'; }}
      title={`${p.label}: ${label}`}
    >
      <span style={{
        flexShrink: 0,
        width: 14, height: 14, borderRadius: 3,
        background: p.accent, color: '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 8, fontWeight: 700,
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

// ---------------------------------------------------------------------------
// Calendar math
// ---------------------------------------------------------------------------

function buildCalendarCells(startDateIso) {
  // startDate (Day 1) → calendar grid that covers the 30-day window plus
  // surrounding days so the grid fills 6 Sun-Sat weeks.
  const startDate = parseIso(startDateIso) || new Date();
  // Snap to the Sunday on or before startDate
  const gridStart = new Date(startDate);
  gridStart.setDate(startDate.getDate() - startDate.getDay());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    const offset = Math.round((d - startDate) / 86400000); // days from Day 1
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
