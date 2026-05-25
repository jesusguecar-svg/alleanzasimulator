import type { SessionQuestion } from '../types/question';

type Props = { q: SessionQuestion; index: number; total: number; selected?: string; onSelect: (o: string)=>void; showFeedback: boolean; showAtEnd: boolean; correct?: boolean };

export function QuestionCard({ q, index, total, selected, onSelect, showFeedback, showAtEnd, correct }: Props) {
  const progress = Math.round(((index + 1) / total) * 100);
  return <div className="bg-white rounded-lg shadow p-4 space-y-3">
    <div className="space-y-1">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-slate-600">Pregunta {index + 1} de {total}</p>
        <p className="text-xs text-slate-500">{progress}%</p>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
    <h2 className="font-medium text-base sm:text-lg">{q.question}</h2>
    <div className="space-y-2">{q.shuffledOptions.map((o)=><button key={o} onClick={()=>onSelect(o)} role="option" aria-selected={selected===o} aria-label={`Opción: ${o}`} className={`block w-full text-left border rounded px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base transition-colors ${selected===o?'border-blue-500 bg-blue-50':'border-slate-200 hover:border-slate-300'} ${showFeedback && o===q.correctAnswer?'bg-green-100 border-green-500':''} ${showFeedback && selected===o && selected!==q.correctAnswer?'bg-red-100 border-red-400':''}`}>{o}</button>)}</div>
    {showFeedback && !showAtEnd && <div className="text-sm"><p className={correct?'text-green-700 font-medium':'text-red-700 font-medium'}>{correct ? '✓ Respuesta correcta' : '✗ Respuesta incorrecta'}</p>{q.explanation && <p className="mt-2"><b>Explicación:</b> {q.explanation}</p>}</div>}
  </div>;
}
