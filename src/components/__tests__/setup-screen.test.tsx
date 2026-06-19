import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SetupScreen } from '../SetupScreen';

describe('SetupScreen', () => {
  it('does not render error card when no message', () => {
    render(<SetupScreen questions={[]} selectedDomains={[]} setSelectedDomains={vi.fn()} selectedDifficulties={['easy']} setSelectedDifficulties={vi.fn()} skipAnswered={false} setSkipAnswered={vi.fn()} showImmediate={true} setShowImmediate={vi.fn()} useTimer={false} setUseTimer={vi.fn()} darkMode={false} setDarkMode={vi.fn()} count={10} setCount={vi.fn()} availableCount={0} onStart={vi.fn()} />);
    expect(screen.queryByText(/No hay preguntas/i)).toBeNull();
  });
});
