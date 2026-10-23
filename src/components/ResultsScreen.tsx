import { ArrowLeft, ArrowRight, BarChart3, BookOpenCheck, CheckCircle2, CircleHelp, Clock3, Download, FileText, Flame, Lightbulb, RotateCcw, Share2, Target, TriangleAlert, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { getPartialExamDomain } from '../data/partialExam';
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

function readinessDiagnosis(percent: number) {
  if (percent >= 85) return { title: 'Preparación sólida', detail: 'Estás listo para avanzar a un simulacro completo. Mantén frescos los dominios con menor puntuación.', tone: 'strong' };
  if (percent >= 70) return { title: 'Buen nivel, con brechas específicas', detail: 'Tu base es funcional. Un repaso dirigido puede convertir tus áreas débiles en puntos seguros.', tone: 'developing' };
  return { title: 'Necesitas refuerzo antes del próximo intento', detail: 'Conviene volver a los fundamentos y practicar por dominio antes de repetir el examen parcial.', tone: 'priority' };
}

function domainStatus(percent: number) {
  if (percent >= 80) return { label: 'Fortaleza', className: 'strong' };
  if (percent >= 70) return { label: 'En desarrollo', className: 'developing' };
  return { label: 'Prioridad', className: 'priority' };
}

export function ResultsScreen({ questions, answers, elapsedSeconds, darkMode, onToggleTheme, onRetryMissed, onNew, onHome, mode = 'practice', studentName, autoSubmitted = false }: Props) {
  const [tab, setTab] = useState<'summary' | 'review'>('summary');
  const [reviewIndex, setReviewIndex] = useState(0);
  const correct = questions.filter((question) => answers[question.id] === question.correctAnswer);
  const unanswered = questions.filter((question) => !answers[question.id]);
  const incorrect = questions.filter((question) => answers[question.id] && answers[question.id] !== question.correctAnswer);
  const missed = questions.length - correct.length;
  const percent = Math.round((correct.length / questions.length) * 100) || 0;
  const streak = bestStreak(questions, answers);

  const isPartialExam = mode === 'partial-exam';
  const diagnosis = readinessDiagnosis(percent);

  const byDomain = questions.reduce<Record<string, DomainStats>>((accumulator, question) => {
    const examDomain = isPartialExam ? getPartialExamDomain(question) : undefined;
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
      title: isPartialExam ? 'Alleanza Academy — Reporte de Examen Parcial' : 'Alleanza Academy — Reporte de práctica',
      generatedAt: new Date().toLocaleString(),
      student: studentName || 'No indicado',
      assessment: isPartialExam ? 'Examen Parcial — Módulos 1–9' : 'Práctica personalizada',
      score: `${percent}%`, correct: correct.length, incorrect: incorrect.length, unanswered: unanswered.length, total: questions.length, elapsed: formatTime(elapsedSeconds),
      diagnosis: isPartialExam ? diagnosis.title : motivationalMessage(percent),
      domains: rankedDomains.map(([domain, stats]) => ({ domain, modules: stats.modules, correct: stats.correct, total: stats.total, percent: Math.round((stats.correct / stats.total) * 100) || 0, recommendation: stats.recommendation })),
      responses: questions.map((question, index) => ({ number: index + 1, domain: question.domain, question: question.question, selectedAnswer: answers[question.id] ?? 'Sin contestar', correctAnswer: question.correctAnswer, correct: answers[question.id] === question.correctAnswer })),
    };
    const csvEscape = (value: string | number | boolean) => `"${String(value).replace(/"/g, '""')}"`;
    const content = format === 'json' ? JSON.stringify(report, null, 2) : ['Número,Dominio,Pregunta,Respuesta del estudiante,Respuesta correcta,Correcta', ...report.responses.map((row) => [row.number, row.domain, row.question, row.selectedAnswer, row.correctAnswer, row.correct ? 'Sí' : 'No'].map(csvEscape).join(','))].join('\n');
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `alleanza-resultados-${new Date().toISOString().slice(0, 10)}.${format}`; link.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="app-shell results-shell">
      <AppHeader darkMode={darkMode} onToggleTheme={onToggleTheme} onHome={onHome} />
      <main className="results-main" id="main-content">
        <div className="results-heading">
          <div>
            <span className="eyebrow">{isPartialExam ? 'Examen parcial completado' : 'Sesión completada'}</span>
            <h1>{isPartialExam ? `Diagnóstico${studentName ? ` de ${studentName}` : ''}` : 'Tu scoreboard'}</h1>
            <p>{autoSubmitted ? 'El tiempo terminó y tus respuestas fueron entregadas automáticamente.' : isPartialExam ? diagnosis.detail : motivationalMessage(percent)}</p>
          </div>
          <div className="results-actions"><button className="secondary" onClick={() => window.print()}><FileText size={17} /> Guardar / imprimir PDF</button><button className="primary" onClick={onNew}><RotateCcw size={18} /> Nueva sesión</button></div>
        </div>

        <div className="tabs" role="tablist" aria-label="Resultados">
          <button role="tab" aria-selected={tab === 'summary'} className={tab === 'summary' ? 'active' : ''} onClick={() => setTab('summary')}><BarChart3 size={17} /> Resumen</button>
          <button role="tab" aria-selected={tab === 'review'} className={tab === 'review' ? 'active' : ''} onClick={() => setTab('review')}><BookOpenCheck size={17} /> Revisar respuestas</button>
        </div>

        {tab === 'summary' ? (
          <>
            <section className="score-grid">
              <div className={`score-hero panel ${isPartialExam ? `diagnosis-${diagnosis.tone}` : ''}`}>
                <div className="score-ring" style={{ '--score': `${percent * 3.6}deg` } as CSSProperties}>
                  <div><strong>{percent}%</strong><span>resultado</span></div>
                </div>
                <div><h2>{isPartialExam ? diagnosis.title : percent >= 75 ? 'Buen dominio general' : 'Hay áreas por reforzar'}</h2><p>{correct.length}/{questions.length} respuestas correctas.</p></div>
              </div>
              <div className="metric panel"><CheckCircle2 /><strong>{correct.length}</strong><span>Correctas</span></div>
              <div className="metric panel"><XCircle /><strong>{incorrect.length}</strong><span>Incorrectas</span></div>
              <div className="metric panel"><CircleHelp /><strong>{unanswered.length}</strong><span>Sin contestar</span></div>
              <div className="metric panel"><Clock3 /><strong>{formatTime(elapsedSeconds)}</strong><span>Tiempo utilizado</span></div>
            </section>

            <section className={`panel domain-results ${isPartialExam ? 'diagnostic-domain-results' : ''}`}>
              <div className="section-heading"><div><h2>{isPartialExam ? 'Análisis por dominio' : 'Desempeño por dominio'}</h2></div><span className="streak"><Flame size={16} /> Mejor racha: <strong>{streak}</strong></span></div>
              <div className="domain-results-list">
                {rankedDomains.map(([domain, stats]) => {
                  const domainPercent = Math.round((stats.correct / stats.total) * 100) || 0;
                  const status = domainStatus(domainPercent);
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
              <div><h2>{isPartialExam ? 'Plan antes del próximo examen' : 'Siguiente misión'}</h2></div>
              {missed === 0 ? (
                <p>¡Sin errores! Intenta una sesión más larga o sube la dificultad para mantener el ritmo.</p>
              ) : isPartialExam ? (
                <ul className="mission-list">
                  <li><Target size={15} /> Empieza por el dominio marcado como <strong>Prioridad</strong> con menor puntuación.</li>
                  <li><BookOpenCheck size={15} /> Estudia sus conceptos y completa una práctica corta con explicaciones activadas.</li>
                  <li><TriangleAlert size={15} /> Revisa las preguntas falladas y anota por qué cada distractor era incorrecto.</li>
                  <li><Clock3 size={15} /> Repite este examen cuando alcances al menos 80% en tus prácticas por dominio.</li>
                </ul>
              ) : (
                <ul className="mission-list">
                  <li>Reintenta solo las falladas para consolidar memoria activa.</li>
                  <li>Prioriza los dominios con porcentaje más bajo.</li>
                  <li>Activa &quot;Ver la explicación después de cada respuesta&quot; para aprender mientras practicas.</li>
                </ul>
              )}
              {missed > 0 && <button className="secondary" onClick={onRetryMissed}><RotateCcw size={17} /> {isPartialExam ? 'Practicar las falladas' : 'Reintentar falladas'}</button>}
            </section>
            <section className="export-panel panel">
              <div><span className="eyebrow">Control de estudio</span><h2>Guarda tu resultado y compártelo con tu instructor</h2><p>El reporte incluye tu resultado general, diagnóstico por dominio y respuestas para orientar tu próxima tutoría.</p></div>
              <div className="export-actions"><button className="secondary" onClick={() => exportReport('csv')}><Download size={17} /> Exportar CSV</button><button className="secondary" onClick={() => exportReport('json')}><Share2 size={17} /> Exportar reporte</button></div>
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
                    <div><strong>{question.domain}</strong><small>{isCorrect ? 'Correcta' : answer ? 'Incorrecta' : 'Sin contestar'}</small></div>
                    {isCorrect ? <CheckCircle2 size={17} /> : <XCircle size={17} />}
                  </button>
                );
              })}
            </aside>
            <article className="panel review-card">
              <div className="question-meta"><span className="domain-tag">{selectedQuestion.domain}</span>{selectedQuestion.subdomain && <span>{selectedQuestion.subdomain}</span>}</div>
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
              {selectedQuestion.explanation && <div className="explanation"><div><CircleHelp size={19} /><strong>Explicación</strong></div><p>{selectedQuestion.explanation}</p>{selectedQuestion.citation && <small>{selectedQuestion.citation}</small>}</div>}
              <div className="review-nav">
                <button className="secondary" disabled={reviewIndex === 0} onClick={() => setReviewIndex(reviewIndex - 1)}><ArrowLeft size={17} /> Anterior</button>
                <span>{reviewIndex + 1} de {questions.length}</span>
                <button className="secondary" disabled={reviewIndex === questions.length - 1} onClick={() => setReviewIndex(reviewIndex + 1)}>Siguiente <ArrowRight size={17} /></button>
              </div>
            </article>
          </section>
        )}
      </main>
    </div>
  );
}
