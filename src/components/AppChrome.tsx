import { BookOpenCheck, Moon, Sun } from 'lucide-react';
import type { ReactNode } from 'react';

type HeaderProps = {
  darkMode: boolean;
  onToggleTheme: () => void;
  questionCount?: number;
  compact?: boolean;
  center?: ReactNode;
};

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? 'compact' : ''}`}>
      <div className="brand-mark" aria-hidden="true">AA</div>
      <div>
        <strong>Alleanza Academy</strong>
        <span>Texas General Lines Simulator</span>
      </div>
    </div>
  );
}

export function ThemeButton({ darkMode, onToggle }: { darkMode: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="icon-button"
      onClick={onToggle}
      title={darkMode ? 'Usar tema claro' : 'Usar tema oscuro'}
      aria-label={darkMode ? 'Usar tema claro' : 'Usar tema oscuro'}
    >
      {darkMode ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}

export function AppHeader({ darkMode, onToggleTheme, questionCount, compact = false, center }: HeaderProps) {
  return (
    <header className={`topbar ${center ? 'exam-topbar' : 'public-topbar'}`}>
      <Brand compact={compact} />
      {center}
      <div className="topbar-actions">
        {typeof questionCount === 'number' && (
          <span className="bank-count"><BookOpenCheck size={17} /> {questionCount} preguntas</span>
        )}
        <ThemeButton darkMode={darkMode} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}
