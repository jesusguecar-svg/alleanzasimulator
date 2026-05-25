type Props = {
  isFirst: boolean;
  isLast: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function NavigationButtons({ isFirst, isLast, onPrevious, onNext }: Props) {
  return (
    <div className="flex gap-2 sm:gap-4">
      <button
        onClick={onPrevious}
        disabled={isFirst}
        aria-label="Ir a pregunta anterior"
        className="disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-initial border rounded px-3 sm:px-4 py-2 hover:bg-slate-50 transition-colors text-sm sm:text-base"
      >
        Anterior
      </button>
      <button
        onClick={onNext}
        aria-label={isLast ? "Terminar sesión" : "Ir a siguiente pregunta"}
        className="flex-1 sm:flex-initial bg-blue-600 text-white rounded px-3 sm:px-4 py-2 hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
      >
        {isLast ? 'Terminar sesión' : 'Siguiente'}
      </button>
    </div>
  );
}
