import { useMemo } from 'react';
import type { NormalizedQuestion } from '../types/question';

type Props = {
  questions: NormalizedQuestion[];
  selectedDomains: string[];
  setSelectedDomains: (v: string[]) => void;
  selectedDifficulties: string[];
  setSelectedDifficulties: (v: string[]) => void;
  skipAnswered: boolean;
  setSkipAnswered: (v: boolean) => void;
  showImmediate: boolean;
  setShowImmediate: (v: boolean) => void;
  useTimer: boolean;
  setUseTimer: (v: boolean) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  count: number;
  setCount: (v: number) => void;
  availableCount: number;
  onStart: () => void;
  message?: string;
  recommendedPathMessage?: string;
  onBackToOnboarding?: () => void;
};

export function SetupScreen(p: Props) {
  const domains = useMemo(() => {
    const unique = new Map<string, string>();
    for (const q of p.questions) {
      const clean = q.domain.trim();
      const key = clean.toLowerCase();
      if (!unique.has(key)) unique.set(key, clean);
    }
    return Array.from(unique.values()).sort((a, b) => a.localeCompare(b));
  }, [p.questions]);

  const diffs = ['easy', 'medium', 'hard'];

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

    <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 space-y-4">
      <h2 className="font-semibold">Filtros y opciones</h2>
      {p.recommendedPathMessage && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-3 space-y-1">
          <p className="text-sm text-blue-800 dark:text-blue-200">{p.recommendedPathMessage}</p>
          {p.onBackToOnboarding && (
            <button onClick={p.onBackToOnboarding} className="text-xs underline text-blue-700 dark:text-blue-300">
              Cambiar ruta
            </button>
          )}
        </div>
      )}

      <div><p className="text-sm mb-2">Dificultad</p><div className="flex gap-2 flex-wrap">{diffs.map((d)=><button key={d} onClick={()=>p.setSelectedDifficulties(p.selectedDifficulties.includes(d)?p.selectedDifficulties.filter(x=>x!==d):[...p.selectedDifficulties,d])} className={`px-3 py-1 rounded border ${p.selectedDifficulties.includes(d)?'bg-blue-100 dark:bg-blue-900/40 border-blue-400':'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>{d==='easy'?'Fácil':d==='medium'?'Medio':'Difícil'}</button>)}</div></div>

      <div><div className="flex justify-between"><p className="text-sm mb-2">Dominios</p><div className="text-xs"><button onClick={()=>p.setSelectedDomains(domains)} className="underline mr-2">Todas</button><button onClick={()=>p.setSelectedDomains([])} className="underline">Ninguna</button></div></div><div className="flex flex-wrap gap-2">{domains.map((d)=><button key={d} onClick={()=>p.setSelectedDomains(p.selectedDomains.includes(d)?p.selectedDomains.filter(x=>x!==d):[...p.selectedDomains,d])} className={`px-3 py-1 rounded border ${p.selectedDomains.includes(d)?'bg-blue-100 dark:bg-blue-900/40 border-blue-400':'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>{d}</button>)}</div></div>

      <label className="block"><input type="checkbox" checked={p.skipAnswered} onChange={e=>p.setSkipAnswered(e.target.checked)} className="mr-2"/>Omitir preguntas ya contestadas</label>
      <label className="block"><input type="checkbox" checked={p.showImmediate} onChange={e=>p.setShowImmediate(e.target.checked)} className="mr-2"/>Ver la explicación después de cada respuesta</label>
      <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2 ml-6">Las explicaciones solo se muestran al responder cada pregunta. Al finalizar verás tu puntaje y desempeño, no el listado de preguntas.</p>
      <label className="block"><input type="checkbox" checked={p.useTimer} onChange={e=>p.setUseTimer(e.target.checked)} className="mr-2"/>Usar temporizador</label>

      <div><label className="block mb-1">¿Cuántas preguntas?</label><div className="flex items-center gap-2"><input type="number" min={1} value={p.count} onChange={e=>p.setCount(Number(e.target.value)||1)} className="border border-slate-300 dark:border-slate-600 dark:bg-slate-800 rounded px-2 py-1 w-24"/><span className="text-sm text-slate-600 dark:text-slate-300">de {p.availableCount}</span></div><div className="flex gap-2 mt-2">{[10,25,50,100].map((n)=><button key={n} onClick={()=>p.setCount(n)} className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">{n}</button>)}</div></div>
      {p.message && <p className="text-red-600 text-sm">{p.message}</p>}
      <button onClick={p.onStart} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2">Comenzar práctica</button>
    </section>
  </div>;
}
