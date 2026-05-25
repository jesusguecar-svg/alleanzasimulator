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
  'Opcional: vuelve a tomar el examen simulado hasta mejorar tu puntuación.'
];

const advancedSteps = [
  'Toma primero un examen simulado completo.',
  'Revisa tus resultados por dominio.',
  'Enfócate en las áreas débiles.',
  'Practica esos dominios específicos.',
  'Vuelve a tomar el examen completo para confirmar mejora.'
];

export function OnboardingScreen(p: Props) {
  return (
    <div className='max-w-3xl mx-auto p-4 sm:p-6 space-y-4 text-slate-900 dark:text-slate-100'>
      {p.step === 'choice' ? (
        <section className='bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 sm:p-6 space-y-5'>
          <div className='space-y-2 text-center'>
            <h1 className='text-2xl sm:text-3xl font-bold'>¿Cómo quieres prepararte para el examen?</h1>
            <p className='text-sm sm:text-base text-slate-600 dark:text-slate-300'>
              Elige si prefieres configurar tu práctica por tu cuenta o seguir una ruta recomendada.
            </p>
          </div>

          <div className='grid gap-4'>
            <article className='rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3'>
              <h2 className='font-semibold text-lg'>Lo haré por mi cuenta</h2>
              <p className='text-sm text-slate-600 dark:text-slate-300'>
                Configura dominios, dificultad, cantidad de preguntas y temporizador manualmente.
              </p>
              <button onClick={p.onSelfGuided} className='w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 text-sm sm:text-base min-h-11'>
                Configurar mi práctica
              </button>
            </article>

            <article className='rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3'>
              <h2 className='font-semibold text-lg'>Usar ruta recomendada</h2>
              <p className='text-sm text-slate-600 dark:text-slate-300'>
                Te guiamos según tu nivel para estudiar con más estructura.
              </p>
              <button onClick={p.onRecommended} className='w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 text-sm sm:text-base min-h-11'>
                Ver ruta recomendada
              </button>
            </article>
          </div>
        </section>
      ) : (
        <section className='bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 sm:p-6 space-y-5'>
          <div className='space-y-2 text-center'>
            <h1 className='text-2xl sm:text-3xl font-bold'>¿Cuál describe mejor tu situación?</h1>
            <p className='text-sm sm:text-base text-slate-600 dark:text-slate-300'>
              Elige una ruta para empezar con una configuración recomendada.
            </p>
          </div>
          <div className='grid gap-4'>
            <article className='rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3'>
              <h2 className='font-semibold text-lg'>Principiante</h2>
              <p className='text-sm text-slate-600 dark:text-slate-300'>Ideal si no tienes licencia, es tu primera vez estudiando para este examen, o estás empezando desde cero.</p>
              <div className='text-sm text-slate-700 dark:text-slate-200'>
                <p className='font-semibold mb-1'>Ruta recomendada:</p>
                <ol className='list-decimal pl-5 space-y-1'>
                  {beginnerSteps.map((step) => <li key={step}>{step}</li>)}
                </ol>
              </div>
              <button onClick={() => p.onChooseLevel('beginner')} className='w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 text-sm sm:text-base min-h-11'>
                Comenzar como principiante
              </button>
            </article>

            <article className='rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3'>
              <h2 className='font-semibold text-lg'>Avanzado</h2>
              <p className='text-sm text-slate-600 dark:text-slate-300'>Ideal si ya estudiaste, tomaste el examen y fallaste, o si ya tienes experiencia en seguros, licencias similares, P&amp;C, casualty, life/health, etc.</p>
              <div className='text-sm text-slate-700 dark:text-slate-200'>
                <p className='font-semibold mb-1'>Ruta recomendada:</p>
                <ol className='list-decimal pl-5 space-y-1'>
                  {advancedSteps.map((step) => <li key={step}>{step}</li>)}
                </ol>
              </div>
              <button onClick={() => p.onChooseLevel('advanced')} className='w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 text-sm sm:text-base min-h-11'>
                Comenzar como avanzado
              </button>
            </article>
          </div>
          <div>
            <button onClick={p.onBackToChoice} className='text-sm underline text-blue-600 dark:text-blue-400'>← Volver</button>
          </div>
        </section>
      )}
    </div>
  );
}
