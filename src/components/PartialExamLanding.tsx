import { AlarmClock, ArrowRight, BarChart3, BookOpenCheck, CheckCircle2, ClipboardCheck, LockKeyhole } from 'lucide-react';
import { AppHeader } from './AppChrome';

type Props = {
  darkMode: boolean;
  onToggleTheme: () => void;
  availableQuestions: number;
  studentName: string;
  setStudentName: (name: string) => void;
  onStart: () => void;
};

const modules = [
  ['01', 'Vida', 'Tipos de pólizas de vida'],
  ['02', 'Provisiones', 'Cláusulas, opciones y exclusiones'],
  ['03', 'Solicitud', 'Suscripción y entrega'],
  ['04', 'Retiro', 'Anualidades e impuestos'],
  ['05', 'Salud', 'Tipos de pólizas de salud'],
  ['06', 'Salud', 'Provisiones y cláusulas'],
  ['07', 'Seguro social', 'Programas y beneficios'],
  ['08', 'Conceptos', 'Otros conceptos de seguros'],
  ['09', 'Suscripción', 'Procesos en campo'],
];

export function PartialExamLanding({ darkMode, onToggleTheme, availableQuestions, studentName, setStudentName, onStart }: Props) {
  const questionCount = Math.min(75, availableQuestions);

  return (
    <div className="app-shell partial-landing-shell">
      <AppHeader darkMode={darkMode} onToggleTheme={onToggleTheme} questionCount={availableQuestions} />
      <main className="partial-landing" id="main-content">
        <section className="partial-hero">
          <div className="partial-hero-copy">
            <span className="eyebrow"><ClipboardCheck size={15} /> Evaluación de progreso</span>
            <h1>Examen <em>Parcial</em></h1>
            <p>Comprueba tu preparación en los módulos 1–9 de Vida, Salud y Accidentes bajo condiciones cronometradas.</p>
            <div className="partial-facts" aria-label="Condiciones del examen">
              <span><strong>{questionCount}</strong> preguntas</span>
              <span><strong>{questionCount}</strong> minutos</span>
              <span><strong>1</strong> diagnóstico final</span>
            </div>
          </div>
          <div className="partial-ticket" aria-hidden="true">
            <span>ALLEANZA ACADEMY</span>
            <strong>01—09</strong>
            <small>VIDA · SALUD · ACCIDENTES</small>
          </div>
        </section>

        <div className="partial-layout">
          <section className="panel partial-modules">
            <div className="section-heading">
              <div><BookOpenCheck size={19} /><h2>Contenido evaluado</h2></div>
              <span className="module-badge">9 módulos</span>
            </div>
            <div className="module-rail">
              {modules.map(([number, title, description]) => (
                <article key={number}>
                  <span>{number}</span>
                  <div><strong>{title}</strong><small>{description}</small></div>
                </article>
              ))}
            </div>
          </section>

          <aside className="panel partial-start-card">
            <span className="eyebrow">Antes de comenzar</span>
            <h2>Simula el momento real</h2>
            <ul>
              <li><AlarmClock size={17} /><span>El reloj comienza al iniciar y el examen se entrega al llegar a cero.</span></li>
              <li><LockKeyhole size={17} /><span>No verás respuestas ni explicaciones hasta terminar.</span></li>
              <li><CheckCircle2 size={17} /><span>Podrás cambiar respuestas y marcar preguntas para revisar.</span></li>
              <li><BarChart3 size={17} /><span>Recibirás un diagnóstico por dominio y prioridades de estudio.</span></li>
            </ul>
            <label htmlFor="student-name">Nombre del estudiante</label>
            <input
              id="student-name"
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
              placeholder="Escribe tu nombre completo"
              autoComplete="name"
            />
            <button className="primary partial-start-button" disabled={!studentName.trim() || questionCount === 0} onClick={onStart}>
              Iniciar examen parcial <ArrowRight size={18} />
            </button>
            <p className="privacy-note">Tu nombre y resultados permanecen en este dispositivo, salvo que descargues y compartas el reporte.</p>
          </aside>
        </div>
      </main>
    </div>
  );
}
