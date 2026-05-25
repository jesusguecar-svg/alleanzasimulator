import type { NormalizedQuestion } from '../types/question';
import { getDashboardStats } from '../utils/storage';

type Props = {
  allQuestions: NormalizedQuestion[];
  onBack: () => void;
};

type DomainRow = {
  domain: string;
  total: number;
  correct: number;
  attempts: number;
  percent: number;
};

function barColor(percent: number): string {
  if (percent < 60) return 'bg-red-500';
  if (percent < 80) return 'bg-amber-500';
  return 'bg-green-600';
}

export function DashboardScreen({ allQuestions, onBack }: Props) {
  const stats = getDashboardStats(allQuestions);

  const domainRows: DomainRow[] = Object.entries(stats.byDomain)
    .map(([domain, values]) => ({
      domain,
      total: values.total,
      correct: values.correct,
      attempts: values.attempts,
      percent: values.total ? Math.round((values.correct / values.total) * 100) : 0,
    }))
    .sort((a, b) => a.percent - b.percent);

  const weakDomains = domainRows.filter((d) => d.percent < 70);

  return <div className="max-w-3xl mx-auto p-4 space-y-4 text-slate-900 dark:text-slate-100">
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-5 space-y-3">
      <h2 className="text-2xl font-bold">Mis estadísticas</h2>

      {stats.totalAnswered === 0 ? <p className="text-slate-700 dark:text-slate-300">Aún no tienes sesiones registradas. ¡Completa tu primera práctica para ver tus estadísticas!</p> : <>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="border border-slate-200 dark:border-slate-700 rounded p-3 bg-slate-50 dark:bg-slate-800/50"><p className="text-xs text-slate-600 dark:text-slate-300">Respondidas</p><p className="text-2xl font-bold">{stats.totalAnswered}</p></div>
          <div className="border border-slate-200 dark:border-slate-700 rounded p-3 bg-green-50 dark:bg-green-950/20"><p className="text-xs text-slate-600 dark:text-slate-300">Correctas</p><p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.totalCorrect}</p></div>
          <div className="border border-slate-200 dark:border-slate-700 rounded p-3 bg-blue-50 dark:bg-blue-950/20"><p className="text-xs text-slate-600 dark:text-slate-300">Precisión general</p><p className="text-2xl font-bold">{stats.overallPercent}%</p></div>
        </div>

        <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded overflow-hidden">
          <div className={`${barColor(stats.overallPercent)} h-3`} style={{ width: `${stats.overallPercent}%` }} />
        </div>
      </>}
    </div>

    {stats.totalAnswered > 0 && <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
        <h3 className="font-semibold mb-3">Desempeño por dominio</h3>
        <div className="space-y-3">
          {domainRows.map((d) => <div key={d.domain} className={`border border-slate-200 dark:border-slate-700 rounded p-3 ${d.percent < 70 ? 'bg-red-50 dark:bg-red-950/20' : 'bg-slate-50 dark:bg-slate-800/40'}`}>
            <div className="flex items-center justify-between gap-3"><p className="font-bold">{d.domain}</p><p className="text-sm text-slate-700 dark:text-slate-300">{d.correct}/{d.total} ({d.percent}%)</p></div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded mt-2 overflow-hidden"><div className={`${barColor(d.percent)} h-2`} style={{ width: `${d.percent}%` }} /></div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">Intentos: {d.attempts}</p>
          </div>)}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
        {weakDomains.length > 0 ? <p className="text-sm text-slate-700 dark:text-slate-300">Enfócate en estas áreas antes del examen: <span className="font-semibold text-red-700 dark:text-red-400">{weakDomains.map((d) => d.domain).join(', ')}</span>.</p> : <p className="text-sm text-slate-700 dark:text-slate-300">¡Excelente! Todos tus dominios superan el 70% de precisión.</p>}
      </div>
    </>}

    <div>
      <button onClick={onBack} className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl px-4 py-2.5 text-sm sm:text-base min-h-11">← Volver</button>
    </div>
  </div>;
}
