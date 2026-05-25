import type { SessionQuestion } from '../types/question';

type Props = { q: SessionQuestion; index: number; total: number; selected?: string; onSelect: (o: string)=>void; showFeedback: boolean; showAtEnd: boolean; correct?: boolean };

export function QuestionCard({ q, index, total, selected, onSelect, showFeedback, showAtEnd, correct }: Props) {
  const isLocked = Boolean(selected);
  const shouldShowPerOptionFeedback = showFeedback || showAtEnd;

  return <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
    <p className="text-sm sm:text-base text-slate-600 font-medium">Pregunta {index + 1} de {total}</p>
    <h2 className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">{q.question}</h2>

    <div className="space-y-3">
      {q.shuffledOptions.map((o) => {
        const isCorrectOption = shouldShowPerOptionFeedback && o === q.correctAnswer;
        const isWrongSelected = shouldShowPerOptionFeedback && selected === o && selected !== q.correctAnswer;
        const optionExplanation = o === q.correctAnswer
          ? (q.explanation || 'Esta es la opción correcta para esta pregunta.')
          : (q.optionExplanations?.[o] || 'Esta opción no es correcta para esta pregunta.');

        return (
          <div key={o} className="space-y-2">
            <button
              disabled={isLocked}
              onClick={() => onSelect(o)}
              className={[
                'block w-full text-left rounded-2xl border px-4 py-3.5 sm:px-5 sm:py-4 text-sm sm:text-base transition-all duration-200 min-h-12',
                'focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200',
                selected === o ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-slate-50',
                isCorrectOption ? 'bg-green-100 border-green-500 text-green-900' : '',
                isWrongSelected ? 'bg-red-100 border-red-500 text-red-900' : '',
                isLocked ? 'cursor-not-allowed opacity-95' : 'active:scale-[0.99]'
              ].join(' ')}
            >
              {o}
            </button>

            {shouldShowPerOptionFeedback && <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-3 space-y-1">
              <p className={`text-xs sm:text-sm font-semibold ${o === q.correctAnswer ? 'text-green-700' : 'text-red-700'}`}>
                {o === q.correctAnswer ? '✅ Correcta' : '❌ Incorrecta'}
              </p>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{optionExplanation}</p>
            </div>}
          </div>
        );
      })}
    </div>

    {showFeedback && !showAtEnd && <div className="text-sm sm:text-base space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <p className={correct ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>{correct ? '✅ Respuesta correcta' : '❌ Respuesta incorrecta'}</p>
      {q.explanation && <p><b>Por qué la correcta es correcta:</b> {q.explanation}</p>}
      {selected && selected !== q.correctAnswer && q.optionExplanations?.[selected] && <p><b>Por qué tu respuesta es incorrecta:</b> {q.optionExplanations[selected]}</p>}
      {q.optionExplanations && Object.entries(q.optionExplanations).length > 0 && <div><p className="font-semibold">Por qué las opciones incorrectas son incorrectas:</p><ul className="list-disc ml-5 space-y-1">{Object.entries(q.optionExplanations).map(([option, explanation]) => <li key={option}><b>{option}:</b> {explanation}</li>)}</ul></div>}
    </div>}
  </div>;
}
