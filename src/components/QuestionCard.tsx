import type { SessionQuestion } from '../types/question';

type Props = { q: SessionQuestion; index: number; total: number; selected?: string; onSelect: (o: string)=>void; showFeedback: boolean; showAtEnd: boolean; correct?: boolean };

export function QuestionCard({ q, index, total, selected, onSelect, showFeedback, showAtEnd, correct }: Props) {
  const isLocked = Boolean(selected);

  return <div className="bg-white rounded-lg shadow p-4 space-y-3">
    <p className="text-sm text-slate-600">Pregunta {index + 1} de {total}</p>
    <h2 className="font-medium">{q.question}</h2>
    <div className="space-y-2">
      {q.shuffledOptions.map((o)=><button key={o} disabled={isLocked} onClick={()=>onSelect(o)} className={`block w-full text-left border rounded px-3 py-2 ${selected===o?'border-blue-500 bg-blue-50':'border-slate-200'} ${showFeedback && o===q.correctAnswer?'bg-green-100 border-green-500':''} ${showFeedback && selected===o && selected!==q.correctAnswer?'bg-red-100 border-red-400':''} ${isLocked?'cursor-not-allowed opacity-95':''}`}>{o}</button>)}
    </div>
    {showFeedback && !showAtEnd && <div className="text-sm space-y-2">
      <p className={correct?'text-green-700':'text-red-700'}>{correct ? 'Respuesta correcta' : 'Respuesta incorrecta'}</p>
      {q.explanation && <p><b>Por qué la correcta es correcta:</b> {q.explanation}</p>}
      {selected && selected !== q.correctAnswer && q.optionExplanations?.[selected] && <p><b>Por qué tu respuesta es incorrecta:</b> {q.optionExplanations[selected]}</p>}
      {q.optionExplanations && Object.entries(q.optionExplanations).length > 0 && <div><p className="font-semibold">Por qué las opciones incorrectas son incorrectas:</p><ul className="list-disc ml-5">{Object.entries(q.optionExplanations).map(([option, explanation]) => <li key={option}><b>{option}:</b> {explanation}</li>)}</ul></div>}
    </div>}
  </div>;
}
