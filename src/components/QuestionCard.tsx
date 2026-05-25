import type { SessionQuestion } from '../types/question';

type Props = { q: SessionQuestion; index: number; total: number; selected?: string; onSelect: (o: string)=>void; showFeedback: boolean; showAtEnd: boolean; correct?: boolean };

export function QuestionCard({ q, index, total, selected, onSelect, showFeedback, showAtEnd }: Props) {
  const isLocked = Boolean(selected);
  const shouldShowPerOptionFeedback = showFeedback || showAtEnd;

  return <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6 space-y-4">
    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">Pregunta {index + 1} de {total}</p>
    <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">{q.question}</h2>

    <div className="space-y-3">
      {q.shuffledOptions.map((o)=><div key={o} className="space-y-2"><button disabled={isLocked} onClick={()=>onSelect(o)} className={`block w-full text-left rounded-2xl border px-4 py-3.5 sm:px-5 sm:py-4 text-sm sm:text-base transition-all duration-200 min-h-12 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 ${selected===o?'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100':'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800'} ${shouldShowPerOptionFeedback && o===q.correctAnswer?'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-900 dark:text-green-100':''} ${shouldShowPerOptionFeedback && selected===o && selected!==q.correctAnswer?'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-900 dark:text-red-100':''} ${isLocked?'cursor-not-allowed opacity-95':'active:scale-[0.99]'}`}>{o}</button>
        {shouldShowPerOptionFeedback && <div className="px-2 sm:px-3 pb-1">
          <p className={`text-xs sm:text-sm font-semibold ${o===q.correctAnswer?'text-green-700 dark:text-green-300':'text-red-700 dark:text-red-300'}`}>{o===q.correctAnswer?'✅ Respuesta correcta':'❌ Respuesta incorrecta'}</p>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{o===q.correctAnswer?(q.explanation || 'Esta es la respuesta correcta.'):(q.optionExplanations?.[o] || 'Esta opción no es correcta para esta pregunta.')}</p>
        </div>}
      </div>)}
    </div>
  </div>;
}
