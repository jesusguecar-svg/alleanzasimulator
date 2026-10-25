import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ScheduledExamScreen } from '../ScheduledExamScreen';

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
        retake
        onRegister={vi.fn()}
        onEdit={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    expect(screen.queryByText('Examen entregado')).not.toBeInTheDocument();
    expect(screen.getAllByText('Tu reintento está disponible ahora').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Continuar a las instrucciones/i })).toBeEnabled();
  });
});
