import { ArrowLeft, BarChart3, CheckCircle2, CircleHelp, Target } from 'lucide-react';
import type { NormalizedQuestion } from '../types/question';
import { getDashboardStats } from '../utils/storage';

type Props = { allQuestions: NormalizedQuestion[]; onBack: () => void };

export function DashboardScreen({ allQuestions, onBack }: Props) {
  const stats = getDashboardStats(allQuestions);
  const domainRows = Object.entries(stats.byDomain)
    .map(([domain, values]) => ({
      domain,
      ...values,
      percent: values.total ? Math.round((values.correct / values.total) * 100) : 0,
    }))
    .sort((a, b) => a.percent - b.percent);
  const weakDomains = domainRows.filter((domain) => domain.percent < 70);

  return (
    <main className="results-main dashboard-main" id="main-content">
      <div className="results-heading">
        <div><span className="eyebrow">Progreso local</span><h1>Mis estadísticas</h1><p>Una vista acumulada de tus sesiones en este dispositivo.</p></div>
        <button className="secondary" onClick={onBack}><ArrowLeft size={17} /> Volver</button>
      </div>

      {stats.totalAnswered === 0 ? (
        <section className="panel empty-state"><CircleHelp size={34} /><h2>Aún no tienes sesiones registradas</h2><p>¡Completa tu primera práctica para ver tus estadísticas!</p></section>
      ) : (
        <>
          <section className="dashboard-score-grid">
            <div className="metric panel"><BarChart3 /><strong>{stats.totalAnswered}</strong><span>Respondidas</span></div>
            <div className="metric panel"><CheckCircle2 /><strong>{stats.totalCorrect}</strong><span>Correctas</span></div>
            <div className="metric panel"><Target /><strong>{stats.overallPercent}%</strong><span>Precisión general</span></div>
          </section>
          <section className="panel domain-results">
            <div className="section-heading"><div><h2>Desempeño por dominio</h2></div></div>
            <div className="domain-results-list">
              {domainRows.map((domain) => (
                <div key={domain.domain}>
                  <div className="domain-result-label"><span><strong>{domain.domain}</strong></span><span>{domain.correct}/{domain.total} · <strong>{domain.percent}%</strong></span></div>
                  <div className="bar"><span style={{ width: `${domain.percent}%` }} /></div>
                  <small className="attempts">{domain.attempts} intentos</small>
                </div>
              ))}
            </div>
          </section>
          <section className="next-mission panel">
            <div><span className="eyebrow">Enfoque recomendado</span><h2>{weakDomains.length ? 'Refuerza tus áreas débiles' : '¡Todos tus dominios superan el 70%!'}</h2></div>
            <p>{weakDomains.length ? <>Enfócate en estas áreas antes del examen: <strong>{weakDomains.map((domain) => domain.domain).join(', ')}</strong>.</> : '¡Excelente! Todos tus dominios superan el 70% de precisión.'}</p>
          </section>
        </>
      )}
    </main>
  );
}
