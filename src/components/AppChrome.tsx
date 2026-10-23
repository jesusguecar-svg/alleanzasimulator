import { BookOpenCheck, Moon, Sun } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ExamLanguage } from '../data/partialExam';

type HeaderProps = {
  darkMode: boolean;
  onToggleTheme: () => void;
  questionCount?: number;
  compact?: boolean;
  center?: ReactNode;
  onHome?: () => void;
  language?: ExamLanguage;
};

export function Brand({ compact = false, onHome, language = 'es' }: { compact?: boolean; onHome?: () => void; language?: ExamLanguage }) {
  return (
    <button type="button" className={`brand ${compact ? 'compact' : ''}`} onClick={onHome} aria-label={language === 'en' ? 'Go to start' : 'Ir al inicio'}>
      <div className="brand-mark" aria-hidden="true">AA</div>
      <div>
        <strong>Alleanza Academy</strong>
        <span>Life, Health &amp; Accident Simulator</span>
      </div>
    </button>
  );
}

export function ThemeButton({ darkMode, onToggle, language = 'es' }: { darkMode: boolean; onToggle: () => void; language?: ExamLanguage }) {
  const label = language === 'en' ? darkMode ? 'Use light theme' : 'Use dark theme' : darkMode ? 'Usar tema claro' : 'Usar tema oscuro';
  return (
    <button
      type="button"
      className="icon-button"
      onClick={onToggle}
      title={label}
      aria-label={label}
    >
      {darkMode ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}

export function AppHeader({ darkMode, onToggleTheme, questionCount, compact = false, center, onHome, language = 'es' }: HeaderProps) {
  return (
    <header className={`topbar ${center ? 'exam-topbar' : 'public-topbar'}`}>
      <Brand compact={compact} onHome={onHome} language={language} />
      {center}
      <div className="topbar-actions">
        {typeof questionCount === 'number' && (
          <span className="bank-count"><BookOpenCheck size={17} /> {questionCount} {language === 'en' ? 'questions' : 'preguntas'}</span>
        )}
        <ThemeButton darkMode={darkMode} onToggle={onToggleTheme} language={language} />
      </div>
    </header>
  );
}
