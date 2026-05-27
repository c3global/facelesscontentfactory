import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Stepper from '../components/Stepper.jsx';
import PlanStep from '../components/PlanStep.jsx';
import ApproveStep from '../components/ApproveStep.jsx';
import ContentStep from '../components/ContentStep.jsx';
import SequentialEditor from '../components/SequentialEditor.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import PageHeader from '../components/PageHeader.jsx';

const STEPS = [
  { id: 'plan',    label: 'Plan' },
  { id: 'approve', label: 'Approve' },
  { id: 'write',   label: 'Write' },
];

export default function Planner() {
  const ctx = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [focusKey, setFocusKey] = useState(null);

  // When the Calendar links here with state.focusPiece, drop the editor
  // straight onto that piece and clear the state so a refresh doesn't
  // re-trigger it.
  useEffect(() => {
    const focus = location.state?.focusPiece;
    if (focus?.platform && focus?.day != null) {
      setFocusKey(`${focus.platform}:${focus.day}`);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const {
    step, setStep,
    niche, setNiche,
    selectedPlatforms, togglePlatform,
    ideas, approved, content,
    error, setError, busy,
    resetPlan,
    handleGenerateIdeas, handleRegenerateOne,
    toggleApprove, approveAllPlatform, approvedCount,
    handleWriteContent,
    updatePiece, persistSchedule, planId,
  } = ctx;

  return (
    <div className="container">
      <PageHeader
        eyebrow="Planner"
        title="Plan a month of content."
        subtitle="One niche in. Thirty days of platform-ready content out. Curate before you commit."
        actions={step !== 'plan' && (
          <button className="btn btn-ghost" onClick={resetPlan}>Start over</button>
        )}
      />

      <div style={{ marginTop: 24 }}>
        <Stepper steps={STEPS} active={step} onNavigate={(id) => {
          if (id === 'plan') setStep('plan');
          else if (id === 'approve' && Object.keys(ideas).length) setStep('approve');
          else if (id === 'write' && Object.keys(content).length) setStep('write');
        }} />
      </div>

      {error && <ErrorBanner message={error} onRetry={() => setError(null)} />}

      {step === 'plan' && (
        <PlanStep
          niche={niche}
          onNicheChange={setNiche}
          selected={selectedPlatforms}
          onTogglePlatform={togglePlatform}
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
        busy ? (
          <ContentStep
            niche={niche}
            content={content}
            platforms={selectedPlatforms.filter((p) => approved[p]?.size > 0 || content[p])}
            busy={busy}
            totalExpected={approvedCount()}
            onStartOver={resetPlan}
          />
        ) : (
          <SequentialEditor
            niche={niche}
            content={content}
            platforms={selectedPlatforms.filter((p) => content[p]?.length)}
            onUpdatePiece={updatePiece}
            onStartOver={resetPlan}
            initialKey={focusKey}
            onPersist={persistSchedule}
            planId={planId}
          />
        )
      )}
    </div>
  );
}
