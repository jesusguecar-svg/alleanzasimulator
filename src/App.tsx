import { useEffect, useMemo, useState } from 'react';
import { loadQuestions } from './data/loadQuestions';
import { shuffleArray } from './utils/shuffle';
import { clearProgress, getProgress, saveProgress } from './utils/storage';
import { SetupScreen } from './components/SetupScreen';
import { QuestionCard } from './components/QuestionCard';
import { ResultsScreen } from './components/ResultsScreen';
import { NavigationButtons } from './components/NavigationButtons';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { SessionQuestion } from './types/question';

const loaded = loadQuestions();

function AppContent() {
  const [domains, setDomains] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>(['easy', 'medium', 'hard']);
  const [skipAnswered, setSkipAnswered] = useState(false);
  const [showAtEnd, setShowAtEnd] = useState(false);
  const [count, setCount] = useState(25);
  const [session, setSession] = useState<SessionQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string>();

  const filtered = useMemo(() => {
    const p = getProgress();
    return loaded.questions.filter((q) => (domains.length ? domains.includes(q.domain) : true) && difficulties.includes(q.difficulty) && (!skipAnswered || !p.answeredIds.includes(q.id)));
  }, [domains, difficulties, skipAnswered]);

  // Keyboard navigation
  useEffect(() => {
    if (!session) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextQuestion();
      } else if (e.key >= '1' && e.key <= '4' && index < session.length) {
        const q = session[index];
        const optionIndex = parseInt(e.key) - 1;
        if (optionIndex < q.shuffledOptions.length) {
          setAnswers((a) => ({ ...a, [q.id]: q.shuffledOptions[optionIndex] }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session, index]);

  const handleNextQuestion = () => {
    const q = session![index];
    const p = getProgress();
    const isCorrect = answers[q.id] === q.correctAnswer;
    p.answeredIds = [...new Set([...p.answeredIds, q.id])];
    if (isCorrect) p.correctIds = [...new Set([...p.correctIds, q.id])];
    else p.incorrectIds = [...new Set([...p.incorrectIds, q.id])];
    p.attempts[q.id] = (p.attempts[q.id] || 0) + 1;
    saveProgress(p);
    setIndex((i) => i + 1);
  };

  if (!session) {
    return <div className='min-h-screen py-6 sm:py-8'>
      <SetupScreen questions={loaded.questions} selectedDomains={domains} setSelectedDomains={setDomains} selectedDifficulties={difficulties} setSelectedDifficulties={setDifficulties} skipAnswered={skipAnswered} setSkipAnswered={setSkipAnswered} showAtEnd={showAtEnd} setShowAtEnd={setShowAtEnd} count={count} setCount={setCount} availableCount={filtered.length} message={message} onStart={() => {
        if (filtered.length === 0) return setMessage('No hay preguntas disponibles con los filtros seleccionados.');
        if (count > filtered.length) return setMessage(`Solo hay ${filtered.length} preguntas disponibles.`);
        const picked = shuffleArray(filtered).slice(0, count).map((q) => ({ ...q, shuffledOptions: shuffleArray(q.options) }));
        setSession(picked); setAnswers({}); setIndex(0); setMessage(undefined);
      }} />
      <div className='max-w-3xl mx-auto px-4 mt-6 sm:mt-8'><button aria-label="Reiniciar progreso guardado" className='text-sm underline text-slate-600 hover:text-slate-900 transition-colors' onClick={()=>{ if (confirm('¿Seguro que deseas reiniciar progreso?')) clearProgress(); }}>Reiniciar progreso</button></div>
    </div>;
  }

  if (index >= session.length) {
    return <ResultsScreen questions={session} answers={answers} onRetryMissed={() => { const missed = session.filter((q)=>answers[q.id]!==q.correctAnswer); setSession(missed); setAnswers({}); setIndex(0);} } onNew={() => setSession(null)} />;
  }

  const q = session[index];
  const selected = answers[q.id];
  const showFeedback = !showAtEnd && Boolean(selected);

  return <div className='max-w-3xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 pb-20 sm:pb-6'>
    <QuestionCard q={q} index={index} total={session.length} selected={selected} onSelect={(o)=>setAnswers((a)=>({...a,[q.id]:o}))} showFeedback={showFeedback} showAtEnd={showAtEnd} correct={selected===q.correctAnswer} />
    <NavigationButtons isFirst={index === 0} isLast={index === session.length - 1} onPrevious={() => setIndex((i) => Math.max(0, i - 1))} onNext={handleNextQuestion} />
  </div>;
}

export default function App() {
  return <ErrorBoundary><AppContent /></ErrorBoundary>;
}
