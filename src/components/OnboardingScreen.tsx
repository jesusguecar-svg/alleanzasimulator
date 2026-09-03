import { ArrowLeft, ArrowRight, BookOpenCheck, GraduationCap, Route, Settings2, Sparkles } from 'lucide-react';

type PathType = 'beginner' | 'advanced';

type Props = {
  step: 'choice' | 'level';
  onSelfGuided: () => void;
  onRecommended: () => void;
  onBackToChoice: () => void;
  onChooseLevel: (path: PathType) => void;
};

const beginnerSteps = [
  'Estudia el capítulo completo.',
  'Practica dominio por dominio después de estudiar cada capítulo.',
  'Cuando termines todos los dominios, toma un examen simulado completo.',
  'Revisa tus resultados.',
  'Enfócate en tus áreas débiles.',
  'Opcional: vuelve a tomar el examen simulado hasta mejorar tu puntuación.',
];

const advancedSteps = [
  'Toma primero un examen simulado completo.',
  'Revisa tus resultados por dominio.',
  'Enfócate en las áreas débiles.',
  'Practica esos dominios específicos.',
  'Vuelve a tomar el examen completo para confirmar mejora.',
];

export function OnboardingScreen(p: Props) {
  return (
    <main className="onboarding-main" id="main-content">
      <section className="onboarding-intro">
        <span className="eyebrow"><Sparkles size={14} /> Preparación personalizada</span>
        <h1>{p.step === 'choice' ? '¿Cómo quieres prepararte para el examen?' : '¿Cuál describe mejor tu situación?'}</h1>
        <p>{p.step === 'choice' ? 'Elige si prefieres configurar tu práctica por tu cuenta o seguir una ruta recomendada.' : 'Elige una ruta para empezar con una configuración recomendada.'}</p>
      </section>

      {p.step === 'choice' ? (
        <div className="path-grid">
          <article className="panel path-card">
            <div className="path-icon"><Settings2 size={25} /></div>
            <span className="path-number">01</span>
            <h2>Lo haré por mi cuenta</h2>
            <p>Configura dominios, dificultad, cantidad de preguntas y temporizador manualmente.</p>
            <button className="primary" onClick={p.onSelfGuided}>Configurar mi práctica <ArrowRight size={17} /></button>
          </article>
          <article className="panel path-card featured">
            <div className="path-icon"><Route size={25} /></div>
            <span className="path-number">02</span>
            <h2>Usar ruta recomendada</h2>
            <p>Te guiamos según tu nivel para estudiar con más estructura.</p>
            <button className="primary" onClick={p.onRecommended}>Ver ruta recomendada <ArrowRight size={17} /></button>
          </article>
        </div>
      ) : (
        <>
          <div className="path-grid level-grid">
            <article className="panel path-card level-card">
              <div className="path-icon"><BookOpenCheck size={25} /></div>
              <h2>Principiante</h2>
              <p>Ideal si no tienes licencia, es tu primera vez estudiando para este examen, o estás empezando desde cero.</p>
              <ol className="path-steps">{beginnerSteps.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}</ol>
              <button className="primary" onClick={() => p.onChooseLevel('beginner')}>Comenzar como principiante <ArrowRight size={17} /></button>
            </article>
            <article className="panel path-card level-card featured">
              <div className="path-icon"><GraduationCap size={25} /></div>
              <h2>Avanzado</h2>
              <p>Ideal si ya estudiaste, tomaste el examen y fallaste, o si ya tienes experiencia en seguros, licencias similares, P&amp;C, casualty, life/health, etc.</p>
              <ol className="path-steps">{advancedSteps.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}</ol>
              <button className="primary" onClick={() => p.onChooseLevel('advanced')}>Comenzar como avanzado <ArrowRight size={17} /></button>
            </article>
          </div>
          <button className="secondary onboarding-back" onClick={p.onBackToChoice}><ArrowLeft size={17} /> Volver</button>
        </>
      )}
    </main>
  );
}
