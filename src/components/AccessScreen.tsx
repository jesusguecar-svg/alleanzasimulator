import { FormEvent, useState } from 'react';

type AccessScreenProps = {
  darkMode: boolean;
  setDarkMode: (value: boolean | ((current: boolean) => boolean)) => void;
};

export function AccessScreen({ darkMode, setDarkMode }: AccessScreenProps) {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(undefined);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        setMessage(typeof data.message === 'string' ? data.message : 'Unable to unlock the simulator.');
        return;
      }

      window.location.assign('/');
    } catch {
      setMessage('Unable to reach the access service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center px-4 py-8'>
      <div className='w-full max-w-md space-y-4'>
        <div className='flex justify-end'>
          <button
            type='button'
            onClick={() => setDarkMode((value) => !value)}
            className='rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm'
          >
            {darkMode ? '🌙 Oscuro' : '🌞 Claro'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className='bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8 space-y-5'>
          <div className='space-y-2'>
            <p className='text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide'>Acceso privado</p>
            <h1 className='text-2xl sm:text-3xl font-bold'>Simulador protegido</h1>
            <p className='text-sm sm:text-base text-slate-600 dark:text-slate-300'>Ingresa la contraseña compartida por el propietario para continuar.</p>
          </div>

          <label className='block space-y-2'>
            <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>Contraseña</span>
            <input
              autoComplete='current-password'
              autoFocus
              className='w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-blue-500'
              onChange={(event) => setPassword(event.target.value)}
              type='password'
              value={password}
            />
          </label>

          {message && <p className='rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-200'>{message}</p>}

          <button
            type='submit'
            disabled={isSubmitting || password.length === 0}
            className={`w-full rounded-xl px-4 py-3 text-sm sm:text-base min-h-11 text-white ${isSubmitting || password.length === 0 ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSubmitting ? 'Verificando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
