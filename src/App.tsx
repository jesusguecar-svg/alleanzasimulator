import { AlarmClock, ArrowLeft, ArrowRight, CheckCircle2, Flag, Highlighter, LayoutGrid, ListChecks, RotateCcw, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppHeader } from './components/AppChrome';
import { DashboardScreen } from './components/DashboardScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { PartialExamLanding } from './components/PartialExamLanding';
import { QuestionCard } from './components/QuestionCard';
import { ResultsScreen } from './components/ResultsScreen';
import { ScheduledExamScreen } from './components/ScheduledExamScreen';
import { SetupScreen } from './components/SetupScreen';
import { loadQuestions, loadScheduledExamQuestions } from './data/loadQuestions';
import { buildPartialExamSession, getPartialExamDomain, isPartialExamQuestion, PARTIAL_EXAM_SECONDS_PER_QUESTION } from './data/partialExam';
import type { ExamLanguage } from './data/partialExam';
import { buildExamReport, buildScheduledExamSession, EXAM_QUESTION_COUNTS, flushPendingEvents, isRetakeAccessActive, loadRegistration, matchesExamLines, NEW_RETAKE_TOKENS_EXPIRE_AT, newRegistrationId, prepareRetakeRegistration, resolveRetakeAccess, saveRegistration, sendEvent } from './data/scheduledExam';
import type { ExamLines, RetakeAccess, ScheduledRegistration } from './data/scheduledExam';
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
const scheduledLoaded = loadScheduledExamQuestions();
const THEME_KEY = 'theme';
const TIMER_KEY = 'useTimer';

type OnboardingStep = 'choice' | 'level' | 'setup';
type RecommendedPath = 'beginner' | 'advanced' | null;
type PracticeLine = 'all' | 'life' | 'health' | 'accident';
type PracticeScope = 'general' | 'state';
type SessionKind = 'practice' | 'partial-exam';

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

const isPartialExamRoute = () => {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.replace(/\/$/, '') === '/examen-parcial'
    || new URLSearchParams(window.location.search).get('exam') === 'parcial';
};

const isScheduledExamRoute = () => {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.replace(/\/$/, '') === '/examen-programado'
    || new URLSearchParams(window.location.search).get('exam') === 'programado';
};

// Lets the admin try the scheduled exam outside a slot with ?preview=<VITE_PREVIEW_KEY>; reports are flagged as previews.
const isScheduledPreview = () => {
  const key = import.meta.env.VITE_PREVIEW_KEY as string | undefined;
  return typeof window !== 'undefined' && Boolean(key) && new URLSearchParams(window.location.search).get('preview') === key;
};

// A valid retake link reopens the matching saved attempt and bypasses the weekend slot window.
const getScheduledRetakeAccess = (): RetakeAccess | null => {
  if (typeof window === 'undefined') return null;
  return resolveRetakeAccess(new URLSearchParams(window.location.search).get('retake'), [
    // Legacy Luz token intentionally has no expiry.
    { token: import.meta.env.VITE_RETAKE_TOKEN as string | undefined },
    { token: import.meta.env.VITE_MIRIAM_RETAKE_TOKEN as string | undefined, studentName: 'Miriam Bravo', expiresAt: NEW_RETAKE_TOKENS_EXPIRE_AT },
    { token: import.meta.env.VITE_BETSY_RETAKE_TOKEN as string | undefined, studentName: 'Betsy Acosta', expiresAt: NEW_RETAKE_TOKENS_EXPIRE_AT },
    { token: import.meta.env.VITE_MANOGLY_RETAKE_TOKEN as string | undefined, studentName: 'Manogly Fernandez', expiresAt: NEW_RETAKE_TOKENS_EXPIRE_AT },
    // This expiring link is intentionally unnamed so the student enters their own details.
    { token: import.meta.env.VITE_CYNTHIA_RETAKE_TOKEN as string | undefined, expiresAt: NEW_RETAKE_TOKENS_EXPIRE_AT, requiresRegistrationDetails: true },
  ]);
};

const linesSubtitle = (lines: ExamLines, language: ExamLanguage) => ({
  both: language === 'en' ? 'Life and Health' : 'Vida y Salud',
  life: language === 'en' ? 'Life only' : 'Solo Vida',
  health: language === 'en' ? 'Health only' : 'Solo Salud',
})[lines];

