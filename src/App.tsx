import { useEffect, useMemo, useState } from 'react';
import { loadQuestions } from './data/loadQuestions';
import { shuffleArray } from './utils/shuffle';
import { clearProgress, getDashboardStats, getProgress, saveProgress } from './utils/storage';
import { SetupScreen } from './components/SetupScreen';
import { QuestionCard } from './components/QuestionCard';
import { ResultsScreen } from './components/ResultsScreen';
import { DashboardScreen } from './components/DashboardScreen';
import type { SessionQuestion } from './types/question';

const loaded = loadQuestions();
const THEME_KEY = 'theme';
const TIMER_KEY = 'useTimer';

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

export default function App() {
  const [domains, setDomains] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>(['easy', 'medium', 'hard']);
  const [skipAnswered, setSkipAnswered] = useState(false);
  const [showAtEnd, setShowAtEnd] = useState(false);
  const [useTimer, setUseTimer] = useState(getDefaultUseTimer);
  const [darkMode, setDarkMode] = useState(getDefaultDarkMode);
  const [count, setCount] = useState(25);
  const [session, setSession] = useState<SessionQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string>();
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(TIMER_KEY, String(useTimer));
  }, [useTimer]);

  useEffect(() => {
    if (!useTimer || !session || startedAt === null || index >= session.length) return;
    const id = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [useTimer, session, startedAt, index]);

  void getDashboardStats;

  const filtered = useMemo(() => {
    const p = getProgress();
    return loaded.questions.filter((q) => (domains.length ? domains.includes(q.domain) : true) && difficulties.includes(q.difficulty) && (!skipAnswered || !p.answeredIds.includes(q.id)));
  }, [domains, difficulties, skipAnswered]);

  if (!session) {
    if (showDashboard) {
      return (
        <div className='min-h-screen py-8 bg-slate-50 dark:bg-slate-950'>
          <DashboardScreen
            allQuestions={loaded.questions}
            onBack={() => setShowDashboard(false)}
          />
        </div>
      );
    }
    return <div className='min-h-screen py-8 bg-slate-50 dark:bg-slate-950'>
      <SetupScreen questions={loaded.questions} selectedDomains={domains} setSelectedDomains={setDomains} selectedDifficulties={difficulties} setSelectedDifficulties={setDifficulties} skipAnswered={skipAnswered} setSkipAnswered={setSkipAnswered} showAtEnd={showAtEnd} setShowAtEnd={setShowAtEnd} useTimer={useTimer} setUseTimer={setUseTimer} darkMode={darkMode} setDarkMode={setDarkMode} count={count} setCount={setCount} availableCount={filtered.length} message={message} onShowDashboard={() => setShowDashboard(true)} onResetProgress={() => { if (confirm('¿Seguro que deseas reiniciar progreso?')) clearProgress(); }} onStart={() => {
        if (filtered.length === 0) return setMessage('No hay preguntas disponibles con los filtros seleccionados.');
        if (count > filtered.length) return setMessage(`Solo hay ${filtered.length} preguntas disponibles.`);
        const picked = shuffleArray(filtered).slice(0, count).map((q) => ({ ...q, shuffledOptions: shuffleArray(q.options) }));
        setSession(picked); setAnswers({}); setIndex(0); setMessage(undefined); setStartedAt(Date.now()); setElapsedSeconds(0);
      }} />
    </div>;
  }

  if (index >= session.length) {
    return <div className='min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100'><ResultsScreen questions={session} answers={answers} onRetryMissed={() => { const missed = session.filter((q)=>answers[q.id]!==q.correctAnswer); setSession(missed); setAnswers({}); setIndex(0); setStartedAt(Date.now()); setElapsedSeconds(0);} } onNew={() => setSession(null)} /></div>;
  }

  const q = session[index];
  const selected = answers[q.id];
  const showFeedback = !showAtEnd && Boolean(selected);
  const completion = Math.round((index / session.length) * 100);
  const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const seconds = String(elapsedSeconds % 60).padStart(2, '0');

  return <div className='min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100'>
    <div className='max-w-3xl mx-auto p-4 sm:p-6 space-y-4'>
      <div className='flex justify-end'>
        <button type='button' onClick={() => setDarkMode((v) => !v)} className='rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm'>
          {darkMode ? '🌙 Oscuro' : '🌞 Claro'}
        </button>
      </div>

      <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-5 space-y-3'>
        <div className='flex items-center justify-between gap-3 text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200'>
          <p>Pregunta {index + 1} de {session.length}</p>
          <p>{completion}% completado</p>
        </div>
        <div className='h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden'>
          <div className='h-full rounded-full bg-blue-600 transition-all duration-500 ease-out' style={{ width: `${completion}%` }} />
        </div>
        {useTimer && <p className='text-xs sm:text-sm text-slate-600 dark:text-slate-300'>Tiempo: <span className='font-semibold text-slate-800 dark:text-slate-100'>{minutes}:{seconds}</span></p>}
      </div>

      <QuestionCard q={q} index={index} total={session.length} selected={selected} onSelect={(o)=>setAnswers((a)=>(a[q.id]?a:{...a,[q.id]:o}))} showFeedback={showFeedback} showAtEnd={showAtEnd} correct={selected===q.correctAnswer} />
      <div className='flex justify-between gap-3'>
        <button onClick={()=>setIndex((i)=>Math.max(0,i-1))} className='border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl px-4 py-2.5 text-sm sm:text-base min-h-11'>Anterior</button>
        <button onClick={()=>{const p=getProgress(); const isCorrect=answers[q.id]===q.correctAnswer; p.answeredIds=[...new Set([...p.answeredIds,q.id])]; if (isCorrect) p.correctIds=[...new Set([...p.correctIds,q.id])]; else p.incorrectIds=[...new Set([...p.incorrectIds,q.id])]; p.attempts[q.id]=(p.attempts[q.id]||0)+1; saveProgress(p); setIndex((i)=>i+1);}} className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 text-sm sm:text-base min-h-11'>{index===session.length-1?'Terminar sesión':'Siguiente'}</button>
      </div>
    </div>
  </div>;
}
