import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase.js';
import { generateIdeas, regenerateIdea, generateContent, savePlan, getPlan, updatePlanContent } from './lib/api.js';
import SignIn from './components/SignIn.jsx';
import AppShell from './components/AppShell.jsx';
import { BrandProvider } from './lib/brand-context.jsx';

// App is the authenticated shell. It owns the in-flight plan state so the user
// can navigate between Dashboard / Planner / Library / Brand without losing
// work. State is exposed to nested routes via <Outlet context={...} />.

export default function App() {
  const [session, setSession]   = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const navigate = useNavigate();

  // ---- Auth ----
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // ---- Planner state (shared across routes) ----
  const [step, setStep] = useState('plan'); // 'plan' | 'approve' | 'write'
  const [niche, setNiche] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['youtube', 'linkedin', 'shorts']);
  const [ideas, setIdeas] = useState({});
  const [approved, setApproved] = useState({});
  const [content, setContent] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [planId, setPlanId] = useState(null);
  const [startDate, setStartDate] = useState(() => isoDate(new Date())); // ISO yyyy-mm-dd

  const resetPlan = useCallback(() => {
    setStep('plan');
    setIdeas({});
    setApproved({});
    setContent({});
    setError(null);
    setPlanId(null);
    setStartDate(isoDate(new Date()));
  }, []);

  const togglePlatform = useCallback((id) => {
    setSelectedPlatforms((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }, []);

  const toggleApprove = useCallback((platform, day) => {
    setApproved((prev) => {
      const next = new Set(prev[platform] || []);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return { ...prev, [platform]: next };
    });
  }, []);

  const approveAllPlatform = useCallback((platform) => {
    const days = (ideas[platform]?.items || []).map((i) => i.day);
    setApproved((prev) => ({ ...prev, [platform]: new Set(days) }));
  }, [ideas]);

  const approvedCount = useCallback(() => {
    return Object.values(approved).reduce((sum, set) => sum + set.size, 0);
  }, [approved]);

  const handleGenerateIdeas = useCallback(async () => {
    if (!niche.trim() || selectedPlatforms.length === 0) return;
    setBusy(true);
    setError(null);
    setIdeas({});
    setApproved({});
    try {
      const results = await Promise.all(
        selectedPlatforms.map(async (pid) => {
          const data = await generateIdeas(niche.trim(), pid);
          return [pid, data];
        })
      );
      setIdeas(Object.fromEntries(results));
      setApproved(Object.fromEntries(selectedPlatforms.map((p) => [p, new Set()])));
      setStep('approve');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [niche, selectedPlatforms]);

  const handleRegenerateOne = useCallback(async (platform, day) => {
    const platformIdeas = ideas[platform]?.items || [];
    const avoidTitles = platformIdeas.map((i) => i.title);
    try {
      const { item } = await regenerateIdea(niche.trim(), platform, day, avoidTitles);
      setIdeas((prev) => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          items: prev[platform].items.map((i) => (i.day === day ? { ...item, day } : i)),
        },
      }));
    } catch (e) {
      setError(e.message);
    }
  }, [ideas, niche]);

  const handleWriteContent = useCallback(async (premium = false) => {
    setBusy(true);
    setError(null);
    setContent({});
    const writeTasks = [];
    for (const pid of selectedPlatforms) {
      const approvedDays = approved[pid];
      if (!approvedDays || approvedDays.size === 0) continue;
      const platformIdeas = (ideas[pid]?.items || []).filter((i) => approvedDays.has(i.day));
      for (const idea of platformIdeas) writeTasks.push({ pid, idea });
    }
    setStep('write');

    const results = {};
    const queue = [...writeTasks];
    const workers = Array.from({ length: 4 }, async () => {
      while (queue.length) {
        const task = queue.shift();
        if (!task) break;
        try {
          const piece = await generateContent(niche.trim(), task.pid, task.idea, premium);
          (results[task.pid] = results[task.pid] || []).push(piece);
          setContent((prev) => ({ ...prev, [task.pid]: [...(results[task.pid] || [])].sort((a, b) => a.day - b.day) }));
        } catch (e) {
          (results[task.pid] = results[task.pid] || []).push({ day: task.idea.day, error: e.message, title: task.idea.title });
          setContent((prev) => ({ ...prev, [task.pid]: [...(results[task.pid] || [])].sort((a, b) => a.day - b.day) }));
        }
      }
    });
    await Promise.all(workers);

    try {
      const saved = await savePlan(niche.trim(), {
        niche, platforms: results, ideas, startDate,
        model: premium ? 'opus' : 'sonnet',
      });
      if (saved?.id) setPlanId(saved.id);
    } catch (e) {
      console.warn('savePlan failed', e);
    }
    setBusy(false);
  }, [selectedPlatforms, approved, ideas, niche, startDate]);

  const updatePiece = useCallback((platform, day, patch) => {
    setContent((prev) => {
      const list = prev[platform] || [];
      const next = list.map((it) => (it.day === day ? { ...it, ...patch } : it));
      return { ...prev, [platform]: next };
    });
  }, []);

  // Move a single piece from one day to another. If a piece on the same
  // platform already lives on the target day, this just adds another piece
  // for that day — multiple pieces per day is the expected calendar shape.
  const setPieceDay = useCallback((platform, fromDay, toDay) => {
    if (fromDay === toDay) return;
    setContent((prev) => {
      const list = prev[platform] || [];
      const next = list.map((it) => (it.day === fromDay ? { ...it, day: toDay } : it));
      // Sort so the editor/calendar see a stable order
      next.sort((a, b) => a.day - b.day);
      return { ...prev, [platform]: next };
    });
  }, []);

  // Persist the in-memory plan (calendar order + edits) back to Supabase.
  // No-op when there's no saved plan yet — generation always saves first.
  const persistSchedule = useCallback(async () => {
    if (!planId) throw new Error('No plan loaded to save into.');
    await updatePlanContent(planId, {
      niche, platforms: content, ideas, startDate,
    });
  }, [planId, niche, content, ideas, startDate]);

  const loadSavedPlan = useCallback(async (id) => {
    const saved = await getPlan(id);
    const p = saved.payload || {};
    setNiche(saved.niche);
    setIdeas(p.ideas || {});
    setContent(p.platforms || {});
    setSelectedPlatforms(Object.keys(p.platforms || {}));
    setStartDate(p.startDate || isoDate(new Date(saved.created_at)));
    setPlanId(saved.id);
    setStep('write');
    navigate('/planner');
  }, [navigate]);

  if (!authReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--text-muted)' }}>
        Loading…
      </div>
    );
  }
  if (!session) return <SignIn />;

  const plannerContext = {
    step, setStep,
    niche, setNiche,
    selectedPlatforms, togglePlatform, setSelectedPlatforms,
    ideas, approved, content,
    error, setError, busy,
    planId, startDate, setStartDate,
    resetPlan,
    handleGenerateIdeas,
    handleRegenerateOne,
    toggleApprove, approveAllPlatform, approvedCount,
    handleWriteContent,
    updatePiece,
    setPieceDay,
    persistSchedule,
    loadSavedPlan,
  };

  return (
    <BrandProvider session={session}>
      <AppShell
        session={session}
        onSignOut={() => supabase.auth.signOut()}
        plannerContext={plannerContext}
      />
    </BrandProvider>
  );
}

function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
