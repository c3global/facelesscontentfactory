import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase.js';
import { PLATFORMS } from './lib/platforms.js';
import { generateIdeas, regenerateIdea, generateContent, savePlan } from './lib/api.js';
import Header from './components/Header.jsx';
import SignIn from './components/SignIn.jsx';
import Stepper from './components/Stepper.jsx';
import PlanStep from './components/PlanStep.jsx';
import ApproveStep from './components/ApproveStep.jsx';
import ContentStep from './components/ContentStep.jsx';
import ErrorBanner from './components/ErrorBanner.jsx';
import HistoryDrawer from './components/HistoryDrawer.jsx';

const STEPS = [
  { id: 'plan',    label: 'Plan' },
  { id: 'approve', label: 'Approve' },
  { id: 'write',   label: 'Write' },
];

export default function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [step, setStep] = useState('plan');
  const [niche, setNiche] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['youtube', 'linkedin', 'shorts']);
  const [ideas, setIdeas] = useState({});       // { platformId: { items: [...] } }
  const [approved, setApproved] = useState({}); // { platformId: Set(day) }
  const [content, setContent] = useState({});   // { platformId: [item, ...] }
  const [error, setError] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  function reset() {
    setStep('plan');
    setIdeas({});
    setApproved({});
    setContent({});
    setError(null);
  }

  async function handleGenerateIdeas() {
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
  }

  async function handleRegenerateOne(platform, day) {
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
  }

  function toggleApprove(platform, day) {
    setApproved((prev) => {
      const next = new Set(prev[platform] || []);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return { ...prev, [platform]: next };
    });
  }

  function approveAllPlatform(platform) {
    const days = (ideas[platform]?.items || []).map((i) => i.day);
    setApproved((prev) => ({ ...prev, [platform]: new Set(days) }));
  }

  function approvedCount() {
    return Object.values(approved).reduce((sum, set) => sum + set.size, 0);
  }

  async function handleWriteContent(premium = false) {
    setBusy(true);
    setError(null);
    setContent({});
    const writeTasks = [];
    for (const pid of selectedPlatforms) {
      const approvedDays = approved[pid];
      if (!approvedDays || approvedDays.size === 0) continue;
      const platformIdeas = (ideas[pid]?.items || []).filter((i) => approvedDays.has(i.day));
      for (const idea of platformIdeas) {
        writeTasks.push({ pid, idea });
      }
    }
    setStep('write');

    const results = {};
    // Run with concurrency = 4 to avoid rate-limit spikes
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
      await savePlan(niche.trim(), { niche, platforms: results, ideas, model: premium ? 'opus' : 'sonnet' });
    } catch (e) {
      console.warn('savePlan failed', e);
    }
    setBusy(false);
  }

  function loadSavedPlan(saved) {
    const p = saved.payload;
    setNiche(saved.niche);
    setIdeas(p.ideas || {});
    setContent(p.platforms || {});
    setSelectedPlatforms(Object.keys(p.platforms || {}));
    setStep('write');
    setHistoryOpen(false);
  }

  if (!authReady) return <div className="container">Loading…</div>;
  if (!session) return <SignIn />;

  return (
    <>
      <Header
        email={session.user.email}
        onSignOut={() => supabase.auth.signOut()}
        onOpenHistory={() => setHistoryOpen(true)}
        onHome={reset}
      />
      <div className="container">
        <Stepper steps={STEPS} active={step} onNavigate={(id) => {
          if (id === 'plan') setStep('plan');
          else if (id === 'approve' && Object.keys(ideas).length) setStep('approve');
          else if (id === 'write' && Object.keys(content).length) setStep('write');
        }} />

        {error && <ErrorBanner message={error} onRetry={() => setError(null)} />}

        {step === 'plan' && (
          <PlanStep
            niche={niche}
            onNicheChange={setNiche}
            selected={selectedPlatforms}
            onTogglePlatform={(id) => setSelectedPlatforms((s) =>
              s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
            )}
            onGenerate={handleGenerateIdeas}
            busy={busy}
          />
        )}

        {step === 'approve' && (
          <ApproveStep
            niche={niche}
            ideas={ideas}
            approved={approved}
            platforms={selectedPlatforms}
            approvedCount={approvedCount()}
            onToggle={toggleApprove}
            onRegenerate={handleRegenerateOne}
            onApproveAll={approveAllPlatform}
            onBack={() => setStep('plan')}
            onWrite={() => handleWriteContent(false)}
            onWritePremium={() => handleWriteContent(true)}
            busy={busy}
          />
        )}

        {step === 'write' && (
          <ContentStep
            niche={niche}
            content={content}
            platforms={selectedPlatforms.filter((p) => approved[p]?.size > 0 || content[p])}
            busy={busy}
            totalExpected={approvedCount()}
            onStartOver={reset}
          />
        )}
      </div>

      {historyOpen && <HistoryDrawer onClose={() => setHistoryOpen(false)} onSelect={loadSavedPlan} />}
    </>
  );
}
