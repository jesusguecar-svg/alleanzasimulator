import { useMemo } from 'react';
import { BookOpenCheck, Check, Clock3, HeartPulse, History, Landmark, ListChecks, Play, RotateCcw, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import type { NormalizedQuestion } from '../types/question';
import { getStudyGroupId, groupCatalog } from '../data/studyGroups';
import { AppHeader } from './AppChrome';

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
  onViewStats?: () => void;
  onResetProgress?: () => void;
  practiceLine: 'all' | 'life' | 'health' | 'accident';
  setPracticeLine: (v: 'all' | 'life' | 'health' | 'accident') => void;
  scope: 'general' | 'state';
  setScope: (v: 'general' | 'state') => void;
  stateName: string;
  setStateName: (v: string) => void;
  stateSpecificAvailable: boolean;
};

export function SetupScreen(p: Props) {
  const domainGroups = useMemo(() => {
    return groupCatalog(p.scope, p.stateName).map((group) => ({
      ...group,
      count: p.questions.filter((question) => getStudyGroupId(question, p.scope, p.stateName) === group.id).length,
    })).filter((group) => group.count > 0);
  }, [p.questions, p.scope, p.stateName]);

  const visibleDomains = domainGroups.map((group) => group.id);

  const diffs = [
    { id: 'easy', label: 'Fácil' },
    { id: 'medium', label: 'Medio' },
    { id: 'hard', label: 'Difícil' },
  ];

  const toggleDomainGroup = (groupId: string) => {
    const selected = p.selectedDomains.includes(groupId);
    p.setSelectedDomains(
      selected ? p.selectedDomains.filter((domain) => domain !== groupId) : [...new Set([...p.selectedDomains, groupId])],
    );
  };

  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) => (
    <button type="button" className={`toggle ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)} aria-pressed={checked} aria-label={label}>
      <span />
    </button>
  );

  return (
    <div className="app-shell setup-shell">
      <AppHeader darkMode={p.darkMode} onToggleTheme={() => p.setDarkMode(!p.darkMode)} questionCount={p.questions.length} onHome={p.onBackToOnboarding} />
      <main className="setup-main" id="main-content">
        <section className="setup-intro">
          <div>
            <span className="eyebrow">Life, Accident, Health &amp; HMO</span>
            <h1>Práctica de seguros para Life, Health &amp; Accident</h1>
            <p>Configura una práctica general o el contenido específico disponible para tu estado.</p>
          </div>
          <div className="powered"><ShieldCheck size={18} /> Powered by <strong>Alleanza Academy</strong></div>
        </section>

        {p.recommendedPathMessage && (
          <div className="route-note">
            <ShieldCheck size={18} />
            <span>{p.recommendedPathMessage}</span>
            {p.onBackToOnboarding && <button className="text-button" onClick={p.onBackToOnboarding}>Cambiar ruta</button>}
          </div>
        )}

        <div className="setup-grid">
          <section className="panel domain-panel">
            <div className="section-heading">
              <div><span className="step">1</span><h2>Ruta y dominios</h2></div>
              <button className="text-button" onClick={() => p.setSelectedDomains(visibleDomains.every((domain) => p.selectedDomains.includes(domain)) ? [] : visibleDomains)}>
                {visibleDomains.every((domain) => p.selectedDomains.includes(domain)) ? 'Quitar todos' : 'Seleccionar todos'}
              </button>
            </div>
            <div className="filter-stack">
              <div className="setting-block compact-setting">
                <label htmlFor="practice-line">Línea que quieres practicar</label>
                <select id="practice-line" value={p.practiceLine} onChange={(event) => p.setPracticeLine(event.target.value as typeof p.practiceLine)}>
                  <option value="all">Todas las líneas disponibles</option>
                  <option value="life">Solo Life</option>
                  <option value="health">Solo Health</option>
                  <option value="accident">Solo Accident</option>
                </select>
              </div>
              <div className="setting-block compact-setting">
                <label>Enfoque del examen</label>
                <div className="segmented scope-segmented">
                  <button className={p.scope === 'general' ? 'active' : ''} onClick={() => p.setScope('general')}>Fundamentos</button>
                  <button className={p.scope === 'state' ? 'active' : ''} onClick={() => p.setScope('state')}>Leyes estatales</button>
                </div>
                {p.scope === 'state' && <div className="state-picker"><label htmlFor="state-name">Estado</label><select id="state-name" value={p.stateName} onChange={(event) => p.setStateName(event.target.value)}><option>Texas</option><option>Florida</option><option>California</option><option>New York</option><option>Otro estado</option></select></div>}
                {p.scope === 'state' && !p.stateSpecificAvailable && <p className="inline-note"><SlidersHorizontal size={14} /> Aún no hay preguntas específicas para {p.stateName}. Mantendremos solo los dominios generales, sin mezclar leyes de otro estado.</p>}
                {p.scope === 'state' && p.stateSpecificAvailable && <p className="inline-note"><Check size={14} /> Banco específico de {p.stateName}: estudia estas rutas por separado para evitar mezclar leyes estatales.</p>}
              </div>
            </div>
            <div className="domain-summary" aria-live="polite">
              <strong>{p.scope === 'state' ? `Rutas de ${p.stateName}` : 'Rutas fundamentales'}</strong>
              <span>{visibleDomains.filter((domain) => p.selectedDomains.includes(domain)).length} de {visibleDomains.length} áreas seleccionadas</span>
            </div>
            <div className="domain-grid">
              {domainGroups.map((group) => {
                const selected = p.selectedDomains.includes(group.id);
                const Icon = group.icon === 'health' ? HeartPulse : group.icon === 'landmark' ? Landmark : BookOpenCheck;
                return (
                  <button key={group.id} className={`domain-card ${selected ? 'selected' : ''}`} onClick={() => toggleDomainGroup(group.id)} aria-pressed={selected}>
                    <span className="domain-card-top"><span className="domain-icon"><Icon size={19} /></span><span className="checkbox">{selected && <Check size={15} />}</span></span>
                    <strong>{group.title}</strong>
                    <span>{group.description}</span>
                    <small>{group.count} preguntas</small>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="panel settings-panel">
            <div className="section-heading"><div><span className="step">2</span><h2>Condiciones</h2></div></div>

            <div className="setting-block">
              <label htmlFor="question-count">Cantidad de preguntas</label>
              <div className="segmented count-segmented">
                {[10, 25, 50, 75, 100].map((amount) => (
                  <button key={amount} className={p.count === amount ? 'active' : ''} onClick={() => p.setCount(amount)}>{amount}</button>
                ))}
              </div>
              <div className="range-row">
                <input type="range" min="1" max={Math.max(1, p.availableCount)} value={Math.min(p.count, Math.max(1, p.availableCount))} onChange={(event) => p.setCount(Number(event.target.value))} />
                <strong>{p.availableCount} disponibles</strong>
              </div>
              <div className="count-input-row"><input id="question-count" type="number" min="1" max={Math.max(1, p.availableCount)} value={p.count} onChange={(event) => p.setCount(Math.max(1, Number(event.target.value) || 1))} /><span>Escribe cualquier cantidad, hasta {p.availableCount}.</span></div>
            </div>

            <div className="setting-block">
              <label>Dificultad</label>
              <div className="segmented difficulty-segmented">
                {diffs.map((difficulty) => (
                  <button
                    key={difficulty.id}
                    className={p.selectedDifficulties.includes(difficulty.id) ? 'active' : ''}
                    onClick={() => p.setSelectedDifficulties(p.selectedDifficulties.includes(difficulty.id) ? p.selectedDifficulties.filter((item) => item !== difficulty.id) : [...p.selectedDifficulties, difficulty.id])}
                    aria-pressed={p.selectedDifficulties.includes(difficulty.id)}
                  >
                    {difficulty.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="toggle-list">
              <div><span><Clock3 size={17} /> Usar temporizador</span><Toggle checked={p.useTimer} onChange={p.setUseTimer} label="Usar temporizador" /></div>
              <div><span><ListChecks size={17} /> Ver la explicación después de cada respuesta</span><Toggle checked={p.showImmediate} onChange={p.setShowImmediate} label="Ver explicación inmediata" /></div>
              <div><span><History size={17} /> Omitir preguntas ya contestadas</span><Toggle checked={p.skipAnswered} onChange={p.setSkipAnswered} label="Omitir preguntas contestadas" /></div>
            </div>

            {p.message && <p className="form-message" role="alert">{p.message}</p>}
            <button className="primary start-button" onClick={p.onStart} disabled={!p.availableCount || !p.selectedDifficulties.length}>
              <Play size={18} fill="currentColor" /> Comenzar práctica
            </button>
            {p.onBackToOnboarding && <button className="secondary back-route-button" onClick={p.onBackToOnboarding}><RotateCcw size={16} /> Volver a las rutas</button>}
          </section>
        </div>
        <div className="history-note">
          <History size={17} />
          <span>Tu progreso se guarda en este dispositivo.</span>
          {p.onViewStats && <button onClick={p.onViewStats}>Ver mis estadísticas</button>}
          {p.onResetProgress && <button className="muted-action" onClick={p.onResetProgress}>Reiniciar progreso</button>}
        </div>
      </main>
    </div>
  );
}
