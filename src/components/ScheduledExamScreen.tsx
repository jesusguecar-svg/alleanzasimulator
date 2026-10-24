import { AlarmClock, ArrowLeft, ArrowRight, BookOpenCheck, CalendarClock, CheckCircle2, Laptop, LockKeyhole, MonitorX, NotebookPen, ShieldAlert, Smartphone, UserX, Volume2, Wifi } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ExamLanguage } from '../data/partialExam';
import type { ExamLines, ScheduledRegistration } from '../data/scheduledExam';
import { EXAM_QUESTION_COUNTS, examDurationMinutes, examSlots, formatSlotDay, formatSlotLabel, formatSlotTime, getSlot, getSlotState, SCHEDULE_DAYS, SLOT_START_WINDOW_MINUTES } from '../data/scheduledExam';
import { AppHeader } from './AppChrome';

type Props = {
  darkMode: boolean;
  onToggleTheme: () => void;
  registration: ScheduledRegistration | null;
  initialValues?: ScheduledRegistration | null;
  availableByLines: Record<ExamLines, number>;
  preview: boolean;
  onRegister: (registration: Omit<ScheduledRegistration, 'id' | 'registeredAt' | 'attempts'>) => void;
  onEdit: () => void;
  onStart: () => void;
};

const copy = {
  es: {
    eyebrow: 'Examen programado', title: 'Reserva tu', titleAccent: 'examen',
    intro: 'Elige el horario de este fin de semana en que tomarás el examen, el idioma y las líneas que quieres evaluar.',
    you: 'Tus datos', name: 'Nombre completo', namePlaceholder: 'Escribe tu nombre completo', email: 'Correo electrónico', emailPlaceholder: 'tu@correo.com',
    when: '¿Cuándo tomarás el examen?', whenHelp: `Horario del centro (CT). Puedes comenzar en cualquier momento dentro de los ${SLOT_START_WINDOW_MINUTES} minutos después de tu hora.`,
    full: 'Cerrado', language: 'Idioma del examen', lines: 'Líneas a evaluar',
    lineOptions: { both: ['Vida y Salud', 'Ambas líneas'], life: ['Solo Vida', 'Vida, anualidades y retiro'], health: ['Solo Salud', 'Salud, discapacidad y Medicare'] },
    questions: 'preguntas', minutes: 'minutos', register: 'Confirmar reserva',
    reserved: 'Reserva confirmada', reservedFor: 'Tu examen está programado para', change: 'Cambiar reserva',
    opensIn: 'El examen se habilita en', openNow: 'Tu horario está abierto', closesIn: 'Debes comenzar antes de que pasen', closed: 'Tu horario ya cerró. Comunícate con tu instructor para reprogramar.',
    continue: 'Continuar a las instrucciones', keepOpen: 'Puedes cerrar esta página y volver a la hora indicada desde este mismo dispositivo y navegador.',
    rulesEyebrow: 'Antes de comenzar', rulesTitle: 'Condiciones del examen', rulesIntro: 'Este examen simula las condiciones reales. Lee cada condición con atención.',
    rules: [
      [AlarmClock, 'Examen cronometrado', 'Tendrás {questions} preguntas y {minutes} minutos. El reloj no se detiene y el examen se entrega automáticamente al llegar a cero.'],
      [Smartphone, 'Sin teléfono', 'No se permite usar teléfonos, tabletas, relojes inteligentes ni otros dispositivos. Guárdalos fuera de tu alcance.'],
      [Laptop, 'Solo una computadora', 'Usa únicamente tu laptop o computadora, con el cargador conectado y una conexión a internet estable.'],
      [NotebookPen, 'Materiales permitidos', 'Solo bolígrafo y una libreta o papel en blanco para notas. Sin libros, apuntes, guías ni calculadoras externas.'],
      [UserX, 'Sin ayuda externa', 'No puedes recibir ayuda de otras personas, sitios web, buscadores ni herramientas de inteligencia artificial.'],
      [Volume2, 'Ambiente tranquilo', 'Ubícate solo, en un lugar silencioso, privado y bien iluminado, sin interrupciones.'],
      [MonitorX, 'No salgas de la pestaña', 'No cambies de pestaña ni de ventana. Cada salida queda registrada en el reporte que recibe tu instructor.'],
      [Wifi, 'Sin pausas', 'No podrás pausar. Si cierras o recargas la página, el intento se pierde y queda registrado. Ve al baño antes de comenzar.'],
    ],
    agree: 'He leído y acepto todas las condiciones. Entiendo que mis resultados se enviarán a mi instructor.',
    start: 'Comenzar examen ahora', back: 'Volver',
    done: 'Examen entregado', doneDetail: 'Ya entregaste este examen. Tu instructor recibió tus resultados.',
    previewNote: 'Modo de prueba: el horario no se aplica y el reporte se marca como PRUEBA.',
  },
  en: {
    eyebrow: 'Scheduled exam', title: 'Book your', titleAccent: 'exam',
    intro: 'Choose the time this weekend when you will take the exam, the language, and the lines you want to be tested on.',
    you: 'Your details', name: 'Full name', namePlaceholder: 'Enter your full name', email: 'Email', emailPlaceholder: 'you@email.com',
    when: 'When will you take the exam?', whenHelp: `Central Time (CT). You can begin any time within ${SLOT_START_WINDOW_MINUTES} minutes after your slot opens.`,
    full: 'Closed', language: 'Exam language', lines: 'Lines to be tested',
    lineOptions: { both: ['Life and Health', 'Both lines'], life: ['Life only', 'Life, annuities, and retirement'], health: ['Health only', 'Health, disability, and Medicare'] },
    questions: 'questions', minutes: 'minutes', register: 'Confirm booking',
    reserved: 'Booking confirmed', reservedFor: 'Your exam is scheduled for', change: 'Change booking',
    opensIn: 'The exam opens in', openNow: 'Your slot is open', closesIn: 'You must begin within', closed: 'Your slot has closed. Contact your instructor to reschedule.',
    continue: 'Continue to instructions', keepOpen: 'You can close this page and come back at your scheduled time on this same device and browser.',
    rulesEyebrow: 'Before you begin', rulesTitle: 'Exam conditions', rulesIntro: 'This exam simulates real testing conditions. Read each condition carefully.',
    rules: [
      [AlarmClock, 'Timed exam', 'You will have {questions} questions and {minutes} minutes. The clock does not stop, and the exam submits automatically at zero.'],
      [Smartphone, 'No phone', 'Phones, tablets, smartwatches, and other devices are not allowed. Keep them out of reach.'],
      [Laptop, 'Laptop only', 'Use only your laptop or computer, with the charger plugged in and a stable internet connection.'],
      [NotebookPen, 'Allowed materials', 'Only a pen and a blank notepad or paper for notes. No books, notes, study guides, or outside calculators.'],
      [UserX, 'No outside help', 'You may not receive help from other people, websites, search engines, or AI tools.'],
      [Volume2, 'Quiet environment', 'Be alone in a quiet, private, well-lit place with no interruptions.'],
      [MonitorX, 'Stay on this tab', 'Do not switch tabs or windows. Every time you leave is recorded in the report your instructor receives.'],
      [Wifi, 'No pauses', 'You cannot pause. If you close or reload the page, the attempt is lost and recorded. Use the restroom before you begin.'],
    ],
    agree: 'I have read and accept all of the conditions. I understand my results will be sent to my instructor.',
    start: 'Start exam now', back: 'Back',
    done: 'Exam submitted', doneDetail: 'You have already submitted this exam. Your instructor has received your results.',
    previewNote: 'Preview mode: the slot lock is skipped and the report is marked PREVIEW.',
  },
} as const;

