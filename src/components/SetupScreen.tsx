import { useMemo, useState } from 'react';
import type { NormalizedQuestion } from '../types/question';

type Props = {
  questions: NormalizedQuestion[];
  selectedDomains: string[];
  setSelectedDomains: (v: string[]) => void;
  selectedDifficulties: string[];
  setSelectedDifficulties: (v: string[]) => void;
  skipAnswered: boolean;
  setSkipAnswered: (v: boolean) => void;
  showAtEnd: boolean;
  setShowAtEnd: (v: boolean) => void;
  useTimer: boolean;
  setUseTimer: (v: boolean) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  count: number;
  setCount: (v: number) => void;
  availableCount: number;
  onStart: () => void;
  onShowDashboard: () => void;
  onResetProgress: () => void;
  message?: string;
};

export function SetupScreen(p: Props) {
  const [domainsExpanded, setDomainsExpanded] = useState(false);
  const [domainSearch, setDomainSearch] = useState('');

  const domains = useMemo(() => {
    const unique = new Map<string, string>();
    for (const q of p.questions) {
      const clean = q.domain.trim();
      const key = clean.toLowerCase();
      if (!unique.has(key)) unique.set(key, clean);
    }
    return Array.from(unique.values()).sort((a, b) => a.localeCompare(b));
  }, [p.questions]);

  const filteredDomains = domains.filter((d) => d.toLowerCase().includes(domainSearch.toLowerCase()));
  const diffs = ['easy', 'medium', 'hard'];

  const domainSummary = p.selectedDomains.length === domains.length
    ? `Todas (${domains.length})`
    : p.selectedDomains.length === 0
      ? 'Ninguna'
      : `${p.selectedDomains.length} de ${domains.length} seleccionadas`;

  return <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4 text-slate-900 dark:text-slate-100">
    <div className="flex justify-end">
      <button
        type="button"
        onClick={() => p.setDarkMode(!p.darkMode)}
        className="rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm"
      >
        {p.darkMode ? '🌙 Oscuro' : '🌞 Claro'}
      </button>
    </div>

    <div className="text-center space-y-1">
      <h1 className="text-3xl font-bold">Texas General Lines Practice Exam</h1>
      <p className="text-slate-600 dark:text-slate-300">Life, Accident, Health & HMO</p>
      <p className="text-sm text-slate-700 dark:text-slate-200">{p.questions.length} preguntas disponibles</p>
    </div>

    <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 space-y-5">
      <h2 className="font-semibold">Filtros y opciones</h2>

      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <p className="text-sm font-medium mb-2">Dificultad</p>
        <div className="flex gap-2 flex-wrap">
          {diffs.map((d) => <button key={d} onClick={() => p.setSelectedDifficulties(p.selectedDifficulties.includes(d) ? p.selectedDifficulties.filter((x) => x !== d) : [...p.selectedDifficulties, d])} className={`px-3 py-1 rounded border ${p.selectedDifficulties.includes(d) ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-400' : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
            {d === 'easy' ? 'Fácil' : d === 'medium' ? 'Medio' : 'Difícil'}
          </button>)}
        </div>
      </div>

      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <button type="button" onClick={() => setDomainsExpanded((v) => !v)} className="w-full flex items-center justify-between text-left">
          <div>
            <p className="text-sm font-medium">Dominios</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{domainSummary}</p>
          </div>
          <span className="text-sm text-slate-600 dark:text-slate-300">{domainsExpanded ? '▲' : '▼'}</span>
        </button>

        {domainsExpanded && <div className="mt-3">
          <input
            type="text"
            value={domainSearch}
            onChange={(e) => setDomainSearch(e.target.value)}
            placeholder="Buscar dominio..."
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 mb-3"
          />
          <div className="flex flex-wrap gap-2">
            {filteredDomains.map((d) => <button key={d} onClick={() => p.setSelectedDomains(p.selectedDomains.includes(d) ? p.selectedDomains.filter((x) => x !== d) : [...p.selectedDomains, d])} className={`px-3 py-1 rounded border ${p.selectedDomains.includes(d) ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-400' : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
              {d}
            </button>)}
          </div>
          <button type="button" onClick={() => setDomainsExpanded(false)} className="mt-3 text-xs text-slate-600 dark:text-slate-300 hover:underline">Cerrar ▲</button>
        </div>}
      </div>

      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <p className="text-sm font-medium mb-2">Opciones</p>
        <div className="space-y-2">
          <label className="flex items-center gap-2"><input type="checkbox" checked={p.skipAnswered} onChange={(e) => p.setSkipAnswered(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800" />Omitir preguntas ya contestadas</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={p.showAtEnd} onChange={(e) => p.setShowAtEnd(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800" />Mostrar respuestas solo al final</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={p.useTimer} onChange={(e) => p.setUseTimer(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800" />Usar temporizador</label>
        </div>
      </div>

      <div>
        <label className="block mb-1">¿Cuántas preguntas?</label>
        <div className="flex items-center gap-2">
          <input type="number" min={1} value={p.count} onChange={(e) => p.setCount(Number(e.target.value) || 1)} className="border border-slate-300 dark:border-slate-600 dark:bg-slate-800 rounded px-2 py-1 w-24" />
          <span className="text-sm text-slate-600 dark:text-slate-300">de {p.availableCount}</span>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 mt-2">
          {[10, 25, 50, 100].map((n) => <button key={n} onClick={() => p.setCount(n)} className={`flex-1 py-1.5 text-sm border-r border-slate-200 dark:border-slate-700 last:border-r-0 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 ${p.count === n ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600' : ''}`}>{n}</button>)}
        </div>
      </div>

      {p.message && <p className="text-red-600 text-sm">{p.message}</p>}
      <button onClick={p.onStart} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2">Comenzar práctica</button>
      <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-1">{p.count} de {p.availableCount} preguntas seleccionadas</p>

      <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
        <button onClick={p.onShowDashboard} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Ver mis estadísticas →</button>
        <button onClick={p.onResetProgress} className="text-sm text-red-500 dark:text-red-400 hover:underline">Reiniciar progreso</button>
      </div>
    </section>
  </div>;
}
