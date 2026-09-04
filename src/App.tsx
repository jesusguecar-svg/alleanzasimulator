import { AlarmClock, ArrowLeft, ArrowRight, CheckCircle2, Flag, Highlighter, LayoutGrid, ListChecks, RotateCcw, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AppHeader } from './components/AppChrome';
import { DashboardScreen } from './components/DashboardScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { QuestionCard } from './components/QuestionCard';
import { ResultsScreen } from './components/ResultsScreen';
import { SetupScreen } from './components/SetupScreen';
import { loadQuestions } from './data/loadQuestions';
import { getStudyGroupId, isAnyStateSpecific, isSpecificToState } from './data/studyGroups';
import topics from './data/topics.json';
import type { SessionQuestion } from './types/question';
import { shuffleArray } from './utils/shuffle';
import { clearProgress, getProgress, saveProgress } from './utils/storage';

const topicDomains = topics as Record<string, string[]>;

const topicLabels: Record<string, string> = {
  'tipos-vida': 'Tipos de pólizas de vida',
  'tipos-salud': 'Tipos de pólizas de salud',
  provisiones: 'Cláusulas, disposiciones, opciones y exclusiones',
  'solicitud-suscripcion': 'Solicitud, suscripción y entrega',
  'impuestos-retiro-otros': 'Impuestos, retiro y otros conceptos de seguros',
  'estatutos-comunes': 'Estatutos de Texas comunes a todas las líneas',
  'estatutos-vsh': 'Estatutos de Texas relacionados con vida, salud y HMO',
};

const loaded = loadQuestions();
const THEME_KEY = 'theme';
const TIMER_KEY = 'useTimer';

type OnboardingStep = 'choice' | 'level' | 'setup';
type RecommendedPath = 'beginner' | 'advanced' | null;
type PracticeLine = 'all' | 'life' | 'health' | 'accident';
type PracticeScope = 'general' | 'state';

const domainMatches = (questionDomain: string, domains: string[]) => {
  const normalized = questionDomain.trim().toLowerCase();
  return domains.some((domain) => domain.trim().toLowerCase() === normalized);
};

const questionText = (question: { domain: string; question: string; explanation?: string; subdomain?: string }) =>
  `${question.domain} ${question.question} ${question.explanation ?? ''} ${question.subdomain ?? ''}`.toLowerCase();

const matchesPracticeLine = (question: { domain: string; question: string; explanation?: string; subdomain?: string }, line: PracticeLine) => {
  if (line === 'all') return true;
  const text = questionText(question);
  if (line === 'life') return /vida|life|annuit|anualidad|retir|jubilaci/.test(text);
  if (line === 'health') return /salud|health|hmo|disabil|enfermed/.test(text);
  // The current bank has shared accident concepts but no standalone accident-only module.
  return /accident|accidente|lesi[oó]n|disabil|salud|health/.test(text);
};

const buildSession = (domainList: string[], desiredCount?: number): SessionQuestion[] => {
  const pool = loaded.questions.filter((question) => domainMatches(question.domain, domainList));
  const amount = desiredCount && desiredCount > 0 ? Math.min(desiredCount, pool.length) : pool.length;
  return shuffleArray(pool).slice(0, amount).map((question) => ({ ...question, shuffledOptions: shuffleArray(question.options) }));
};

