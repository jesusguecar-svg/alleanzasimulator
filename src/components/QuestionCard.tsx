import { CheckCircle2, CircleHelp, Scissors, XCircle } from 'lucide-react';
import { Fragment } from 'react';
import type { ExamLanguage } from '../data/partialExam';
import type { SessionQuestion } from '../types/question';

type Props = {
  q: SessionQuestion;
  selected?: string;
  onSelect: (option: string) => void;
  showFeedback: boolean;
  struckOptions: string[];
  onToggleStrike: (option: string) => void;
  highlights: string[];
  lockAfterSelection?: boolean;
  language?: ExamLanguage;
  domainLabel?: string;
};

function HighlightedText({ text, highlights }: { text: string; highlights: string[] }) {
  const escaped = highlights
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (!escaped.length) return text;
  const expression = new RegExp(`(${escaped.join('|')})`, 'gi');
  return text.split(expression).map((part, index) => (
    highlights.some((value) => value.toLowerCase() === part.toLowerCase())
      ? <mark key={`${part}-${index}`}>{part}</mark>
      : <Fragment key={`${part}-${index}`}>{part}</Fragment>
  ));
}

export function QuestionCard({ q, selected, onSelect, showFeedback, struckOptions, onToggleStrike, highlights, lockAfterSelection = true, language = 'es', domainLabel }: Props) {
  const isLocked = lockAfterSelection && Boolean(selected);
  const english = language === 'en';

  return (
    <article className="question-card">
      <div className="question-meta">
        <span className="domain-tag">{domainLabel ?? q.domain}</span>
        {q.subdomain && <span>{q.subdomain}</span>}
        <span>·</span>
        <span>{q.difficulty === 'easy' ? english ? 'Easy' : 'Fácil' : q.difficulty === 'medium' ? english ? 'Medium' : 'Medio' : english ? 'Hard' : 'Difícil'}</span>
      </div>
      <h1 className="question-text"><HighlightedText text={q.question} highlights={highlights} /></h1>
      <p className="instruction">{english ? 'Select the best answer.' : 'Selecciona la mejor respuesta.'}</p>

      <div className="options" role="radiogroup" aria-label={english ? 'Answer choices' : 'Opciones de respuesta'}>
        {q.shuffledOptions.map((option, index) => {
          const isSelected = selected === option;
          const isCrossed = struckOptions.includes(option);
          const isCorrect = showFeedback && option === q.correctAnswer;
          const isWrong = showFeedback && isSelected && option !== q.correctAnswer;
          const rationale = isCorrect
            ? q.explanation || (english ? 'This is the correct answer.' : 'Esta es la respuesta correcta.')
            : q.optionExplanations?.[option] || (english ? 'This choice is not correct for this question.' : 'Esta opción no es correcta para esta pregunta.');

          return (
            <div key={option} className={`option-wrap ${isSelected ? 'selected' : ''} ${isCrossed ? 'crossed' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}>
              <button className="option-main" type="button" role="radio" aria-checked={isSelected} disabled={isLocked} onClick={() => onSelect(option)}>
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span>{option}</span>
                {isSelected && <CheckCircle2 className="state-icon" size={20} />}
              </button>
              <button type="button" className="strike-button" onClick={() => onToggleStrike(option)} disabled={isLocked} title={isCrossed ? english ? 'Restore choice' : 'Restaurar opción' : english ? 'Cross out choice' : 'Tachar opción'} aria-label={isCrossed ? english ? 'Restore choice' : 'Restaurar opción' : english ? 'Cross out choice' : 'Tachar opción'}>
                <Scissors size={16} />
              </button>
              {showFeedback && (
                <div className="rationale">
                  {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  <span>{rationale}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showFeedback && q.explanation && (
        <div className="explanation">
          <div><CircleHelp size={19} /><strong>{english ? 'Explanation' : 'Explicación'}</strong></div>
          <p>{q.explanation}</p>
          {q.citation && <small>{q.citation}</small>}
        </div>
      )}
    </article>
  );
}
