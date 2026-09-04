import { useMemo } from 'react';
import { Check, Clock3, History, ListChecks, Play, RotateCcw, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import type { NormalizedQuestion } from '../types/question';
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
  const domains = useMemo(() => {
    const unique = new Map<string, string>();
    for (const q of p.questions) {
      const clean = q.domain.trim();
      const key = clean.toLowerCase();
      if (!unique.has(key)) unique.set(key, clean);
    }
    return Array.from(unique.values()).sort((a, b) => a.localeCompare(b));
  }, [p.questions]);

  const diffs = [
    { id: 'easy', label: 'Fácil' },
    { id: 'medium', label: 'Medio' },
    { id: 'hard', label: 'Difícil' },
  ];

  const toggleDomain = (domain: string) => {
    p.setSelectedDomains(
      p.selectedDomains.includes(domain)
        ? p.selectedDomains.filter((item) => item !== domain)
        : [...p.selectedDomains, domain],
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
              <button className="text-button" onClick={() => p.setSelectedDomains(p.selectedDomains.length === domains.length ? [] : domains)}>
                {p.selectedDomains.length === domains.length ? 'Quitar todos' : 'Seleccionar todos'}
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
                  <button className={p.scope === 'general' ? 'active' : ''} onClick={() => p.setScope('general')}>Dominios generales</button>
                  <button className={p.scope === 'state' ? 'active' : ''} onClick={() => p.setScope('state')}>Dominio por estado</button>
                </div>
                {p.scope === 'state' && <div className="state-picker"><label htmlFor="state-name">Estado</label><select id="state-name" value={p.stateName} onChange={(event) => p.setStateName(event.target.value)}><option>Texas</option><option>Florida</option><option>California</option><option>New York</option><option>Otro estado</option></select></div>}
                {p.scope === 'state' && !p.stateSpecificAvailable && <p className="inline-note"><SlidersHorizontal size={14} /> Aún no hay preguntas específicas para {p.stateName}. Mantendremos solo los dominios generales, sin mezclar leyes de otro estado.</p>}
                {p.scope === 'state' && p.stateSpecificAvailable && <p className="inline-note"><Check size={14} /> Incluye los dominios generales y los estatutos específicos de Texas disponibles.</p>}
              </div>
            </div>
            <div className="domain-list">
              {domains.map((domain, domainIndex) => {
                const selected = p.selectedDomains.includes(domain);
                const domainCount = p.questions.filter((question) => question.domain.trim().toLowerCase() === domain.toLowerCase()).length;
                return (
                  <button key={domain} className={`domain-row ${selected ? 'selected' : ''}`} onClick={() => toggleDomain(domain)} aria-pressed={selected}>
                    <span className="checkbox">{selected && <Check size={15} />}</span>
                    <span className="domain-code">D{domainIndex + 1}</span>
                    <span className="domain-name">{domain}</span>
                    <span className="domain-count">{domainCount}</span>
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
