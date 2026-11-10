import { useEffect, useState } from 'react';
import { FULL_EXAM_PLAN, FULL_EXAM_PLAYER_PATH, FULL_EXAM_PRODUCTION_HOST, FULL_EXAM_REGISTRATION_KEY, FULL_EXAM_SCHEDULE, FULL_EXAM_TEST_SLOT, fullExamSlots, getFullExamSlot, isFullExamTestMode, type FullExamState } from '../data/fullExamPlan';
import { formatSlotLabel, type ExamLines, type ScheduledRegistration } from '../data/scheduledExam';
import { ScheduledExamScreen } from './ScheduledExamScreen';

export type FullExamRegistration = ScheduledRegistration & {
  state: FullExamState;
  generalCount: number;
  stateCount: number;
  minutes: number;
  generalModules: string[] | null;
  stateModules: string[] | null;
  slotLabel: string;
  ready?: boolean;
};

const loadRegistration = (): FullExamRegistration | null => {
  try {
    return JSON.parse(localStorage.getItem(FULL_EXAM_REGISTRATION_KEY) || 'null') as FullExamRegistration | null;
  } catch {
    return null;
  }
};

const newId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`);

export function FullExamBooking({ darkMode, onToggleTheme }: { darkMode: boolean; onToggleTheme: () => void }) {
  const [registration, setRegistration] = useState<FullExamRegistration | null>(loadRegistration);
  const [editing, setEditing] = useState<FullExamRegistration | null>(null);
  const [state, setState] = useState<FullExamState>(registration?.state ?? 'TX');
  const plan = FULL_EXAM_PLAN[state];

  useEffect(() => {
    if (registration) localStorage.setItem(FULL_EXAM_REGISTRATION_KEY, JSON.stringify(registration));
    else localStorage.removeItem(FULL_EXAM_REGISTRATION_KEY);
  }, [registration]);

  return (
    <ScheduledExamScreen
      darkMode={darkMode}
      onToggleTheme={onToggleTheme}
      registration={registration}
      initialValues={editing}
      availableByLines={{ both: plan.both.questions, life: plan.life.questions, health: plan.health.questions }}
      preview={false}
      retakeAccess={null}
      fullPractice
      linePlan={{
        both: { questions: plan.both.questions, minutes: plan.both.minutes },
        life: { questions: plan.life.questions, minutes: plan.life.minutes },
        health: { questions: plan.health.questions, minutes: plan.health.minutes },
      }}
      stateChoice={{ value: state, onChange: (value) => setState(value as FullExamState) }}
      schedule={{ days: FULL_EXAM_SCHEDULE.days, slots: fullExamSlots }}
      groupSlotsByDay
      testMode={isFullExamTestMode(window.location.hostname, window.location.search)}
      onRegister={(details) => {
        const chosen = plan[details.lines as ExamLines];
        const slot = getFullExamSlot(details.slotId);
        setEditing(null);
        setRegistration({
          ...details,
          id: newId(),
          registeredAt: Date.now(),
          attempts: 0,
          state,
          generalCount: chosen.generalCount,
          stateCount: chosen.stateCount,
          minutes: chosen.minutes,
          generalModules: chosen.generalModules,
          stateModules: chosen.stateModules,
          slotLabel: details.slotId === FULL_EXAM_TEST_SLOT ? FULL_EXAM_TEST_SLOT : slot ? formatSlotLabel(slot, details.language) : details.slotId,
          ready: false,
        });
      }}
      onEdit={() => { setEditing(registration); setState(registration?.state ?? state); setRegistration(null); }}
      onStart={() => {
        if (!registration) return;
        const next = { ...registration, ready: true, attempts: registration.attempts + 1 };
        localStorage.setItem(FULL_EXAM_REGISTRATION_KEY, JSON.stringify(next));
        window.location.assign(FULL_EXAM_PLAYER_PATH);
      }}
      onReset={() => { setEditing(null); setRegistration(null); }}
    />
  );
}
