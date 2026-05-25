import { useState } from 'react';
import type { SessionQuestion } from '../types/question';

export function ResultsScreen({ questions, answers, onRetryMissed, onNew }: {questions: SessionQuestion[]; answers: Record<string,string>; onRetryMissed: ()=>void; onNew: ()=>void;}) {
  const correct = questions.filter((q)=>answers[q.id]===q.correctAnswer);
  const incorrect = questions.filter((q)=>answers[q.id]!==q.correctAnswer);
  const percent = Math.round((correct.length / questions.length) * 100) || 0;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-3">Resultado</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-3xl sm:text-4xl font-bold text-blue-600">{percent}%</p>
          <p className="text-xs sm:text-sm text-slate-600">{correct.length}/{questions.length} preguntas</p>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-green-700">✓ Correctas:</span>
            <span className="font-bold text-green-900">{correct.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-700">✗ Incorrectas:</span>
            <span className="font-bold text-red-900">{incorrect.length}</span>
          </div>
        </div>
      </div>
    </div>

    {incorrect.length > 0 && (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 sm:p-6 border-b bg-slate-50">
          <h3 className="font-semibold text-lg">Revisar errores ({incorrect.length})</h3>
        </div>
        <div className="divide-y">
          {incorrect.map((q) => (
            <div key={q.id} className="hover:bg-slate-50 transition-colors">
              <button
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                aria-expanded={expandedId === q.id}
                className="w-full text-left p-4 sm:p-6 block hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm sm:text-base">{q.question}</p>
                    <p className="text-xs sm:text-sm text-red-700 mt-1">Tu respuesta: {answers[q.id] || 'Sin responder'}</p>
                  </div>
                  <span className="text-slate-400 mt-1">{expandedId === q.id ? '▼' : '▶'}</span>
                </div>
              </button>
              {expandedId === q.id && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 bg-slate-50 space-y-2 text-sm">
                  <div className="border-l-4 border-red-400 pl-3 py-2">
                    <p className="text-slate-600">Tu respuesta:</p>
                    <p className="font-medium text-red-700">{answers[q.id] || 'Sin responder'}</p>
                  </div>
                  <div className="border-l-4 border-green-400 pl-3 py-2">
                    <p className="text-slate-600">Respuesta correcta:</p>
                    <p className="font-medium text-green-700">{q.correctAnswer}</p>
                  </div>
                  {q.explanation && (
                    <div className="border-l-4 border-blue-400 pl-3 py-2 mt-3">
                      <p className="text-slate-600 font-medium mb-1">Explicación:</p>
                      <p className="text-slate-700">{q.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {incorrect.length === 0 && (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <p className="text-xl font-bold text-green-900">¡Sin errores!</p>
        <p className="text-sm text-green-700 mt-2">Excelente trabajo en esta sesión.</p>
      </div>
    )}

    <div className="flex gap-2 sm:gap-4">
      {incorrect.length > 0 && (
        <button
          onClick={onRetryMissed}
          className="flex-1 bg-amber-600 text-white rounded px-3 sm:px-4 py-2 sm:py-3 hover:bg-amber-700 transition-colors font-medium text-sm sm:text-base"
        >
          Reintentar errores ({incorrect.length})
        </button>
      )}
      <button
        onClick={onNew}
        className="flex-1 bg-blue-600 text-white rounded px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
      >
        Nueva sesión
      </button>
    </div>
  </div>;
}
