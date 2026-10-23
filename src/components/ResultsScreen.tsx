import { ArrowLeft, ArrowRight, BarChart3, BookOpenCheck, CheckCircle2, CircleHelp, Clock3, Download, FileText, Flame, Lightbulb, RotateCcw, Share2, Target, TriangleAlert, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { getPartialExamDomain } from '../data/partialExam';
import type { ExamLanguage } from '../data/partialExam';
import type { SessionQuestion } from '../types/question';
import { AppHeader } from './AppChrome';

type Props = {
  questions: SessionQuestion[];
  answers: Record<string, string>;
  elapsedSeconds: number;
  darkMode: boolean;
  onToggleTheme: () => void;
  onRetryMissed: () => void;
  onNew: () => void;
  onHome: () => void;
  mode?: 'practice' | 'partial-exam';
  studentName?: string;
  autoSubmitted?: boolean;
  language?: ExamLanguage;
  notice?: string;
};

type DomainStats = { total: number; correct: number; modules?: string; recommendation?: string };

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function motivationalMessage(percent: number): string {
  if (percent === 100) return '¡Perfecto! Dominas este bloque. 🔥';
  if (percent >= 85) return '¡Excelente progreso! Estás muy cerca del dominio total. 🚀';
  if (percent >= 70) return '¡Buen trabajo! Reforzar algunos temas te llevará al siguiente nivel. 💪';
  if (percent >= 50) return 'Vas por buen camino. Enfócate en tus áreas débiles para subir rápido. 📈';
  return 'Cada intento cuenta. Practica los errores y verás progreso inmediato. 🌱';
}

function bestStreak(questions: SessionQuestion[], answers: Record<string, string>) {
  let best = 0;
  let current = 0;
  for (const question of questions) {
    current = answers[question.id] === question.correctAnswer ? current + 1 : 0;
    best = Math.max(best, current);
  }
  return best;
}

function readinessDiagnosis(percent: number, language: ExamLanguage) {
  if (percent >= 85) return { title: language === 'en' ? 'Strong preparation' : 'Preparación sólida', detail: language === 'en' ? 'You are ready to move on to a full-length simulation. Keep your lowest-scoring domains fresh.' : 'Estás listo para avanzar a un simulacro completo. Mantén frescos los dominios con menor puntuación.', tone: 'strong' };
  if (percent >= 70) return { title: language === 'en' ? 'Good foundation with specific gaps' : 'Buen nivel, con brechas específicas', detail: language === 'en' ? 'Your foundation is functional. Targeted review can turn weaker areas into reliable points.' : 'Tu base es funcional. Un repaso dirigido puede convertir tus áreas débiles en puntos seguros.', tone: 'developing' };
  return { title: language === 'en' ? 'Reinforcement needed before your next attempt' : 'Necesitas refuerzo antes del próximo intento', detail: language === 'en' ? 'Return to the fundamentals and practice by domain before repeating the partial exam.' : 'Conviene volver a los fundamentos y practicar por dominio antes de repetir el examen parcial.', tone: 'priority' };
}

function domainStatus(percent: number, language: ExamLanguage) {
  if (percent >= 80) return { label: language === 'en' ? 'Strength' : 'Fortaleza', className: 'strong' };
  if (percent >= 70) return { label: language === 'en' ? 'Developing' : 'En desarrollo', className: 'developing' };
  return { label: language === 'en' ? 'Priority' : 'Prioridad', className: 'priority' };
}

export function ResultsScreen({ questions, answers, elapsedSeconds, darkMode, onToggleTheme, onRetryMissed, onNew, onHome, mode = 'practice', studentName, autoSubmitted = false, language = 'es', notice }: Props) {
  const [tab, setTab] = useState<'summary' | 'review'>('summary');
  const [reviewIndex, setReviewIndex] = useState(0);
  const correct = questions.filter((question) => answers[question.id] === question.correctAnswer);
  const unanswered = questions.filter((question) => !answers[question.id]);
  const incorrect = questions.filter((question) => answers[question.id] && answers[question.id] !== question.correctAnswer);
  const missed = questions.length - correct.length;
  const percent = Math.round((correct.length / questions.length) * 100) || 0;
  const streak = bestStreak(questions, answers);

  const isPartialExam = mode === 'partial-exam';
  const english = language === 'en';
  const diagnosis = readinessDiagnosis(percent, language);

  const byDomain = questions.reduce<Record<string, DomainStats>>((accumulator, question) => {
    const examDomain = isPartialExam ? getPartialExamDomain(question, language) : undefined;
    const domainLabel = examDomain?.label ?? question.domain;
    const bucket = accumulator[domainLabel] ?? { total: 0, correct: 0, modules: examDomain?.modules, recommendation: examDomain?.recommendation };
    bucket.total += 1;
    if (answers[question.id] === question.correctAnswer) bucket.correct += 1;
    accumulator[domainLabel] = bucket;
    return accumulator;
  }, {});

  const rankedDomains = Object.entries(byDomain).sort(([, left], [, right]) => (left.correct / left.total) - (right.correct / right.total));

  const selectedQuestion = questions[reviewIndex];
  const selectedAnswer = selectedQuestion ? answers[selectedQuestion.id] : undefined;

  const exportReport = (format: 'csv' | 'json') => {
    const report = {
      title: isPartialExam ? english ? 'Alleanza Academy — Partial Exam Report' : 'Alleanza Academy — Reporte de Examen Parcial' : 'Alleanza Academy — Reporte de práctica',
      generatedAt: new Date().toLocaleString(),
      student: studentName || (english ? 'Not provided' : 'No indicado'),
      assessment: isPartialExam ? english ? 'Partial Exam — Modules 1–9' : 'Examen Parcial — Módulos 1–9' : 'Práctica personalizada',
      score: `${percent}%`, correct: correct.length, incorrect: incorrect.length, unanswered: unanswered.length, total: questions.length, elapsed: formatTime(elapsedSeconds),
      diagnosis: isPartialExam ? diagnosis.title : motivationalMessage(percent),
      domains: rankedDomains.map(([domain, stats]) => ({ domain, modules: stats.modules, correct: stats.correct, total: stats.total, percent: Math.round((stats.correct / stats.total) * 100) || 0, recommendation: stats.recommendation })),
      responses: questions.map((question, index) => ({ number: index + 1, domain: getPartialExamDomain(question, language)?.label ?? question.domain, question: question.question, selectedAnswer: answers[question.id] ?? (english ? 'Unanswered' : 'Sin contestar'), correctAnswer: question.correctAnswer, correct: answers[question.id] === question.correctAnswer })),
    };
    const csvEscape = (value: string | number | boolean) => `"${String(value).replace(/"/g, '""')}"`;
    const content = format === 'json' ? JSON.stringify(report, null, 2) : [english ? 'Number,Domain,Question,Student answer,Correct answer,Correct' : 'Número,Dominio,Pregunta,Respuesta del estudiante,Respuesta correcta,Correcta', ...report.responses.map((row) => [row.number, row.domain, row.question, row.selectedAnswer, row.correctAnswer, row.correct ? english ? 'Yes' : 'Sí' : english ? 'No' : 'No'].map(csvEscape).join(','))].join('\n');
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `alleanza-resultados-${new Date().toISOString().slice(0, 10)}.${format}`; link.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="app-shell results-shell">
      <AppHeader darkMode={darkMode} onToggleTheme={onToggleTheme} onHome={onHome} language={language} />
      <main className="results-main" id="main-content">
        <div className="results-heading">
          <div>
            <span className="eyebrow">{isPartialExam ? english ? 'Partial exam completed' : 'Examen parcial completado' : english ? 'Session completed' : 'Sesión completada'}</span>
            <h1>{isPartialExam ? `${english ? 'Diagnostic' : 'Diagnóstico'}${studentName ? ` ${english ? 'for' : 'de'} ${studentName}` : ''}` : english ? 'Your scorecard' : 'Tu scoreboard'}</h1>
            <p>{autoSubmitted ? english ? 'Time expired and your answers were submitted automatically.' : 'El tiempo terminó y tus respuestas fueron entregadas automáticamente.' : isPartialExam ? diagnosis.detail : motivationalMessage(percent)}</p>
            {notice && <p className="results-notice" role="status">{notice}</p>}
          </div>
          <div className="results-actions"><button className="secondary" onClick={() => window.print()}><FileText size={17} /> {english ? 'Save / print PDF' : 'Guardar / imprimir PDF'}</button><button className="primary" onClick={onNew}><RotateCcw size={18} /> {english ? 'New exam' : 'Nueva sesión'}</button></div>
        </div>

        <div className="tabs" role="tablist" aria-label="Resultados">
          <button role="tab" aria-selected={tab === 'summary'} className={tab === 'summary' ? 'active' : ''} onClick={() => setTab('summary')}><BarChart3 size={17} /> {english ? 'Summary' : 'Resumen'}</button>
          <button role="tab" aria-selected={tab === 'review'} className={tab === 'review' ? 'active' : ''} onClick={() => setTab('review')}><BookOpenCheck size={17} /> {english ? 'Review answers' : 'Revisar respuestas'}</button>
        </div>

        {tab === 'summary' ? (
          <>
            <section className="score-grid">
              <div className={`score-hero panel ${isPartialExam ? `diagnosis-${diagnosis.tone}` : ''}`}>
                <div className="score-ring" style={{ '--score': `${percent * 3.6}deg` } as CSSProperties}>
                  <div><strong>{percent}%</strong><span>{english ? 'score' : 'resultado'}</span></div>
                </div>
                <div><h2>{isPartialExam ? diagnosis.title : percent >= 75 ? 'Buen dominio general' : 'Hay áreas por reforzar'}</h2><p>{correct.length}/{questions.length} {english ? 'correct answers.' : 'respuestas correctas.'}</p></div>
              </div>
              <div className="metric panel"><CheckCircle2 /><strong>{correct.length}</strong><span>{english ? 'Correct' : 'Correctas'}</span></div>
              <div className="metric panel"><XCircle /><strong>{incorrect.length}</strong><span>{english ? 'Incorrect' : 'Incorrectas'}</span></div>
              <div className="metric panel"><CircleHelp /><strong>{unanswered.length}</strong><span>{english ? 'Unanswered' : 'Sin contestar'}</span></div>
              <div className="metric panel"><Clock3 /><strong>{formatTime(elapsedSeconds)}</strong><span>{english ? 'Time used' : 'Tiempo utilizado'}</span></div>
            </section>

            <section className={`panel domain-results ${isPartialExam ? 'diagnostic-domain-results' : ''}`}>
              <div className="section-heading"><div><h2>{isPartialExam ? english ? 'Domain analysis' : 'Análisis por dominio' : english ? 'Performance by domain' : 'Desempeño por dominio'}</h2></div><span className="streak"><Flame size={16} /> {english ? 'Best streak' : 'Mejor racha'}: <strong>{streak}</strong></span></div>
              <div className="domain-results-list">
                {rankedDomains.map(([domain, stats]) => {
                  const domainPercent = Math.round((stats.correct / stats.total) * 100) || 0;
                  const status = domainStatus(domainPercent, language);
                  return (
                    <div key={domain} className="domain-diagnostic">
                      <div className="domain-result-label">
                        <span><strong>{domain}</strong>{stats.modules && <small>{stats.modules}</small>}</span>
                        <span>{stats.correct}/{stats.total} · <strong>{domainPercent}%</strong>{isPartialExam && <i className={`status-pill ${status.className}`}>{status.label}</i>}</span>
                      </div>
                      <div className="bar"><span style={{ width: `${domainPercent}%` }} /></div>
                      {isPartialExam && stats.recommendation && domainPercent < 80 && <p><Lightbulb size={14} /> {stats.recommendation}</p>}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="next-mission panel">
              <div><h2>{isPartialExam ? english ? 'Plan before your next exam' : 'Plan antes del próximo examen' : english ? 'Next mission' : 'Siguiente misión'}</h2></div>
              {missed === 0 ? (
                <p>{english ? 'No mistakes! Try a longer session or increase the difficulty to maintain momentum.' : '¡Sin errores! Intenta una sesión más larga o sube la dificultad para mantener el ritmo.'}</p>
              ) : isPartialExam ? (
                <ul className="mission-list">
                  <li><Target size={15} /> {english ? <>Begin with your lowest-scoring <strong>Priority</strong> domain.</> : <>Empieza por el dominio marcado como <strong>Prioridad</strong> con menor puntuación.</>}</li>
                  <li><BookOpenCheck size={15} /> {english ? 'Study its concepts, then complete a short practice session with explanations enabled.' : 'Estudia sus conceptos y completa una práctica corta con explicaciones activadas.'}</li>
                  <li><TriangleAlert size={15} /> {english ? 'Review missed questions and write down why each distractor was incorrect.' : 'Revisa las preguntas falladas y anota por qué cada distractor era incorrecto.'}</li>
                  <li><Clock3 size={15} /> {english ? 'Repeat this exam after reaching at least 80% in each domain practice.' : 'Repite este examen cuando alcances al menos 80% en tus prácticas por dominio.'}</li>
                </ul>
              ) : (
                <ul className="mission-list">
                  <li>Reintenta solo las falladas para consolidar memoria activa.</li>
                  <li>Prioriza los dominios con porcentaje más bajo.</li>
                  <li>Activa &quot;Ver la explicación después de cada respuesta&quot; para aprender mientras practicas.</li>
                </ul>
              )}
              {missed > 0 && <button className="secondary" onClick={onRetryMissed}><RotateCcw size={17} /> {isPartialExam ? english ? 'Practice missed questions' : 'Practicar las falladas' : english ? 'Retry missed questions' : 'Reintentar falladas'}</button>}
            </section>
            <section className="export-panel panel">
              <div><span className="eyebrow">{english ? 'Study tracking' : 'Control de estudio'}</span><h2>{english ? 'Save your result and share it with your instructor' : 'Guarda tu resultado y compártelo con tu instructor'}</h2><p>{english ? 'The report includes your overall score, domain diagnostic, and responses to guide your next tutoring session.' : 'El reporte incluye tu resultado general, diagnóstico por dominio y respuestas para orientar tu próxima tutoría.'}</p></div>
              <div className="export-actions"><button className="secondary" onClick={() => exportReport('csv')}><Download size={17} /> {english ? 'Export CSV' : 'Exportar CSV'}</button><button className="secondary" onClick={() => exportReport('json')}><Share2 size={17} /> {english ? 'Export report' : 'Exportar reporte'}</button></div>
            </section>
          </>
        ) : selectedQuestion && (
          <section className="review-layout">
            <aside className="review-list" aria-label="Lista de preguntas">
              {questions.map((question, index) => {
                const answer = answers[question.id];
                const isCorrect = answer === question.correctAnswer;
                return (
                  <button key={question.id} className={`${index === reviewIndex ? 'active' : ''} ${isCorrect ? 'correct' : 'wrong'}`} onClick={() => setReviewIndex(index)}>
                    <span>{index + 1}</span>
                    <div><strong>{getPartialExamDomain(question, language)?.label ?? question.domain}</strong><small>{isCorrect ? english ? 'Correct' : 'Correcta' : answer ? english ? 'Incorrect' : 'Incorrecta' : english ? 'Unanswered' : 'Sin contestar'}</small></div>
                    {isCorrect ? <CheckCircle2 size={17} /> : <XCircle size={17} />}
                  </button>
                );
              })}
            </aside>
            <article className="panel review-card">
              <div className="question-meta"><span className="domain-tag">{getPartialExamDomain(selectedQuestion, language)?.label ?? selectedQuestion.domain}</span>{selectedQuestion.subdomain && <span>{selectedQuestion.subdomain}</span>}</div>
              <h2>{selectedQuestion.question}</h2>
              <div className="review-options">
                {selectedQuestion.options.map((option, index) => {
                  const isCorrect = option === selectedQuestion.correctAnswer;
                  const wasSelected = option === selectedAnswer;
                  return (
                    <div key={option} className={`${isCorrect ? 'correct' : ''} ${wasSelected && !isCorrect ? 'wrong' : ''}`}>
                      <span>{String.fromCharCode(65 + index)}</span>
                      <div><strong>{option}</strong>{selectedQuestion.optionExplanations?.[option] && <p>{selectedQuestion.optionExplanations[option]}</p>}</div>
                      {isCorrect && <CheckCircle2 size={19} />}{wasSelected && !isCorrect && <XCircle size={19} />}
                    </div>
                  );
                })}
              </div>
              {selectedQuestion.explanation && <div className="explanation"><div><CircleHelp size={19} /><strong>{english ? 'Explanation' : 'Explicación'}</strong></div><p>{selectedQuestion.explanation}</p>{selectedQuestion.citation && <small>{selectedQuestion.citation}</small>}</div>}
              <div className="review-nav">
                <button className="secondary" disabled={reviewIndex === 0} onClick={() => setReviewIndex(reviewIndex - 1)}><ArrowLeft size={17} /> {english ? 'Previous' : 'Anterior'}</button>
                <span>{reviewIndex + 1} {english ? 'of' : 'de'} {questions.length}</span>
                <button className="secondary" disabled={reviewIndex === questions.length - 1} onClick={() => setReviewIndex(reviewIndex + 1)}>{english ? 'Next' : 'Siguiente'} <ArrowRight size={17} /></button>
              </div>
            </article>
          </section>
        )}
      </main>
    </div>
  );
}
