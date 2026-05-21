import type { SessionQuestion } from '../types/question';

type Props = { q: SessionQuestion; index: number; total: number; selected?: string; onSelect: (o: string)=>void; showFeedback: boolean; showAtEnd: boolean; correct?: boolean };

export function QuestionCard({ q, index, total, selected, onSelect, showFeedback, showAtEnd, correct }: Props) {
  return <div className="bg-white rounded-lg shadow p-4 space-y-3">
    <p className="text-sm text-slate-600">Pregunta {index + 1} de {total}</p>
    <h2 className="font-medium">{q.question}</h2>
    <div className="space-y-2">{q.shuffledOptions.map((o)=><button key={o} onClick={()=>onSelect(o)} className={`block w-full text-left border rounded px-3 py-2 ${selected===o?'border-blue-500 bg-blue-50':'border-slate-200'} ${showFeedback && o===q.correctAnswer?'bg-green-100 border-green-500':''} ${showFeedback && selected===o && selected!==q.correctAnswer?'bg-red-100 border-red-400':''}`}>{o}</button>)}</div>
    {showFeedback && !showAtEnd && <div className="text-sm"><p className={correct?'text-green-700':'text-red-700'}>{correct ? 'Respuesta correcta' : 'Respuesta incorrecta'}</p>{q.explanation && <p><b>Explicación:</b> {q.explanation}</p>}</div>}
  </div>;
}
