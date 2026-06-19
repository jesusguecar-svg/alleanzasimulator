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

  return <div className="max-w-4xl mx-auto p-4 space-y-4">
    <div className="bg-white rounded-lg shadow p-4 space-y-3">
      <h2 className="text-2xl font-bold">Tu scoreboard</h2>
      <p className="text-slate-700">{motivationalMessage(percent)}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="border rounded p-3 bg-slate-50"><p className="text-xs text-slate-600">Puntaje</p><p className="text-2xl font-bold">{percent}%</p></div>
        <div className="border rounded p-3 bg-green-50"><p className="text-xs text-slate-600">Correctas</p><p className="text-2xl font-bold text-green-700">{correct.length}</p></div>
        <div className="border rounded p-3 bg-red-50"><p className="text-xs text-slate-600">Incorrectas</p><p className="text-2xl font-bold text-red-700">{incorrect.length}</p></div>
        <div className="border rounded p-3 bg-amber-50"><p className="text-xs text-slate-600">Mejor racha</p><p className="text-2xl font-bold text-amber-700">{streak}</p></div>
      </div>
      <div className="w-full bg-slate-200 h-3 rounded overflow-hidden">
        <div className="bg-blue-600 h-3" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-sm text-slate-600">{correct.length}/{questions.length} respuestas correctas.</p>
    </div>

    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-2">Desempeño por dominio</h3>
      <div className="space-y-3">
        {domainRanking.map((d) => <div key={d.domain} className="border rounded p-3">
          <div className="flex items-center justify-between"><p className="font-medium">{d.domain}</p><p className="text-sm">{d.correct}/{d.total} ({d.percent}%)</p></div>
          <div className="w-full bg-slate-200 h-2 rounded mt-2 overflow-hidden"><div className={`${d.percent >= 80 ? 'bg-green-600' : d.percent >= 60 ? 'bg-amber-500' : 'bg-red-500'} h-2`} style={{ width: `${d.percent}%` }} /></div>
          <p className="text-xs text-slate-600 mt-1">Falladas: {d.wrong}</p>
        </div>)}
      </div>
    </div>

    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold">Siguiente misión</h3>
      {incorrect.length === 0 ? <p>¡Sin errores! Intenta una sesión más larga o sube la dificultad para mantener el ritmo.</p> : <ul className="list-disc ml-5 text-sm space-y-1"><li>Reintenta solo las falladas para consolidar memoria activa.</li><li>Prioriza los dominios con porcentaje más bajo.</li><li>Activa "Ver la explicación después de cada respuesta" para aprender mientras practicas.</li></ul>}
    </div>

    <div className="flex gap-2"><button onClick={onRetryMissed} className="bg-amber-600 text-white rounded px-3 py-2">Reintentar preguntas falladas</button><button onClick={onNew} className="bg-blue-600 text-white rounded px-3 py-2">Nueva sesión</button></div>
  </div>;
}
