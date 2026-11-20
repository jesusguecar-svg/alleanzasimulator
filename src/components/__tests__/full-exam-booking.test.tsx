import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FULL_EXAM_REGISTRATION_KEY } from '../../data/fullExamPlan';
import { FullExamBooking } from '../FullExamBooking';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

const renderExam = () => render(<FullExamBooking darkMode={false} onToggleTheme={vi.fn()} />);

const acceptAndStart = () => {
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: /Comenzar examen ahora/i }));
};

describe('full exam open access', () => {
  it('starts from the production page without a reservation or date', () => {
    renderExam();

    expect(screen.queryByRole('heading', { name: /Cuándo tomarás el examen/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/9 de noviembre|15 de noviembre|noviembre de 2026/i)).not.toBeInTheDocument();
    expect(screen.getByText(/cualquier día y a cualquier hora/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Cynthia Eskenazi' } });
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'cynthia@example.com' } });
    fireEvent.click(screen.getByRole('radio', { name: /Florida/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Continuar/ }));

    expect(screen.getByRole('heading', { name: 'Condiciones del examen' })).toBeInTheDocument();
    acceptAndStart();

    const saved = JSON.parse(localStorage.getItem(FULL_EXAM_REGISTRATION_KEY) || 'null');
    expect(saved).toMatchObject({
      name: 'Cynthia Eskenazi',
      email: 'cynthia@example.com',
      slotId: 'acceso-libre',
      slotLabel: 'Acceso libre',
      language: 'es',
      lines: 'both',
      state: 'FL',
      minutes: 150,
      ready: true,
    });
    expect(saved.submittedAt).toBeUndefined();
  });

  it('opens a saved reservation whose hour has already closed', () => {
    localStorage.setItem(FULL_EXAM_REGISTRATION_KEY, JSON.stringify({
      id: 'past-slot',
      name: 'Cynthia Eskenazi',
      email: 'cynthia@example.com',
      slotId: '2026-11-15T07',
      language: 'es',
      lines: 'both',
      registeredAt: 1,
      attempts: 1,
      state: 'TX',
      generalCount: 100,
      stateCount: 50,
      minutes: 150,
      generalModules: null,
      stateModules: null,
      slotLabel: 'domingo, 15 de noviembre · 7:00 a.m. CT',
    }));

    renderExam();

    expect(screen.queryByText(/Tu horario ya cerró/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Puedes comenzar ahora/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continuar a las instrucciones/i })).toBeEnabled();
  });

  it('lets a student who already submitted start another attempt', () => {
    localStorage.setItem(FULL_EXAM_REGISTRATION_KEY, JSON.stringify({
      id: 'submitted',
      name: 'Cynthia Eskenazi',
      email: 'cynthia@example.com',
      slotId: '2026-11-15T07',
      language: 'es',
      lines: 'life',
      registeredAt: 1,
      attempts: 1,
      submittedAt: 2,
      state: 'TX',
      generalCount: 50,
      stateCount: 30,
      minutes: 120,
      generalModules: ['M1'],
      stateModules: ['TC'],
      slotLabel: 'domingo, 15 de noviembre · 7:00 a.m. CT',
    }));

    renderExam();

    fireEvent.click(screen.getByRole('button', { name: /Tomar de nuevo/i }));
    expect(screen.queryByRole('heading', { name: /Cuándo tomarás el examen/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Tu horario ya cerró/i)).not.toBeInTheDocument();
    expect(localStorage.getItem(FULL_EXAM_REGISTRATION_KEY)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /^Continuar/ }));
    expect(screen.getByRole('heading', { name: 'Condiciones del examen' })).toBeInTheDocument();
    acceptAndStart();
    const saved = JSON.parse(localStorage.getItem(FULL_EXAM_REGISTRATION_KEY) || 'null');
    expect(saved).toMatchObject({
      name: 'Cynthia Eskenazi',
      slotId: 'acceso-libre',
      slotLabel: 'Acceso libre',
      lines: 'life',
      minutes: 120,
      ready: true,
    });
    expect(saved.submittedAt).toBeUndefined();
  });
});
