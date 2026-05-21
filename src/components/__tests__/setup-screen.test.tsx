import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SetupScreen } from '../SetupScreen';

describe('SetupScreen', () => {
  it('does not render error card when no message', () => {
    render(<SetupScreen questions={[]} selectedDomains={[]} setSelectedDomains={vi.fn()} selectedDifficulties={['easy']} setSelectedDifficulties={vi.fn()} skipAnswered={false} setSkipAnswered={vi.fn()} showAtEnd={false} setShowAtEnd={vi.fn()} count={10} setCount={vi.fn()} availableCount={0} onStart={vi.fn()} filesLoaded={0} />);
    expect(screen.queryByText(/No hay preguntas/i)).toBeNull();
  });

  it('renderiza mensaje de advertencia cuando se proporciona', () => {
    render(<SetupScreen questions={[]} selectedDomains={[]} setSelectedDomains={vi.fn()} selectedDifficulties={['easy']} setSelectedDifficulties={vi.fn()} skipAnswered={false} setSkipAnswered={vi.fn()} showAtEnd={false} setShowAtEnd={vi.fn()} count={10} setCount={vi.fn()} availableCount={0} onStart={vi.fn()} filesLoaded={0} message="No se detectaron archivos JSON en validated_questions/." />);
    expect(screen.getByText(/No se detectaron archivos JSON/i)).toBeInTheDocument();
  });

});
