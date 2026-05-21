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
  const domains = [...new Set(p.questions.map((q) => q.domain))].sort();
  const diffs = ['easy', 'medium', 'hard'];
  return <div className="max-w-3xl mx-auto p-4 space-y-4">
    <div className="text-center space-y-1">
      <h1 className="text-3xl font-bold">Texas General Lines Practice Exam</h1>
      <p className="text-slate-600">Life, Accident, Health & HMO</p>
      <p className="text-sm text-slate-700">{p.questions.length} preguntas disponibles</p>
    </div>
    <section className="bg-white rounded-lg shadow p-4 space-y-4">
      <h2 className="font-semibold">Filtros y opciones</h2>
      <div><p className="text-sm mb-2">Dificultad</p><div className="flex gap-2">{diffs.map((d)=><button key={d} onClick={()=>p.setSelectedDifficulties(p.selectedDifficulties.includes(d)?p.selectedDifficulties.filter(x=>x!==d):[...p.selectedDifficulties,d])} className={`px-3 py-1 rounded border ${p.selectedDifficulties.includes(d)?'bg-blue-100 border-blue-400':'bg-slate-50'}`}>{d==='easy'?'Fácil':d==='medium'?'Medio':'Difícil'}</button>)}</div></div>
      <div><div className="flex justify-between"><p className="text-sm mb-2">Dominios</p><div className="text-xs"><button onClick={()=>p.setSelectedDomains(domains)} className="underline mr-2">Todas</button><button onClick={()=>p.setSelectedDomains([])} className="underline">Ninguna</button></div></div><div className="flex flex-wrap gap-2">{domains.map((d)=><button key={d} onClick={()=>p.setSelectedDomains(p.selectedDomains.includes(d)?p.selectedDomains.filter(x=>x!==d):[...p.selectedDomains,d])} className={`px-3 py-1 rounded border ${p.selectedDomains.includes(d)?'bg-blue-100 border-blue-400':'bg-slate-50'}`}>{d}</button>)}</div></div>
      <label className="block"><input type="checkbox" checked={p.skipAnswered} onChange={e=>p.setSkipAnswered(e.target.checked)} className="mr-2"/>Omitir preguntas ya contestadas</label>
      <label className="block"><input type="checkbox" checked={p.showAtEnd} onChange={e=>p.setShowAtEnd(e.target.checked)} className="mr-2"/>Mostrar respuestas solo al final</label>
      <div><label className="block mb-1">¿Cuántas preguntas?</label><div className="flex items-center gap-2"><input type="number" min={1} value={p.count} onChange={e=>p.setCount(Number(e.target.value)||1)} className="border rounded px-2 py-1 w-24"/><span className="text-sm text-slate-600">de {p.availableCount}</span></div><div className="flex gap-2 mt-2">{[10,25,50,100].map((n)=><button key={n} onClick={()=>p.setCount(n)} className="px-2 py-1 rounded border">{n}</button>)}</div></div>
      {p.message && <p className="text-red-600 text-sm">{p.message}</p>}
      <button onClick={p.onStart} className="w-full bg-blue-600 text-white rounded py-2">Comenzar práctica</button>
    </section>
  </div>;
}
