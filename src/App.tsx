import { useMemo, useState } from 'react';
import { loadQuestions } from './data/loadQuestions';
import { shuffleArray } from './utils/shuffle';
import { clearProgress, getProgress, saveProgress } from './utils/storage';
import { SetupScreen } from './components/SetupScreen';
import { QuestionCard } from './components/QuestionCard';
import { ResultsScreen } from './components/ResultsScreen';
import type { SessionQuestion } from './types/question';

const loaded = loadQuestions();

export default function App() {
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

  if (!session) {
    return <div className='min-h-screen py-8'>
      <SetupScreen questions={loaded.questions} selectedDomains={domains} setSelectedDomains={setDomains} selectedDifficulties={difficulties} setSelectedDifficulties={setDifficulties} skipAnswered={skipAnswered} setSkipAnswered={setSkipAnswered} showAtEnd={showAtEnd} setShowAtEnd={setShowAtEnd} count={count} setCount={setCount} availableCount={filtered.length} message={message} onStart={() => {
        if (filtered.length === 0) return setMessage('No hay preguntas disponibles con los filtros seleccionados.');
        if (count > filtered.length) return setMessage(`Solo hay ${filtered.length} preguntas disponibles.`);
        const picked = shuffleArray(filtered).slice(0, count).map((q) => ({ ...q, shuffledOptions: shuffleArray(q.options) }));
        setSession(picked); setAnswers({}); setIndex(0); setMessage(undefined);
      }} />
      <div className='max-w-3xl mx-auto px-4'><button className='text-sm underline' onClick={()=>{ if (confirm('¿Seguro que deseas reiniciar progreso?')) clearProgress(); }}>Reiniciar progreso</button></div>
    </div>;
  }

  if (index >= session.length) {
    return <ResultsScreen questions={session} answers={answers} onRetryMissed={() => { const missed = session.filter((q)=>answers[q.id]!==q.correctAnswer); setSession(missed); setAnswers({}); setIndex(0);} } onNew={() => setSession(null)} />;
  }

  const q = session[index];
  const selected = answers[q.id];
  const showFeedback = !showAtEnd && Boolean(selected);
  const completion = Math.round((index / session.length) * 100);

  return <div className='max-w-3xl mx-auto p-4 sm:p-6 space-y-4'>
    <div className='bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 space-y-3'>
      <div className='flex items-center justify-between gap-3 text-sm sm:text-base font-medium text-slate-700'>
        <p>Pregunta {index + 1} de {session.length}</p>
        <p>{completion}% completado</p>
      </div>
      <div className='h-3 w-full rounded-full bg-slate-100 overflow-hidden'>
        <div
          className='h-full rounded-full bg-blue-600 transition-all duration-500 ease-out'
          style={{ width: `${completion}%` }}
        />
      </div>
    </div>

    <QuestionCard q={q} index={index} total={session.length} selected={selected} onSelect={(o)=>setAnswers((a)=>(a[q.id]?a:{...a,[q.id]:o}))} showFeedback={showFeedback} showAtEnd={showAtEnd} correct={selected===q.correctAnswer} />
    <div className='flex justify-between gap-3'>
      <button onClick={()=>setIndex((i)=>Math.max(0,i-1))} className='border border-slate-300 bg-white hover:bg-slate-50 rounded-xl px-4 py-2.5 text-sm sm:text-base min-h-11'>Anterior</button>
      <button onClick={()=>{const p=getProgress(); const isCorrect=answers[q.id]===q.correctAnswer; p.answeredIds=[...new Set([...p.answeredIds,q.id])]; if (isCorrect) p.correctIds=[...new Set([...p.correctIds,q.id])]; else p.incorrectIds=[...new Set([...p.incorrectIds,q.id])]; p.attempts[q.id]=(p.attempts[q.id]||0)+1; saveProgress(p); setIndex((i)=>i+1);}} className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 text-sm sm:text-base min-h-11'>{index===session.length-1?'Terminar sesión':'Siguiente'}</button>
    </div>
  </div>;
}
