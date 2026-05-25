import type { SessionQuestion } from '../types/question';

type Props = {
  questions: SessionQuestion[];
  answers: Record<string, string>;
  onRetryMissed: () => void;
  onNew: () => void;
};

type DomainStats = {
  total: number;
  correct: number;
};

function motivationalMessage(percent: number): string {
  if (percent === 100) return '¡Perfecto! Dominas este bloque. 🔥';
  if (percent >= 85) return '¡Excelente progreso! Estás muy cerca del dominio total. 🚀';
  if (percent >= 70) return '¡Buen trabajo! Reforzar algunos temas te llevará al siguiente nivel. 💪';
  if (percent >= 50) return 'Vas por buen camino. Enfócate en tus áreas débiles para subir rápido. 📈';
  return 'Cada intento cuenta. Practica los errores y verás progreso inmediato. 🌱';
}

function bestStreak(questions: SessionQuestion[], answers: Record<string, string>): number {
  let max = 0;
  let current = 0;

  for (const q of questions) {
    if (answers[q.id] === q.correctAnswer) {
      current += 1;
      max = Math.max(max, current);
    } else {
      current = 0;
    }
  }

  return max;
}

export function ResultsScreen({ questions, answers, onRetryMissed, onNew }: Props) {
  const correct = questions.filter((q) => answers[q.id] === q.correctAnswer);
  const incorrect = questions.filter((q) => answers[q.id] !== q.correctAnswer);
  const percent = Math.round((correct.length / questions.length) * 100) || 0;
  const streak = bestStreak(questions, answers);

  const byDomain = questions.reduce<Record<string, DomainStats>>((acc, q) => {
    const bucket = acc[q.domain] ?? { total: 0, correct: 0 };
    bucket.total += 1;
    if (answers[q.id] === q.correctAnswer) bucket.correct += 1;
    acc[q.domain] = bucket;
    return acc;
  }, {});

  const domainRanking = Object.entries(byDomain)
    .map(([domain, stats]) => ({
      domain,
      ...stats,
      wrong: stats.total - stats.correct,
      percent: Math.round((stats.correct / stats.total) * 100) || 0,
    }))
    .sort((a, b) => b.percent - a.percent);

  return <div className="max-w-4xl mx-auto p-4 space-y-4 text-slate-900 dark:text-slate-100">
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-5 space-y-4">
      <h2 className="text-2xl font-bold">Reporte de práctica</h2>
      <p className="text-slate-600 dark:text-slate-300">Revisa tu desempeño, identifica tus áreas débiles y decide tu próxima sesión.</p>
      <p className="text-slate-600 dark:text-slate-300">{motivationalMessage(percent)}</p>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_2fr] md:items-center">
          <div className="text-center md:text-left">
            <p className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100">{percent}%</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">Puntaje general</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30 p-3">
              <p className="text-xs text-green-700 dark:text-green-300">Correctas</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{correct.length}</p>
            </div>
            <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 p-3">
              <p className="text-xs text-red-700 dark:text-red-300">Falladas</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{incorrect.length}</p>
            </div>
            <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-300">Mejor racha</p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{streak}</p>
            </div>
            <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">Total</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{questions.length}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
        <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">{correct.length}/{questions.length} respuestas correctas.</p>
    </div>

    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
      <h3 className="font-semibold mb-3 text-slate-900 dark:text-slate-100">Desempeño por dominio</h3>
      <div className="space-y-3">
        {domainRanking.map((d) => <div key={d.domain} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 p-3">
          <div className="flex items-start justify-between gap-3">
            <p className="font-medium text-slate-900 dark:text-slate-100">{d.domain}</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{d.percent}%</p>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{d.correct} de {d.total} correctas</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{d.wrong} falladas</p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden"><div className={`${d.percent >= 80 ? 'bg-green-600' : d.percent >= 60 ? 'bg-amber-500' : 'bg-red-500'} h-2 rounded-full`} style={{ width: `${d.percent}%` }} /></div>
        </div>)}
      </div>
    </div>

    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
      <h3 className="font-semibold text-slate-900 dark:text-slate-100">Siguiente misión</h3>
      {incorrect.length === 0 ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Excelente. Puedes tomar una sesión más larga o practicar con temporizador para mantener el dominio.</p> : <div className="mt-2 space-y-2">
        <p className="text-sm text-slate-600 dark:text-slate-300">Tu prioridad ahora es corregir patrones, no solo repetir preguntas.</p>
        <ul className="list-disc ml-5 text-sm space-y-1 text-slate-600 dark:text-slate-300">
          <li>Reintenta las preguntas falladas.</li>
          <li>Refuerza los dominios con menor porcentaje.</li>
          <li>Lee la explicación antes de avanzar.</li>
        </ul>
      </div>}
    </div>

    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-5 space-y-3"><h3 className="font-semibold text-slate-900 dark:text-slate-100">Revisar errores</h3>{incorrect.length === 0 ? <p className="text-sm text-slate-600 dark:text-slate-300">¡Sin errores!</p> : incorrect.map((q) => <article key={q.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 p-4 space-y-2">
      <p className="font-semibold text-slate-900 dark:text-slate-100">{q.question}</p>
      <p className="text-sm text-slate-600 dark:text-slate-300"><span className="font-medium text-slate-700 dark:text-slate-200">Tu respuesta:</span> {answers[q.id] || 'Sin responder'}</p>
      <p className="text-sm text-slate-600 dark:text-slate-300"><span className="font-medium text-slate-700 dark:text-slate-200">Respuesta correcta:</span> {q.correctAnswer}</p>
      {q.explanation && <p className="text-sm text-slate-600 dark:text-slate-300"><span className="font-medium text-slate-700 dark:text-slate-200">Explicación:</span> {q.explanation}</p>}
      {answers[q.id] && answers[q.id] !== q.correctAnswer && q.optionExplanations?.[answers[q.id]] && <p className="text-sm text-slate-600 dark:text-slate-300"><span className="font-medium text-slate-700 dark:text-slate-200">Por qué esa opción no era correcta:</span> {q.optionExplanations[answers[q.id]]}</p>}
    </article>)}</div>

    <div className="flex flex-wrap gap-2">{incorrect.length > 0 && <button onClick={onRetryMissed} className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-4 py-2.5 text-sm sm:text-base">Reintentar preguntas falladas</button>}<button onClick={onNew} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 text-sm sm:text-base">Nueva sesión</button></div>
  </div>;
}