const initialExamLanguage = (): ExamLanguage => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'es';

const examCopy = {
  es: {
    exam: 'Examen Parcial', subtitle: 'Módulos 1–9 · Vida, Salud y Accidentes', navigator: 'Navegador', answered: 'contestadas', flagged: 'marcadas',
    current: 'Actual', answeredLegend: 'Contestada', pending: 'Pendiente', finish: 'Finalizar sesión', questions: 'Preguntas', question: 'Pregunta', of: 'de',
    highlight: 'Resaltar', highlightHelp: 'Selecciona texto del enunciado y presiona para resaltar', marked: 'Marcada', flag: 'Marcar', previous: 'Anterior', next: 'Siguiente',
    registered: 'Respuesta registrada', unanswered: 'Sin respuesta', remainingTime: 'Tiempo restante', reviewFinish: 'Revisar y finalizar', exit: '¿Deseas salir? El intento actual se perderá.',
    finishTitle: '¿Finalizar la sesión?', completed: 'Has contestado', remain: 'Quedan', remainSuffix: 'sin contestar.', continue: 'Continuar revisando', submit: 'Entregar respuestas',
  },
  en: {
    exam: 'Partial Exam', subtitle: 'Modules 1–9 · Life, Health, and Accident', navigator: 'Navigator', answered: 'answered', flagged: 'flagged',
    current: 'Current', answeredLegend: 'Answered', pending: 'Pending', finish: 'Finish exam', questions: 'Questions', question: 'Question', of: 'of',
    highlight: 'Highlight', highlightHelp: 'Select text in the question, then press to highlight it', marked: 'Flagged', flag: 'Flag', previous: 'Previous', next: 'Next',
    registered: 'Answer recorded', unanswered: 'Unanswered', remainingTime: 'Time remaining', reviewFinish: 'Review and finish', exit: 'Leave the exam? Your current attempt will be lost.',
    finishTitle: 'Finish the exam?', completed: 'You answered', remain: '', remainSuffix: 'remain unanswered.', continue: 'Continue reviewing', submit: 'Submit answers',
  },
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
  const [sessionKind, setSessionKind] = useState<SessionKind>('practice');
  const [partialExamRoute] = useState(isPartialExamRoute);
  const [studentName, setStudentName] = useState('');
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [examLanguage, setExamLanguage] = useState<ExamLanguage>(initialExamLanguage);
  const [scheduledRoute] = useState(isScheduledExamRoute);
  const [scheduledPreview] = useState(isScheduledPreview);
  const [scheduledRetakeAccess] = useState(getScheduledRetakeAccess);
  const [registration, setRegistration] = useState<ScheduledRegistration | null>(() => {
    if (!isScheduledExamRoute()) return null;
    const saved = loadRegistration();
    return isRetakeAccessActive(scheduledRetakeAccess)
      ? prepareRetakeRegistration(saved, scheduledRetakeAccess?.studentName, scheduledRetakeAccess?.requiresRegistrationDetails)
      : saved;
  });
  const [editingRegistration, setEditingRegistration] = useState<ScheduledRegistration | null>(null);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [reportStatus, setReportStatus] = useState<'sending' | 'sent' | 'queued' | null>(null);
  const reportedSessionRef = useRef<number | null>(null);

  const isTimedExam = sessionKind === 'partial-exam';
  const partialExamPool = useMemo(() => loaded.questions.filter(isPartialExamQuestion), []);
  const examDurationSeconds = (session?.length ?? 0) * PARTIAL_EXAM_SECONDS_PER_QUESTION;
  const timedExamCopy = examCopy[examLanguage];
  const scheduledPoolByLines = useMemo(() => ({
    both: scheduledLoaded.questions.filter((question) => matchesExamLines(question, 'both')),
    life: scheduledLoaded.questions.filter((question) => matchesExamLines(question, 'life')),
    health: scheduledLoaded.questions.filter((question) => matchesExamLines(question, 'health')),
  }), []);
  const isScheduledSession = scheduledRoute && isTimedExam && Boolean(registration);

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

  useEffect(() => {
    if (!isTimedExam || !session || examDurationSeconds === 0 || elapsedSeconds < examDurationSeconds || index >= session.length) return;
    setAutoSubmitted(true);
    setIndex(session.length);
  }, [elapsedSeconds, examDurationSeconds, index, isTimedExam, session]);

  useEffect(() => {
    if (!isTimedExam || !session || index >= session.length) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [index, isTimedExam, session]);

  useEffect(() => {
    if (scheduledRoute) void flushPendingEvents();
  }, [scheduledRoute]);

  useEffect(() => {
    if (!isScheduledSession || !session || index >= session.length) return;
    const countTabSwitch = () => { if (document.visibilityState === 'hidden') setTabSwitches((current) => current + 1); };
    document.addEventListener('visibilitychange', countTabSwitch);
    return () => document.removeEventListener('visibilitychange', countTabSwitch);
  }, [index, isScheduledSession, session]);

  useEffect(() => {
    if (!isScheduledSession || !registration || !session || startedAt === null || index < session.length || reportedSessionRef.current === startedAt) return;
    reportedSessionRef.current = startedAt;
    const report = buildExamReport({ registration, questions: session, answers, elapsedSeconds, autoSubmitted, startedAt, tabSwitches, preview: scheduledPreview });
    const submitted = { ...registration, submittedAt: Date.now() };
    saveRegistration(submitted);
    setRegistration(submitted);
    setReportStatus('sending');
    void sendEvent(report).then((sent) => setReportStatus(sent ? 'sent' : 'queued'));
  }, [answers, autoSubmitted, elapsedSeconds, index, isScheduledSession, registration, scheduledPreview, session, startedAt, tabSwitches]);

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
    if (partialExamRoute) return;
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
  }, [partialExamRoute]);

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
    setSessionKind('practice');
    setAutoSubmitted(false);
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

  const startSession = (questions: SessionQuestion[], kind: SessionKind = 'practice') => {
    setSession(questions);
    setSessionKind(kind);
    setAnswers({});
    setIndex(0);
    setStartedAt(Date.now());
    setElapsedSeconds(0);
    setAutoSubmitted(false);
    resetSessionTools();
  };

  const recordAnswer = (question: SessionQuestion, option: string) => {
    if (answers[question.id] && !isTimedExam) return;
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
    if (scheduledRoute) {
      return (
        <ScheduledExamScreen
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode((value) => !value)}
          registration={registration}
          initialValues={editingRegistration}
          availableByLines={{ both: scheduledPoolByLines.both.length, life: scheduledPoolByLines.life.length, health: scheduledPoolByLines.health.length }}
          preview={scheduledPreview}
          retakeAccess={scheduledRetakeAccess}
          onRegister={(details) => {
            if (scheduledRetakeAccess && !isRetakeAccessActive(scheduledRetakeAccess)) return;
            const next: ScheduledRegistration = { ...details, id: editingRegistration?.id ?? newRegistrationId(), registeredAt: Date.now(), attempts: editingRegistration?.attempts ?? 0 };
            saveRegistration(next);
            setRegistration(next);
            setEditingRegistration(null);
            void sendEvent({ type: 'registered', registrationId: next.id, preview: scheduledPreview, name: next.name, email: next.email, slotId: next.slotId, language: next.language, lines: next.lines });
          }}
          onEdit={() => { setEditingRegistration(registration); setRegistration(null); }}
          onStart={() => {
            if (!registration || (scheduledRetakeAccess && !isRetakeAccessActive(scheduledRetakeAccess))) return;
            const started = { ...registration, attempts: registration.attempts + 1 };
            saveRegistration(started);
            setRegistration(started);
            setStudentName(started.name);
            setExamLanguage(started.language);
            setShowImmediate(false);
            setUseTimer(true);
            setTabSwitches(0);
            setReportStatus(null);
            startSession(buildScheduledExamSession(scheduledLoaded.questions, started.lines, started.language), 'partial-exam');
            void sendEvent({ type: 'started', registrationId: started.id, preview: scheduledPreview, attempt: started.attempts });
          }}
        />
      );
    }

    if (partialExamRoute) {
      return (
        <PartialExamLanding
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode((value) => !value)}
          availableQuestions={partialExamPool.length}
          studentName={studentName}
          setStudentName={setStudentName}
          language={examLanguage}
          onLanguageChange={(language) => {
            setExamLanguage(language);
            const url = new URL(window.location.href);
            if (language === 'en') url.searchParams.set('lang', 'en');
            else url.searchParams.delete('lang');
            window.history.replaceState({}, '', url);
          }}
          onStart={() => {
            setShowImmediate(false);
            setUseTimer(true);
            startSession(buildPartialExamSession(partialExamPool, 75, examLanguage), 'partial-exam');
          }}
        />
      );
    }

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
        onRetryMissed={() => startSession(session.filter((question) => answers[question.id] !== question.correctAnswer), 'practice')}
        onNew={() => { setSession(null); setSessionKind('practice'); resetSessionTools(); }}
        onHome={goHome}
        mode={sessionKind}
        studentName={studentName}
        autoSubmitted={autoSubmitted}
        language={examLanguage}
        notice={isScheduledSession && reportStatus ? {
          sending: examLanguage === 'en' ? 'Sending your results to your instructor…' : 'Enviando tus resultados a tu instructor…',
          sent: examLanguage === 'en' ? 'Your results were sent to your instructor.' : 'Tus resultados fueron enviados a tu instructor.',
          queued: examLanguage === 'en' ? 'We could not send your results yet. Keep this page open or reopen it later on this device to retry.' : 'Aún no pudimos enviar tus resultados. Mantén esta página abierta o vuelve a abrirla en este dispositivo para reintentar.',
        }[reportStatus] : undefined}
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
        language={isTimedExam || partialExamRoute || scheduledRoute ? examLanguage : 'es'}
        center={<div className="exam-title"><span>{isScheduledSession ? (examLanguage === 'en' ? 'Scheduled Exam' : 'Examen Programado') : isTimedExam ? timedExamCopy.exam : activeTopicLabel ? 'Práctica por módulo' : 'Práctica personalizada'}</span><strong>{isScheduledSession && registration ? linesSubtitle(registration.lines, examLanguage) : isTimedExam ? timedExamCopy.subtitle : activeTopicLabel || (scope === 'state' && stateSpecificAvailable ? `${stateName} · Life, Health & Accident` : 'Life, Health & Accident · Conceptos generales')}</strong></div>}
        onHome={() => { if (!isTimedExam || confirm(timedExamCopy.exit)) goHome(); }}
      />
      <div className="progress-strip"><span style={{ width: `${completion}%` }} /></div>

      <main className="exam-main" id="main-content">
        {showNavigator && <button className="navigator-backdrop" onClick={() => setShowNavigator(false)} aria-label="Cerrar navegador" />}
        <aside className={`navigator ${showNavigator ? 'open' : ''}`}>
          <div className="navigator-head">
            <div><LayoutGrid size={18} /><strong>{isTimedExam ? timedExamCopy.navigator : 'Navegador'}</strong></div>
            <button className="icon-button mobile-only" onClick={() => setShowNavigator(false)} aria-label="Cerrar navegador"><X size={18} /></button>
          </div>
          <div className="nav-summary"><span><strong>{answeredCount}</strong> {isTimedExam ? timedExamCopy.answered : 'contestadas'}</span><span><strong>{flaggedIds.length}</strong> {isTimedExam ? timedExamCopy.flagged : 'marcadas'}</span></div>
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
          <div className="legend"><span><i className="dot current" /> {isTimedExam ? timedExamCopy.current : 'Actual'}</span><span><i className="dot answered" /> {isTimedExam ? timedExamCopy.answeredLegend : 'Contestada'}</span><span><i className="dot" /> {isTimedExam ? timedExamCopy.pending : 'Pendiente'}</span></div>
          <button className="submit-side" onClick={() => setShowFinish(true)}>{isTimedExam ? timedExamCopy.finish : 'Finalizar sesión'}</button>
        </aside>

        <section className="question-workspace">
          <div className="question-toolbar">
            <button className="navigator-trigger" onClick={() => setShowNavigator(true)}><LayoutGrid size={17} /> {isTimedExam ? timedExamCopy.questions : 'Preguntas'}</button>
            <span className="question-position">{isTimedExam ? timedExamCopy.question : 'Pregunta'} <strong>{index + 1}</strong> {isTimedExam ? timedExamCopy.of : 'de'} {session.length}</span>
            <div className="question-tools">
              <button className={questionHighlights.length ? 'active' : ''} onClick={() => toggleHighlight(question)} title={isTimedExam ? timedExamCopy.highlightHelp : 'Selecciona texto del enunciado y presiona para resaltar'}><Highlighter size={17} /><span>{isTimedExam ? timedExamCopy.highlight : 'Resaltar'}</span></button>
              <button className={isFlagged ? 'active warning' : ''} onClick={() => setFlaggedIds((current) => isFlagged ? current.filter((id) => id !== question.id) : [...current, question.id])}><Flag size={17} fill={isFlagged ? 'currentColor' : 'none'} /><span>{isTimedExam ? isFlagged ? timedExamCopy.marked : timedExamCopy.flag : isFlagged ? 'Marcada' : 'Marcar'}</span></button>
            </div>
          </div>

          <QuestionCard
            q={question}
            selected={selectedAnswer}
            onSelect={(option) => recordAnswer(question, option)}
            showFeedback={!isTimedExam && showImmediate && Boolean(selectedAnswer)}
            struckOptions={strikeouts[question.id] ?? []}
            onToggleStrike={(option) => setStrikeouts((current) => {
              const existing = current[question.id] ?? [];
              return { ...current, [question.id]: existing.includes(option) ? existing.filter((item) => item !== option) : [...existing, option] };
            })}
            highlights={questionHighlights}
            lockAfterSelection={!isTimedExam}
            language={isTimedExam || partialExamRoute || scheduledRoute ? examLanguage : 'es'}
            domainLabel={isTimedExam ? getPartialExamDomain(question, examLanguage)?.label : undefined}
          />

          <footer className="exam-footer">
            <button className="secondary" disabled={index === 0} onClick={() => setIndex((current) => current - 1)}><ArrowLeft size={18} /> {isTimedExam ? timedExamCopy.previous : 'Anterior'}</button>
            <span className={isTimedExam && examDurationSeconds - elapsedSeconds <= 300 ? 'timer-warning' : ''}>{selectedAnswer ? isTimedExam ? timedExamCopy.registered : 'Respuesta registrada' : isTimedExam ? timedExamCopy.unanswered : 'Sin respuesta'}{useTimer && <> · <AlarmClock size={12} /> {isTimedExam ? `${timedExamCopy.remainingTime} ` : ''}{formatTime(isTimedExam ? Math.max(0, examDurationSeconds - elapsedSeconds) : elapsedSeconds)}</>}</span>
            {index < session.length - 1
              ? <button className="primary" onClick={() => setIndex((current) => current + 1)}>{isTimedExam ? timedExamCopy.next : 'Siguiente'} <ArrowRight size={18} /></button>
              : <button className="primary" onClick={() => setShowFinish(true)}>{isTimedExam ? timedExamCopy.reviewFinish : 'Revisar y finalizar'}</button>}
          </footer>
        </section>
      </main>

      {showFinish && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowFinish(false); }}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="finish-title">
            <div className="modal-icon"><ListChecks size={23} /></div>
            <h2 id="finish-title">{isTimedExam ? timedExamCopy.finishTitle : '¿Finalizar la sesión?'}</h2>
            <p>{isTimedExam ? timedExamCopy.completed : 'Has contestado'} <strong>{answeredCount} {isTimedExam ? timedExamCopy.of : 'de'} {session.length}</strong> {examLanguage === 'en' && isTimedExam ? 'questions.' : 'preguntas.'} {session.length - answeredCount > 0 && `${isTimedExam ? timedExamCopy.remain : 'Quedan'} ${session.length - answeredCount} ${isTimedExam ? timedExamCopy.remainSuffix : 'sin contestar.'}`}</p>
            <div className="modal-stats"><span><CheckCircle2 size={17} /> {answeredCount} {isTimedExam ? timedExamCopy.answered : 'contestadas'}</span><span><Flag size={17} /> {flaggedIds.length} {isTimedExam ? timedExamCopy.flagged : 'marcadas'}</span></div>
            <div className="modal-actions"><button className="secondary" onClick={() => setShowFinish(false)}>{isTimedExam ? timedExamCopy.continue : 'Continuar revisando'}</button><button className="primary" onClick={() => { setShowFinish(false); setIndex(session.length); }}>{isTimedExam ? timedExamCopy.submit : 'Entregar respuestas'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
