import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase.js';
import { PLATFORMS } from './lib/platforms.js';
import { generateAll, savePlan } from './lib/api.js';
import Header from './components/Header.jsx';
import SignIn from './components/SignIn.jsx';
import NicheInput from './components/NicheInput.jsx';
import OutputTabs from './components/OutputTabs.jsx';
import LoadingState from './components/LoadingState.jsx';
import ErrorBanner from './components/ErrorBanner.jsx';
import HistoryDrawer from './components/HistoryDrawer.jsx';

export default function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [platformStatus, setPlatformStatus] = useState({});
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleGenerate() {
    if (!niche.trim()) return;
    setLoading(true);
    setError(null);
    setPlan(null);
    const initialStatus = Object.fromEntries(PLATFORMS.map((p) => [p.id, 'pending']));
    setPlatformStatus(initialStatus);

    const partial = { niche, platforms: {} };
    setPlan(partial);

    const results = await generateAll(niche, (pid, data, err) => {
      setPlatformStatus((s) => ({ ...s, [pid]: err ? 'error' : 'done' }));
      if (data) {
        setPlan((p) => ({ ...p, platforms: { ...p.platforms, [pid]: data } }));
      }
    });

    const succeeded = Object.entries(results).filter(([, v]) => !v.error);
    if (succeeded.length === PLATFORMS.length) {
      try {
        await savePlan(niche, { niche, platforms: Object.fromEntries(succeeded) });
      } catch (e) {
        console.warn('savePlan failed', e);
      }
    } else if (succeeded.length === 0) {
      setError('Generation failed. Please try again.');
    }
    setLoading(false);
  }

  function loadSavedPlan(saved) {
    setNiche(saved.niche);
    setPlan(saved.payload);
    setPlatformStatus(Object.fromEntries(PLATFORMS.map((p) => [p.id, 'done'])));
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
      />
      <div className="container">
        <NicheInput value={niche} onChange={setNiche} onGenerate={handleGenerate} disabled={loading} />
        {error && <ErrorBanner message={error} onRetry={handleGenerate} />}
        {loading && !plan?.platforms?.youtube && <LoadingState />}
        {plan && <OutputTabs plan={plan} status={platformStatus} />}
      </div>
      {historyOpen && <HistoryDrawer onClose={() => setHistoryOpen(false)} onSelect={loadSavedPlan} />}
    </>
  );
}
