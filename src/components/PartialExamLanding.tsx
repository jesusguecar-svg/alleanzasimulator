import { AlarmClock, ArrowRight, BarChart3, BookOpenCheck, CheckCircle2, ClipboardCheck, LockKeyhole } from 'lucide-react';
import type { ExamLanguage } from '../data/partialExam';
import { AppHeader } from './AppChrome';

type Props = {
  darkMode: boolean;
  onToggleTheme: () => void;
  availableQuestions: number;
  studentName: string;
  setStudentName: (name: string) => void;
  onStart: () => void;
  language: ExamLanguage;
  onLanguageChange: (language: ExamLanguage) => void;
};

const content = {
  es: {
    eyebrow: 'Evaluación de progreso', title: 'Examen', titleAccent: 'Parcial',
    intro: 'Comprueba tu preparación en los módulos 1–9 de Vida, Salud y Accidentes bajo condiciones cronometradas.',
    questions: 'preguntas', minutes: 'minutos', diagnostic: 'diagnóstico final', evaluated: 'Contenido evaluado', moduleCount: '9 módulos',
    before: 'Antes de comenzar', simulate: 'Simula el momento real', student: 'Nombre del estudiante', placeholder: 'Escribe tu nombre completo', start: 'Iniciar examen parcial',
    privacy: 'Tu nombre y resultados permanecen en este dispositivo, salvo que descargues y compartas el reporte.',
    rules: ['El reloj comienza al iniciar y el examen se entrega al llegar a cero.', 'No verás respuestas ni explicaciones hasta terminar.', 'Podrás cambiar respuestas y marcar preguntas para revisar.', 'Recibirás un diagnóstico por dominio y prioridades de estudio.'],
    modules: [
      ['01', 'Vida', 'Tipos de pólizas de vida'], ['02', 'Provisiones', 'Cláusulas, opciones y exclusiones'], ['03', 'Solicitud', 'Suscripción y entrega'],
      ['04', 'Retiro', 'Anualidades e impuestos'], ['05', 'Salud', 'Tipos de pólizas de salud'], ['06', 'Salud', 'Provisiones y cláusulas'],
      ['07', 'Seguro social', 'Programas y beneficios'], ['08', 'Conceptos', 'Otros conceptos de seguros'], ['09', 'Suscripción', 'Procesos en campo'],
    ],
  },
  en: {
    eyebrow: 'Progress assessment', title: 'Partial', titleAccent: 'Exam',
    intro: 'Measure your readiness across Modules 1–9 of Life, Health, and Accident insurance under timed conditions.',
    questions: 'questions', minutes: 'minutes', diagnostic: 'final diagnostic', evaluated: 'Exam coverage', moduleCount: '9 modules',
    before: 'Before you begin', simulate: 'Practice under test conditions', student: 'Student name', placeholder: 'Enter your full name', start: 'Start partial exam',
    privacy: 'Your name and results remain on this device unless you download and share the report.',
    rules: ['The timer starts when you begin and the exam submits automatically at zero.', 'Answers and explanations remain hidden until you finish.', 'You can change answers and flag questions for review.', 'You will receive a domain-level diagnostic and study priorities.'],
    modules: [
      ['01', 'Life', 'Life insurance policy types'], ['02', 'Provisions', 'Riders, options, and exclusions'], ['03', 'Application', 'Underwriting and delivery'],
      ['04', 'Retirement', 'Annuities and taxation'], ['05', 'Health', 'Health insurance policy types'], ['06', 'Health', 'Policy provisions and riders'],
      ['07', 'Social Security', 'Programs and benefits'], ['08', 'Concepts', 'Other insurance concepts'], ['09', 'Underwriting', 'Field underwriting processes'],
    ],
  },
};

export function PartialExamLanding({ darkMode, onToggleTheme, availableQuestions, studentName, setStudentName, onStart, language, onLanguageChange }: Props) {
  const questionCount = Math.min(75, availableQuestions);
  const copy = content[language];

  return (
    <div className="app-shell partial-landing-shell">
      <AppHeader darkMode={darkMode} onToggleTheme={onToggleTheme} questionCount={availableQuestions} language={language} />
      <main className="partial-landing" id="main-content">
        <section className="partial-hero" lang={language}>
          <div className="partial-hero-copy">
            <div className="partial-kicker-row">
              <span className="eyebrow"><ClipboardCheck size={15} /> {copy.eyebrow}</span>
              <div className="language-toggle" role="group" aria-label="Language / Idioma">
                <button className={language === 'es' ? 'active' : ''} onClick={() => onLanguageChange('es')} aria-pressed={language === 'es'}>ES</button>
                <button className={language === 'en' ? 'active' : ''} onClick={() => onLanguageChange('en')} aria-pressed={language === 'en'}>EN</button>
              </div>
            </div>
            <h1>{copy.title} <em>{copy.titleAccent}</em></h1>
            <p>{copy.intro}</p>
            <div className="partial-facts" aria-label="Condiciones del examen">
              <span><strong>{questionCount}</strong> {copy.questions}</span>
              <span><strong>{questionCount}</strong> {copy.minutes}</span>
              <span><strong>1</strong> {copy.diagnostic}</span>
            </div>
          </div>
          <div className="partial-ticket" aria-hidden="true">
            <span>ALLEANZA ACADEMY</span>
            <strong>01—09</strong>
            <small>{language === 'en' ? 'LIFE · HEALTH · ACCIDENT' : 'VIDA · SALUD · ACCIDENTES'}</small>
          </div>
        </section>

        <div className="partial-layout">
          <section className="panel partial-modules">
            <div className="section-heading">
              <div><BookOpenCheck size={19} /><h2>{copy.evaluated}</h2></div>
              <span className="module-badge">{copy.moduleCount}</span>
            </div>
            <div className="module-rail">
              {copy.modules.map(([number, title, description]) => (
                <article key={number}>
                  <span>{number}</span>
                  <div><strong>{title}</strong><small>{description}</small></div>
                </article>
              ))}
            </div>
          </section>

          <aside className="panel partial-start-card">
            <span className="eyebrow">{copy.before}</span>
            <h2>{copy.simulate}</h2>
            <ul>
              <li><AlarmClock size={17} /><span>{copy.rules[0]}</span></li>
              <li><LockKeyhole size={17} /><span>{copy.rules[1]}</span></li>
              <li><CheckCircle2 size={17} /><span>{copy.rules[2]}</span></li>
              <li><BarChart3 size={17} /><span>{copy.rules[3]}</span></li>
            </ul>
            <label htmlFor="student-name">{copy.student}</label>
            <input
              id="student-name"
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
              placeholder={copy.placeholder}
              autoComplete="name"
            />
            <button className="primary partial-start-button" disabled={!studentName.trim() || questionCount === 0} onClick={onStart}>
              {copy.start} <ArrowRight size={18} />
            </button>
            <p className="privacy-note">{copy.privacy}</p>
          </aside>
        </div>
      </main>
    </div>
  );
}