const getDefaultDarkMode = () => {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark') return true;
  if (saved === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const getDefaultUseTimer = () => {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem(TIMER_KEY);
  return saved === null ? true : saved === 'true';
};

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function App() {
  const [domains, setDomains] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>(['easy', 'medium', 'hard']);
  const [skipAnswered, setSkipAnswered] = useState(false);
  const [showImmediate, setShowImmediate] = useState(true);
  const [useTimer, setUseTimer] = useState(getDefaultUseTimer);
  const [darkMode, setDarkMode] = useState(getDefaultDarkMode);
  const [count, setCount] = useState(25);
  const [practiceLine, setPracticeLine] = useState<PracticeLine>('all');
  const [scope, setScope] = useState<PracticeScope>('general');
  const [stateName, setStateName] = useState('Texas');
  const [session, setSession] = useState<SessionQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string>();
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showDashboard, setShowDashboard] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('choice');
  const [recommendedPath, setRecommendedPath] = useState<RecommendedPath>(null);
  const [activeTopicLabel, setActiveTopicLabel] = useState<string | null>(null);
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [strikeouts, setStrikeouts] = useState<Record<string, string[]>>({});
  const [highlights, setHighlights] = useState<Record<string, string[]>>({});
  const [showNavigator, setShowNavigator] = useState(false);
  const [showFinish, setShowFinish] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(TIMER_KEY, String(useTimer));
  }, [useTimer]);

  useEffect(() => {
    if (!useTimer || !session || startedAt === null || index >= session.length) return;
    const timer = window.setInterval(() => setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [useTimer, session, startedAt, index]);

  const stateSpecificAvailable = scope === 'state' && loaded.questions.some((question) => isSpecificToState(question, stateName));

  const scopedQuestions = useMemo(() => loaded.questions
    .filter((question) => matchesPracticeLine(question, practiceLine))
    .filter((question) => scope === 'general' ? !isAnyStateSpecific(question) : isSpecificToState(question, stateName)), [practiceLine, scope, stateName]);

  useEffect(() => {
    const automaticDomains = Array.from(new Set(scopedQuestions.map((question) => getStudyGroupId(question, scope, stateName))));
    setDomains(automaticDomains);
    setCount((current) => Math.max(1, Math.min(current, scopedQuestions.length || 1)));
  }, [scopedQuestions]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const topicParam = params.get('topic');
    const wantsSetup = params.get('setup') === '1';
    const countParam = Number(params.get('count')) || undefined;
    const selected = topicParam && topicDomains[topicParam]
      ? topicDomains[topicParam]
      : params.getAll('domain').map((domain) => decodeURIComponent(domain));

    if (!selected.length) return;
    setDomains(selected);
    if (topicParam && topicLabels[topicParam]) setActiveTopicLabel(topicLabels[topicParam]);

    const available = loaded.questions.filter((question) => domainMatches(question.domain, selected)).length;
    if (available === 0) {
      setOnboardingStep('setup');
      setMessage('No se encontraron preguntas para este módulo. Revisa el enlace.');
      return;
    }
    if (wantsSetup) {
      setOnboardingStep('setup');
      setCount((current) => Math.min(current, available));
      return;
    }

    setSession(buildSession(selected, countParam));
    setAnswers({});
    setIndex(0);
    setStartedAt(Date.now());
    setElapsedSeconds(0);
  }, []);

  const filtered = useMemo(() => {
    const progress = getProgress();
    return scopedQuestions.filter((question) =>
      (domains.length ? domains.includes(getStudyGroupId(question, scope, stateName)) : false)
      && difficulties.includes(question.difficulty)
      && (!skipAnswered || !progress.answeredIds.includes(question.id)),
    );
  }, [domains, difficulties, skipAnswered, scopedQuestions, scope, stateName]);

  const goHome = () => {
    setSession(null);
    setShowDashboard(false);
    setOnboardingStep('choice');
    setRecommendedPath(null);
    setActiveTopicLabel(null);
    resetSessionTools();
  };

  const resetSessionTools = () => {
    setFlaggedIds([]);
    setStrikeouts({});
    setHighlights({});
    setShowNavigator(false);
    setShowFinish(false);
  };

  const startSession = (questions: SessionQuestion[]) => {
    setSession(questions);
    setAnswers({});
    setIndex(0);
    setStartedAt(Date.now());
    setElapsedSeconds(0);
    resetSessionTools();
  };

  const recordAnswer = (question: SessionQuestion, option: string) => {
    if (answers[question.id]) return;
    setAnswers((current) => ({ ...current, [question.id]: option }));
    const progress = getProgress();
    const isCorrect = option === question.correctAnswer;
    progress.answeredIds = [...new Set([...progress.answeredIds, question.id])];
    progress.correctIds = isCorrect ? [...new Set([...progress.correctIds, question.id])] : progress.correctIds.filter((id) => id !== question.id);
    progress.incorrectIds = isCorrect ? progress.incorrectIds.filter((id) => id !== question.id) : [...new Set([...progress.incorrectIds, question.id])];
    progress.attempts[question.id] = (progress.attempts[question.id] || 0) + 1;
    saveProgress(progress);
  };

  const toggleHighlight = (question: SessionQuestion) => {
    const selectedText = window.getSelection()?.toString().trim();
    if (!selectedText || selectedText.length < 2 || !question.question.toLowerCase().includes(selectedText.toLowerCase())) return;
    setHighlights((current) => {
      const existing = current[question.id] ?? [];
      if (existing.some((item) => item.toLowerCase() === selectedText.toLowerCase())) return current;
      return { ...current, [question.id]: [...existing, selectedText] };
    });
    window.getSelection()?.removeAllRanges();
  };

  if (!session) {
    if (showDashboard) {
      return (
        <div className="app-shell">
          <AppHeader darkMode={darkMode} onToggleTheme={() => setDarkMode((value) => !value)} onHome={goHome} />
          <DashboardScreen allQuestions={loaded.questions} onBack={() => setShowDashboard(false)} />
        </div>
      );
    }

    const recommendedPathMessage = recommendedPath === 'beginner'
      ? 'Ruta principiante activada: empieza escogiendo un dominio después de estudiar el capítulo correspondiente.'
      : recommendedPath === 'advanced'
        ? 'Ruta avanzada activada: toma primero un examen completo, luego revisa tus áreas débiles.'
        : undefined;

    const applyRecommendedPath = (path: Exclude<RecommendedPath, null>) => {
      setRecommendedPath(path);
      setPracticeLine('all');
      setScope('general');
      setStateName('Texas');
      setDifficulties(['easy', 'medium', 'hard']);
      setSkipAnswered(false);
      setShowImmediate(path === 'beginner');
      setUseTimer(path === 'advanced');
      setCount(path === 'beginner' ? 25 : Math.min(100, loaded.questions.length));
      setOnboardingStep('setup');
    };

    if (onboardingStep !== 'setup') {
      return (
        <div className="app-shell onboarding-shell">
          <AppHeader darkMode={darkMode} onToggleTheme={() => setDarkMode((value) => !value)} questionCount={loaded.questions.length} onHome={goHome} />
          <OnboardingScreen
            step={onboardingStep}
            onSelfGuided={() => { setRecommendedPath(null); setOnboardingStep('setup'); }}
            onRecommended={() => setOnboardingStep('level')}
            onBackToChoice={() => setOnboardingStep('choice')}
            onChooseLevel={applyRecommendedPath}
          />
          <div className="utility-rail">
            <button className="text-button" onClick={() => setShowDashboard(true)}>Ver mis estadísticas</button>
            <button className="text-button muted-action" onClick={() => { if (confirm('¿Seguro que deseas reiniciar progreso?')) clearProgress(); }}>Reiniciar progreso</button>
          </div>
        </div>
      );
    }

    return (
      <SetupScreen
        questions={scopedQuestions}
        selectedDomains={domains}
        setSelectedDomains={setDomains}
        selectedDifficulties={difficulties}
        setSelectedDifficulties={setDifficulties}
        skipAnswered={skipAnswered}
        setSkipAnswered={setSkipAnswered}
        showImmediate={showImmediate}
        setShowImmediate={setShowImmediate}
        useTimer={useTimer}
        setUseTimer={setUseTimer}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        count={count}
        setCount={setCount}
        availableCount={filtered.length}
        message={message}
        recommendedPathMessage={recommendedPathMessage}
        onBackToOnboarding={() => setOnboardingStep('choice')}
        onViewStats={() => setShowDashboard(true)}
        onResetProgress={() => { if (confirm('¿Seguro que deseas reiniciar progreso?')) clearProgress(); }}
        practiceLine={practiceLine}
        setPracticeLine={setPracticeLine}
        scope={scope}
        setScope={setScope}
        stateName={stateName}
        setStateName={setStateName}
        stateSpecificAvailable={stateSpecificAvailable}
        onStart={() => {
          if (filtered.length === 0) return setMessage('No hay preguntas disponibles con los filtros seleccionados.');
          if (count > filtered.length) return setMessage(`Solo hay ${filtered.length} preguntas disponibles.`);
          startSession(shuffleArray(filtered).slice(0, count).map((question) => ({ ...question, shuffledOptions: shuffleArray(question.options) })));
          setMessage(undefined);
        }}
      />
    );
  }

  if (index >= session.length) {
    return (
      <ResultsScreen
        questions={session}
        answers={answers}
        elapsedSeconds={elapsedSeconds}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((value) => !value)}
        onRetryMissed={() => startSession(session.filter((question) => answers[question.id] !== question.correctAnswer))}
        onNew={() => { setSession(null); resetSessionTools(); }}
        onHome={goHome}
      />
    );
  }

  const question = session[index];
  const selectedAnswer = answers[question.id];
  const answeredCount = Object.keys(answers).length;
  const questionHighlights = highlights[question.id] ?? [];
  const isFlagged = flaggedIds.includes(question.id);
  const completion = ((index + 1) / session.length) * 100;

  return (
    <div className="app-shell exam-shell">
      <AppHeader
        compact
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((value) => !value)}
        center={<div className="exam-title"><span>{activeTopicLabel ? 'Práctica por módulo' : 'Práctica personalizada'}</span><strong>{activeTopicLabel || (scope === 'state' && stateSpecificAvailable ? `${stateName} · Life, Health & Accident` : 'Life, Health & Accident · Conceptos generales')}</strong></div>}
        onHome={goHome}
      />
      <div className="progress-strip"><span style={{ width: `${completion}%` }} /></div>

      <main className="exam-main" id="main-content">
        {showNavigator && <button className="navigator-backdrop" onClick={() => setShowNavigator(false)} aria-label="Cerrar navegador" />}
        <aside className={`navigator ${showNavigator ? 'open' : ''}`}>
          <div className="navigator-head">
            <div><LayoutGrid size={18} /><strong>Navegador</strong></div>
            <button className="icon-button mobile-only" onClick={() => setShowNavigator(false)} aria-label="Cerrar navegador"><X size={18} /></button>
          </div>
          <div className="nav-summary"><span><strong>{answeredCount}</strong> contestadas</span><span><strong>{flaggedIds.length}</strong> marcadas</span></div>
          <div className="question-grid">
            {session.map((item, itemIndex) => {
              const answered = Boolean(answers[item.id]);
              const flagged = flaggedIds.includes(item.id);
              return (
                <button key={item.id} className={`${itemIndex === index ? 'current' : ''} ${answered ? 'answered' : ''} ${flagged ? 'flagged' : ''}`} onClick={() => { setIndex(itemIndex); setShowNavigator(false); }} aria-label={`Pregunta ${itemIndex + 1}, ${answered ? 'contestada' : 'sin contestar'}${flagged ? ', marcada' : ''}`}>
                  {itemIndex + 1}{flagged && <Flag size={9} fill="currentColor" />}
                </button>
              );
            })}
          </div>
          <div className="legend"><span><i className="dot current" /> Actual</span><span><i className="dot answered" /> Contestada</span><span><i className="dot" /> Pendiente</span></div>
          <button className="submit-side" onClick={() => setShowFinish(true)}>Finalizar sesión</button>
        </aside>

        <section className="question-workspace">
          <div className="question-toolbar">
            <button className="navigator-trigger" onClick={() => setShowNavigator(true)}><LayoutGrid size={17} /> Preguntas</button>
            <span className="question-position">Pregunta <strong>{index + 1}</strong> de {session.length}</span>
            <div className="question-tools">
              <button className={questionHighlights.length ? 'active' : ''} onClick={() => toggleHighlight(question)} title="Selecciona texto del enunciado y presiona para resaltar"><Highlighter size={17} /><span>Resaltar</span></button>
              <button className={isFlagged ? 'active warning' : ''} onClick={() => setFlaggedIds((current) => isFlagged ? current.filter((id) => id !== question.id) : [...current, question.id])}><Flag size={17} fill={isFlagged ? 'currentColor' : 'none'} /><span>{isFlagged ? 'Marcada' : 'Marcar'}</span></button>
            </div>
          </div>

          <QuestionCard
            q={question}
            selected={selectedAnswer}
            onSelect={(option) => recordAnswer(question, option)}
            showFeedback={showImmediate && Boolean(selectedAnswer)}
            struckOptions={strikeouts[question.id] ?? []}
            onToggleStrike={(option) => setStrikeouts((current) => {
              const existing = current[question.id] ?? [];
              return { ...current, [question.id]: existing.includes(option) ? existing.filter((item) => item !== option) : [...existing, option] };
            })}
            highlights={questionHighlights}
          />

          <footer className="exam-footer">
            <button className="secondary" disabled={index === 0} onClick={() => setIndex((current) => current - 1)}><ArrowLeft size={18} /> Anterior</button>
            <span>{selectedAnswer ? 'Respuesta registrada' : 'Sin respuesta'}{useTimer && <> · <AlarmClock size={12} /> {formatTime(elapsedSeconds)}</>}</span>
            {index < session.length - 1
              ? <button className="primary" onClick={() => setIndex((current) => current + 1)}>Siguiente <ArrowRight size={18} /></button>
              : <button className="primary" onClick={() => setShowFinish(true)}>Revisar y finalizar</button>}
          </footer>
        </section>
      </main>

      {showFinish && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowFinish(false); }}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="finish-title">
            <div className="modal-icon"><ListChecks size={23} /></div>
            <h2 id="finish-title">¿Finalizar la sesión?</h2>
            <p>Has contestado <strong>{answeredCount} de {session.length}</strong> preguntas. {session.length - answeredCount > 0 && `Quedan ${session.length - answeredCount} sin contestar.`}</p>
            <div className="modal-stats"><span><CheckCircle2 size={17} /> {answeredCount} contestadas</span><span><Flag size={17} /> {flaggedIds.length} marcadas</span></div>
            <div className="modal-actions"><button className="secondary" onClick={() => setShowFinish(false)}>Continuar revisando</button><button className="primary" onClick={() => { setShowFinish(false); setIndex(session.length); }}>Entregar respuestas</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
