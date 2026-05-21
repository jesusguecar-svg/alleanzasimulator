import type { SessionQuestion } from '../types/question';

export function ResultsScreen({ questions, answers, onRetryMissed, onNew }: {questions: SessionQuestion[]; answers: Record<string,string>; onRetryMissed: ()=>void; onNew: ()=>void;}) {
  const correct = questions.filter((q)=>answers[q.id]===q.correctAnswer);
  const incorrect = questions.filter((q)=>answers[q.id]!==q.correctAnswer);
  const percent = Math.round((correct.length / questions.length) * 100) || 0;
  return <div className="max-w-3xl mx-auto p-4 space-y-4">
    <div className="bg-white rounded-lg shadow p-4"><h2 className="text-xl font-bold">Resultado</h2><p>{correct.length}/{questions.length} ({percent}%)</p><p>Preguntas correctas: {correct.length}</p><p>Preguntas incorrectas: {incorrect.length}</p></div>
    <div className="bg-white rounded-lg shadow p-4"><h3 className="font-semibold">Revisar errores</h3>{incorrect.length===0?<p>¡Sin errores!</p>:incorrect.map((q)=><div key={q.id} className="border-t pt-2 mt-2"><p className="font-medium">{q.question}</p><p className="text-sm">Tu respuesta: {answers[q.id] || 'Sin responder'}</p><p className="text-sm">Respuesta correcta: {q.correctAnswer}</p>{q.explanation && <p className="text-sm">Explicación: {q.explanation}</p>}</div>)}</div>
    <div className="flex gap-2"><button onClick={onRetryMissed} className="bg-amber-600 text-white rounded px-3 py-2">Reintentar preguntas falladas</button><button onClick={onNew} className="bg-blue-600 text-white rounded px-3 py-2">Nueva sesión</button></div>
  </div>;
}
