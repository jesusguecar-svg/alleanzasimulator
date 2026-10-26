import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScheduledExamScreen } from '../ScheduledExamScreen';

afterEach(cleanup);

describe('ScheduledExamScreen retake access', () => {
  it('reopens a submitted exam and makes it available outside the slot window', () => {
    render(
      <ScheduledExamScreen
        darkMode={false}
        onToggleTheme={vi.fn()}
        registration={{
          id: 'luz-registration',
          name: 'Luz Rivera',
          email: 'luz@example.com',
          slotId: '2026-10-24T08',
          language: 'es',
          lines: 'health',
          registeredAt: 1,
          attempts: 1,
          submittedAt: 2,
        }}
        availableByLines={{ both: 150, life: 100, health: 100 }}
        preview={false}
        retakeAccess={{ status: 'active' }}
        onRegister={vi.fn()}
        onEdit={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    expect(screen.queryByText('Examen entregado')).not.toBeInTheDocument();
    expect(screen.getAllByText('Tu reintento está disponible ahora').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Continuar a las instrucciones/i })).toBeEnabled();
  });

  it('allows a named student with no saved registration to create a first attempt without a slot', () => {
    const onRegister = vi.fn();
    render(
      <ScheduledExamScreen
        darkMode={false}
        onToggleTheme={vi.fn()}
        registration={null}
        availableByLines={{ both: 150, life: 100, health: 100 }}
        preview={false}
        retakeAccess={{ status: 'active', studentName: 'Miriam Bravo', expiresAt: Date.now() + 60_000 }}
        onRegister={onRegister}
        onEdit={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Nombre completo')).toHaveValue('Miriam Bravo');
    expect(screen.getByLabelText('Nombre completo')).toHaveAttribute('readonly');
    expect(screen.queryByText('¿Cuándo tomarás el examen?')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'miriam@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirmar reserva/i }));

    expect(onRegister).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Miriam Bravo', email: 'miriam@example.com', slotId: 'retake-anytime',
    }));
  });

  it('shows an expired message and removes every way to start', () => {
    const onStart = vi.fn();
    render(
      <ScheduledExamScreen
        darkMode={false}
        onToggleTheme={vi.fn()}
        registration={null}
        availableByLines={{ both: 150, life: 100, health: 100 }}
        preview={false}
        retakeAccess={{ status: 'expired', studentName: 'Betsy Acosta', expiresAt: 1 }}
        onRegister={vi.fn()}
        onEdit={vi.fn()}
        onStart={onStart}
      />,
    );

    expect(screen.getByText(/Este enlace de acceso venció/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Comenzar|Continuar|Confirmar/i })).not.toBeInTheDocument();
    expect(onStart).not.toHaveBeenCalled();
  });
});