const formatCountdown = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${hours > 0 ? `${hours}h ` : ''}${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export function ScheduledExamScreen({ darkMode, onToggleTheme, registration, initialValues, availableByLines, preview, onRegister, onEdit, onStart }: Props) {
  const seed = registration ?? initialValues;
  const [name, setName] = useState(seed?.name ?? '');
  const [email, setEmail] = useState(seed?.email ?? '');
  const [slotId, setSlotId] = useState(seed?.slotId ?? '');
  const [language, setLanguage] = useState<ExamLanguage>(seed?.language ?? 'es');
  const [lines, setLines] = useState<ExamLines>(seed?.lines ?? 'both');
  const [showRules, setShowRules] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const uiLanguage = registration?.language ?? language;
  const t = copy[uiLanguage];
  const questionCountFor = (value: ExamLines) =>
    availableByLines[value] >= EXAM_QUESTION_COUNTS[value] ? EXAM_QUESTION_COUNTS[value] : 0;
  const slotsByDay = useMemo(() => SCHEDULE_DAYS.map((day) => ({ day, slots: examSlots.filter((slot) => slot.id.startsWith(day)) })), []);

  const header = <AppHeader darkMode={darkMode} onToggleTheme={onToggleTheme} language={uiLanguage} />;

  if (registration?.submittedAt && !preview) {
    return (
      <div className="app-shell partial-landing-shell">
        {header}
        <main className="partial-landing scheduled-main" id="main-content">
          <section className="panel scheduled-status-card">
            <CheckCircle2 size={34} className="scheduled-status-icon" />
            <h1>{t.done}</h1>
            <p>{t.doneDetail}</p>
          </section>
        </main>
      </div>
    );
  }

  if (registration) {
    const slot = getSlot(registration.slotId);
    const state = preview ? 'open' : slot ? getSlotState(slot, now) : 'closed';
    const questionCount = questionCountFor(registration.lines);
    const minutes = examDurationMinutes(questionCount);
    const lineLabel = t.lineOptions[registration.lines][0];

    if (showRules && state === 'open') {
      return (
        <div className="app-shell partial-landing-shell">
          {header}
          <main className="partial-landing scheduled-main" id="main-content" lang={uiLanguage}>
            <section className="panel scheduled-rules">
              <span className="eyebrow"><ShieldAlert size={15} /> {t.rulesEyebrow}</span>
              <h1>{t.rulesTitle}</h1>
              <p className="scheduled-lead">{t.rulesIntro}</p>
              <ul className="scheduled-rule-list">
                {t.rules.map(([Icon, title, detail]) => (
                  <li key={title}>
                    <Icon size={20} />
                    <div><strong>{title}</strong><span>{detail.replace('{questions}', String(questionCount)).replace('{minutes}', String(minutes))}</span></div>
                  </li>
                ))}
              </ul>
              <label className="scheduled-agree">
                <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
                <span>{t.agree}</span>
              </label>
              <div className="scheduled-actions">
                <button className="secondary" onClick={() => setShowRules(false)}><ArrowLeft size={17} /> {t.back}</button>
                <button className="primary" disabled={!agreed || questionCount === 0} onClick={onStart}>{t.start} <ArrowRight size={18} /></button>
              </div>
            </section>
          </main>
        </div>
      );
    }

    return (
      <div className="app-shell partial-landing-shell">
        {header}
        <main className="partial-landing scheduled-main" id="main-content" lang={uiLanguage}>
          <section className="panel scheduled-status-card">
            <span className="eyebrow"><CalendarClock size={15} /> {t.reserved}</span>
            <h1>{registration.name}</h1>
            <p>{t.reservedFor} <strong>{slot ? formatSlotLabel(slot, uiLanguage) : registration.slotId}</strong></p>
            <div className="partial-facts scheduled-facts">
              <span><strong>{questionCount}</strong> {t.questions}</span>
              <span><strong>{minutes}</strong> {t.minutes}</span>
              <span><strong>{registration.language.toUpperCase()}</strong> {t.language}</span>
              <span><strong>{lineLabel}</strong></span>
            </div>
            {preview && <p className="scheduled-preview">{t.previewNote}</p>}
            <div className={`scheduled-countdown ${state}`}>
              {state === 'upcoming' && slot && <><LockKeyhole size={18} /><span>{t.opensIn}</span><strong>{formatCountdown(slot.startsAt - now)}</strong></>}
              {state === 'open' && <><CheckCircle2 size={18} /><span>{t.openNow}</span>{slot && !preview && <small>{t.closesIn} {formatCountdown(slot.endsAt - now)}</small>}</>}
              {state === 'closed' && <><AlarmClock size={18} /><span>{t.closed}</span></>}
            </div>
            <div className="scheduled-actions">
              <button className="secondary" onClick={onEdit}>{t.change}</button>
              <button className="primary" disabled={state !== 'open'} onClick={() => { setAgreed(false); setShowRules(true); }}>{t.continue} <ArrowRight size={18} /></button>
            </div>
            {state === 'upcoming' && <p className="privacy-note">{t.keepOpen}</p>}
          </section>
        </main>
      </div>
    );
  }

  const canRegister = name.trim().length > 1 && isValidEmail(email) && Boolean(slotId) && questionCountFor(lines) > 0;

  return (
    <div className="app-shell partial-landing-shell">
      {header}
      <main className="partial-landing scheduled-main" id="main-content" lang={uiLanguage}>
        <section className="partial-hero scheduled-hero">
          <div className="partial-hero-copy">
            <div className="partial-kicker-row">
              <span className="eyebrow"><CalendarClock size={15} /> {t.eyebrow}</span>
              <div className="language-toggle" role="group" aria-label="Language / Idioma">
                <button className={language === 'es' ? 'active' : ''} onClick={() => setLanguage('es')} aria-pressed={language === 'es'}>ES</button>
                <button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')} aria-pressed={language === 'en'}>EN</button>
              </div>
            </div>
            <h1>{t.title} <em>{t.titleAccent}</em></h1>
            <p>{t.intro}</p>
          </div>
        </section>

        <form className="scheduled-form" onSubmit={(event) => { event.preventDefault(); if (canRegister) onRegister({ name: name.trim(), email: email.trim(), slotId, language, lines }); }}>
          <section className="panel scheduled-section">
            <h2><span>01</span> {t.you}</h2>
            <div className="scheduled-fields">
              <label>{t.name}<input value={name} onChange={(event) => setName(event.target.value)} placeholder={t.namePlaceholder} autoComplete="name" required /></label>
              <label>{t.email}<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t.emailPlaceholder} autoComplete="email" required /></label>
            </div>
          </section>

          <section className="panel scheduled-section">
            <h2><span>02</span> {t.when}</h2>
            <p className="scheduled-help">{t.whenHelp}</p>
            {slotsByDay.map(({ day, slots }) => (
              <div key={day} className="slot-day">
                <h3>{slots[0] && formatSlotDay(slots[0], language)}</h3>
                <div className="slot-grid" role="radiogroup" aria-label={slots[0] && formatSlotDay(slots[0], language)}>
                  {slots.map((slot) => {
                    const closed = getSlotState(slot, now) === 'closed' && !preview;
                    return (
                      <button type="button" key={slot.id} role="radio" aria-checked={slotId === slot.id} disabled={closed}
                        className={`slot-button ${slotId === slot.id ? 'active' : ''}`} onClick={() => setSlotId(slot.id)}>
                        {formatSlotTime(slot, language)}{closed && <small>{t.full}</small>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>

          <section className="panel scheduled-section scheduled-split">
            <div>
              <h2><span>03</span> {t.language}</h2>
              <div className="choice-row" role="radiogroup" aria-label={t.language}>
                {(['es', 'en'] as const).map((value) => (
                  <button type="button" key={value} role="radio" aria-checked={language === value} className={`choice-card ${language === value ? 'active' : ''}`} onClick={() => setLanguage(value)}>
                    <strong>{value === 'es' ? 'Español' : 'English'}</strong><small>{value.toUpperCase()}</small>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2><span>04</span> {t.lines}</h2>
              <div className="choice-row" role="radiogroup" aria-label={t.lines}>
                {(['both', 'life', 'health'] as const).map((value) => (
                  <button type="button" key={value} role="radio" aria-checked={lines === value} className={`choice-card ${lines === value ? 'active' : ''}`} onClick={() => setLines(value)}>
                    <strong>{t.lineOptions[value][0]}</strong>
                    <small>{t.lineOptions[value][1]}</small>
                    <small><BookOpenCheck size={12} /> {questionCountFor(value)} {t.questions} · {examDurationMinutes(questionCountFor(value))} {t.minutes}</small>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <button type="submit" className="primary scheduled-submit" disabled={!canRegister}>{t.register} <ArrowRight size={18} /></button>
        </form>
      </main>
    </div>
  );
}
