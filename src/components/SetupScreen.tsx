import { getProgress } from '../utils/storage';
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
  count: number;
  setCount: (v: number) => void;
  availableCount: number;
  onStart: () => void;
  message?: string;
};

export function SetupScreen(p: Props) {
  const progress = getProgress();
  const domains = [...new Set(p.questions.map((q) => q.domain))].sort();
  const diffs = ['easy', 'medium', 'hard'];
  const accuracy = progress.correctIds.length > 0 ? Math.round((progress.correctIds.length / progress.answeredIds.length) * 100) : 0;

  return <div className="max-w-3xl mx-auto p-4 space-y-4 sm:p-6 sm:space-y-6">
    <div className="text-center space-y-1">
      <h1 className="text-2xl sm:text-3xl font-bold">Simulador de Práctica — Texas General Lines</h1>
      <p className="text-sm sm:text-base text-slate-600">Life, Accident, Health & HMO</p>
      <p className="text-xs sm:text-sm text-slate-700">{p.questions.length} preguntas disponibles</p>
    </div>

    {progress.answeredIds.length > 0 && (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
        <h2 className="font-semibold text-blue-900">Tu progreso</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><p className="text-blue-700">Preguntas respondidas</p><p className="text-lg font-bold text-blue-900">{progress.answeredIds.length}</p></div>
          <div><p className="text-blue-700">Precisión</p><p className="text-lg font-bold text-blue-900">{accuracy}%</p></div>
          <div><p className="text-green-700">Correctas</p><p className="text-lg font-bold text-green-900">{progress.correctIds.length}</p></div>
          <div><p className="text-red-700">Incorrectas</p><p className="text-lg font-bold text-red-900">{progress.incorrectIds.length}</p></div>
        </div>
      </div>
    )}

    <section className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
      <h2 className="font-semibold text-lg">Filtros y opciones</h2>
      <div>
        <p className="text-sm font-medium mb-2">Dificultad</p>
        <div className="flex gap-2 flex-wrap">
          {diffs.map((d)=>(
            <button
              key={d}
              onClick={()=>p.setSelectedDifficulties(p.selectedDifficulties.includes(d)?p.selectedDifficulties.filter(x=>x!==d):[...p.selectedDifficulties,d])}
              aria-pressed={p.selectedDifficulties.includes(d)}
              aria-label={`Filtro por dificultad: ${d==='easy'?'Fácil':d==='medium'?'Medio':'Difícil'}`}
              className={`px-3 py-1 rounded border transition-colors text-sm ${p.selectedDifficulties.includes(d)?'bg-blue-100 border-blue-400':'bg-slate-50 hover:bg-slate-100'}`}
            >
              {d==='easy'?'Fácil':d==='medium'?'Medio':'Difícil'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium">Dominios</p>
          <div className="text-xs space-x-2">
            <button onClick={()=>p.setSelectedDomains(domains)} aria-label="Seleccionar todos los dominios" className="underline hover:no-underline transition-all">Todas</button>
            <button onClick={()=>p.setSelectedDomains([])} aria-label="Deseleccionar todos los dominios" className="underline hover:no-underline transition-all">Ninguna</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {domains.map((d)=>(
            <button
              key={d}
              onClick={()=>p.setSelectedDomains(p.selectedDomains.includes(d)?p.selectedDomains.filter(x=>x!==d):[...p.selectedDomains,d])}
              aria-pressed={p.selectedDomains.includes(d)}
              aria-label={`Filtro por dominio: ${d}`}
              className={`px-3 py-1 rounded border transition-colors text-sm ${p.selectedDomains.includes(d)?'bg-blue-100 border-blue-400':'bg-slate-50 hover:bg-slate-100'}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={p.skipAnswered} onChange={e=>p.setSkipAnswered(e.target.checked)} className="cursor-pointer"/>
        <span className="text-sm">Omitir preguntas ya contestadas</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={p.showAtEnd} onChange={e=>p.setShowAtEnd(e.target.checked)} className="cursor-pointer"/>
        <span className="text-sm">Mostrar respuestas solo al final</span>
      </label>

      <div>
        <label htmlFor="question-count" className="block text-sm font-medium mb-2">¿Cuántas preguntas?</label>
        <div className="flex items-center gap-2 mb-2">
          <input
            id="question-count"
            type="number"
            min={1}
            value={p.count}
            onChange={e=>p.setCount(Number(e.target.value)||1)}
            className="border rounded px-2 py-1 w-20 text-sm"
          />
          <span className="text-sm text-slate-600">de {p.availableCount}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[10,25,50,100].map((n)=>(
            <button
              key={n}
              onClick={()=>p.setCount(n)}
              aria-label={`Seleccionar ${n} preguntas`}
              className="px-2 py-1 rounded border text-sm hover:bg-slate-50 transition-colors"
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {p.message && <p className="text-red-600 text-sm font-medium">{p.message}</p>}
      <button onClick={p.onStart} className="w-full bg-blue-600 text-white rounded py-2 sm:py-3 hover:bg-blue-700 transition-colors font-medium">Comenzar práctica</button>
    </section>
  </div>;
}
