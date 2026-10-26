import type { NormalizedQuestion, SessionQuestion } from '../types/question';
import type { ExamLanguage } from './partialExam';
import { getPartialExamDomain, PARTIAL_EXAM_SECONDS_PER_QUESTION } from './partialExam';
import { shuffleArray } from '../utils/shuffle';
import englishTranslations from './partialExam.en.json';
import modulesConfig from '../../modules-config.json';

export type ExamLines = 'both' | 'life' | 'health';

export type ExamSlot = { id: string; startsAt: number; endsAt: number };

export type ScheduledRegistration = {
  id: string;
  name: string;
  email: string;
  slotId: string;
  language: ExamLanguage;
  lines: ExamLines;
  registeredAt: number;
  attempts: number;
  submittedAt?: number;
};

export const RETAKE_SLOT_ID = 'retake-anytime';

// Weekend schedule. Slots are hourly start windows in Central Time (CDT, UTC-5 until Nov 1, 2026).
export const SCHEDULE_DAYS = ['2026-10-24', '2026-10-25'];
export const SCHEDULE_FIRST_HOUR = 8;
export const SCHEDULE_LAST_HOUR = 20;
export const SCHEDULE_UTC_OFFSET = '-05:00';
export const SCHEDULE_TIME_ZONE = 'America/Chicago';
// Students may begin any time within this many minutes after their slot opens.
export const SLOT_START_WINDOW_MINUTES = 60;

export const EXAM_QUESTION_COUNTS: Record<ExamLines, number> = { both: 70, life: 70, health: 70 };

const configuredModulesFor = (topic: string) => modulesConfig.modules
  .filter((module) => module.id <= 9 && module.topic === topic)
  .map((module) => module.id);

/** Derived directly from modules-config.json; modules 10+ never enter this map. */
export const SCHEDULED_EXAM_MODULES = {
  life: configuredModulesFor('tipos-vida'),
  provisions: configuredModulesFor('provisiones'),
  application: configuredModulesFor('solicitud-suscripcion'),
  retirement: configuredModulesFor('impuestos-retiro-otros'),
  health: configuredModulesFor('tipos-salud'),
};

export type ScheduledExamCategory = 'common' | 'life' | 'health';

type ScheduledQuestionIdentity = Pick<NormalizedQuestion,
  'id' | 'domain' | 'subdomain' | 'question' | 'explanation' | 'optionExplanations' | 'source' | 'citation' | 'tags' | 'options'
>;

const STATE_REFERENCE_PATTERN = /\b(?:alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|haw[aá]i|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|luisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|mis [ií]sipi|missouri|misuri|montana|nebraska|nevada|new hampshire|nuevo hampshire|new jersey|nueva jersey|new mexico|nuevo m[eé]xico|new york|nueva york|north carolina|carolina del norte|north dakota|dakota del norte|ohio|oklahoma|oregon|oreg[oó]n|pennsylvania|pensilvania|rhode island|south carolina|carolina del sur|south dakota|dakota del sur|tennessee|texas|utah|vermont|virginia|washington|west virginia|virginia occidental|wisconsin|wyoming|tex\.?|fla\.?|tdi|dfs|oir)\b|\b(?:state statutes?|state insurance code|estatutos? estatales?|c[oó]digo estatal de seguros)\b/i;

const REGISTRATION_KEY = 'scheduled-exam-registration';
const PENDING_REPORTS_KEY = 'scheduled-exam-pending-reports';
const WEBHOOK_URL = import.meta.env.VITE_RESULTS_WEBHOOK_URL as string | undefined;

export const examSlots: ExamSlot[] = SCHEDULE_DAYS.flatMap((day) => {
  const slots: ExamSlot[] = [];
  for (let hour = SCHEDULE_FIRST_HOUR; hour <= SCHEDULE_LAST_HOUR; hour += 1) {
    const startsAt = Date.parse(`${day}T${String(hour).padStart(2, '0')}:00:00${SCHEDULE_UTC_OFFSET}`);
    slots.push({ id: `${day}T${String(hour).padStart(2, '0')}`, startsAt, endsAt: startsAt + SLOT_START_WINDOW_MINUTES * 60_000 });
  }
  return slots;
});

export const getSlot = (slotId: string) => examSlots.find((slot) => slot.id === slotId);

const locale = (language: ExamLanguage) => (language === 'en' ? 'en-US' : 'es-US');

export const formatSlotDay = (slot: ExamSlot, language: ExamLanguage) => {
  const day = new Intl.DateTimeFormat(locale(language), { timeZone: SCHEDULE_TIME_ZONE, weekday: 'long', month: 'long', day: 'numeric' }).format(slot.startsAt);
  return day.charAt(0).toLocaleUpperCase(locale(language)) + day.slice(1);
};

export const formatSlotTime = (slot: ExamSlot, language: ExamLanguage) =>
  new Intl.DateTimeFormat(locale(language), { timeZone: SCHEDULE_TIME_ZONE, hour: 'numeric', minute: '2-digit' }).format(slot.startsAt);

export const formatSlotLabel = (slot: ExamSlot, language: ExamLanguage) => `${formatSlotDay(slot, language)} · ${formatSlotTime(slot, language)} CT`;

export type SlotState = 'upcoming' | 'open' | 'closed';

export const getSlotState = (slot: ExamSlot, now = Date.now()): SlotState => (now < slot.startsAt ? 'upcoming' : now < slot.endsAt ? 'open' : 'closed');

export const isValidRetakeToken = (requestedToken: string | null, configuredToken: string | undefined) =>
  Boolean(configuredToken) && requestedToken === configuredToken;

/** Reopens the saved registration while preserving the ID and completed-attempt count. */
export const prepareRetakeRegistration = (registration: ScheduledRegistration | null): ScheduledRegistration | null => {
  if (!registration) return null;
  const { submittedAt: _submittedAt, ...retakeRegistration } = registration;
  return retakeRegistration;
};

export const getScheduledExamModules = (question: Pick<NormalizedQuestion, 'domain'>): readonly number[] => {
  const group = getPartialExamDomain(question)?.id as keyof typeof SCHEDULED_EXAM_MODULES | undefined;
  return group ? SCHEDULED_EXAM_MODULES[group] : [];
};

export const getScheduledExamCategory = (question: Pick<NormalizedQuestion, 'domain'>): ScheduledExamCategory | undefined => {
  const modules = getScheduledExamModules(question);
  if (!modules.length || modules.some((module) => module < 1 || module > 9)) return undefined;
  const includesLife = modules.some((module) => module <= 4);
  const includesHealth = modules.some((module) => module >= 5);
  if (includesLife && includesHealth) return 'common';
  return includesLife ? 'life' : 'health';
};

export const hasStateSpecificReference = (question: ScheduledQuestionIdentity) => STATE_REFERENCE_PATTERN.test([
  question.domain,
  question.subdomain,
  question.question,
  question.explanation,
  question.source,
  question.citation,
  ...question.options,
  ...Object.values(question.optionExplanations ?? {}),
  ...(question.tags ?? []),
].filter(Boolean).join(' '));

/** Kept as a compatibility alias for callers from the earlier Texas-only check. */
export const hasTexasReference = hasStateSpecificReference;

const getValidatedBatchNumber = (id: string) => {
  const match = /^B(\d+)-Q\d+$/i.exec(id);
  return match ? Number(match[1]) : undefined;
};

export const matchesExamLines = (question: ScheduledQuestionIdentity, lines: ExamLines) => {
  const category = getScheduledExamCategory(question);
  const batch = getValidatedBatchNumber(question.id);
  if (!category || !batch || batch > 9 || hasStateSpecificReference(question)) return false;
  return lines === 'both' || category === 'common' || category === lines;
};

const localizeQuestion = (question: NormalizedQuestion, language: ExamLanguage): NormalizedQuestion => {
  if (language !== 'en') return question;
  const translation = (englishTranslations as Record<string, Partial<NormalizedQuestion>>)[question.id];
  return translation ? { ...question, ...translation, id: question.id, domain: question.domain } : question;
};

const uniqueScheduledPool = (questions: NormalizedQuestion[], lines: ExamLines, language: ExamLanguage) => {
  const ids = new Set<string>();
  const stems = new Set<string>();

  return questions.flatMap((question) => {
    if (!matchesExamLines(question, lines)) return [];
    const localized = localizeQuestion(question, language);
    const stem = localized.question.trim().toLocaleLowerCase(language === 'en' ? 'en' : 'es');
    if (hasStateSpecificReference(localized) || ids.has(localized.id) || stems.has(stem)) return [];
    ids.add(localized.id);
    stems.add(stem);
    return [localized];
  });
};

export const getScheduledExamPoolSizes = (questions: NormalizedQuestion[], language: ExamLanguage) => ({
  both: uniqueScheduledPool(questions, 'both', language).length,
  life: uniqueScheduledPool(questions, 'life', language).length,
  health: uniqueScheduledPool(questions, 'health', language).length,
});

/** Builds an exact-size draw, unique by both question ID and localized stem. */
export function buildScheduledExamSession(
  questions: NormalizedQuestion[],
  lines: ExamLines,
  language: ExamLanguage,
): SessionQuestion[] {
  const desiredCount = EXAM_QUESTION_COUNTS[lines];
  const primaryPool = uniqueScheduledPool(questions, lines, language);
  let pool = primaryPool;

  if (pool.length < desiredCount) {
    const ids = new Set(pool.map((question) => question.id));
    const stems = new Set(pool.map((question) => question.question.trim().toLocaleLowerCase(language === 'en' ? 'en' : 'es')));
    const bothPool = uniqueScheduledPool(questions, 'both', language);
    const fallback = bothPool.filter((question) => {
      const stem = question.question.trim().toLocaleLowerCase(language === 'en' ? 'en' : 'es');
      return !ids.has(question.id) && !stems.has(stem);
    });
    pool = [...pool, ...fallback.slice(0, desiredCount - pool.length)];
    console.warn(`Scheduled ${lines} pool has ${primaryPool.length}/${desiredCount} questions; using ${pool.length - primaryPool.length} both-line fallback questions from a ${bothPool.length}-question pool.`);
  }

  if (pool.length < desiredCount) {
    throw new Error(`Scheduled ${lines} exam requires ${desiredCount} unique questions, but only ${primaryPool.length} line-valid and ${pool.length} total general questions are available.`);
  }

  return shuffleArray(pool)
    .slice(0, desiredCount)
    .map((question) => ({ ...question, shuffledOptions: shuffleArray(question.options) }));
}

export const examDurationMinutes = (questionCount: number) => Math.round((questionCount * PARTIAL_EXAM_SECONDS_PER_QUESTION) / 60);

export function loadRegistration(): ScheduledRegistration | null {
  try {
    const raw = localStorage.getItem(REGISTRATION_KEY);
    return raw ? (JSON.parse(raw) as ScheduledRegistration) : null;
  } catch {
    return null;
  }
}

export function saveRegistration(registration: ScheduledRegistration | null) {
  try {
    if (registration) localStorage.setItem(REGISTRATION_KEY, JSON.stringify(registration));
    else localStorage.removeItem(REGISTRATION_KEY);
  } catch {
    // Storage can be unavailable in private windows; the flow still works for the current tab.
  }
}

export const newRegistrationId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

type WebhookEvent = { type: 'registered' | 'started' | 'submitted'; registrationId: string; [key: string]: unknown };

const readPending = (): WebhookEvent[] => {
  try {
    return JSON.parse(localStorage.getItem(PENDING_REPORTS_KEY) ?? '[]') as WebhookEvent[];
  } catch {
    return [];
  }
};

const writePending = (events: WebhookEvent[]) => {
  try {
    if (events.length) localStorage.setItem(PENDING_REPORTS_KEY, JSON.stringify(events));
    else localStorage.removeItem(PENDING_REPORTS_KEY);
  } catch {
    // Ignore storage failures; the event was already attempted once.
  }
};

async function postEvent(event: WebhookEvent) {
  if (!WEBHOOK_URL) throw new Error('VITE_RESULTS_WEBHOOK_URL is not configured');
  // Apps Script web apps don't answer CORS preflights, so send a simple text/plain request.
  await fetch(WEBHOOK_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(event) });
}

/** Sends an event to the admin sheet, queueing it locally if the network fails so it can be retried. */
export async function sendEvent(event: WebhookEvent): Promise<boolean> {
  try {
    await postEvent({ ...event, sentAt: new Date().toISOString() });
    return true;
  } catch {
    writePending([...readPending(), event]);
    return false;
  }
}

export async function flushPendingEvents() {
  const pending = readPending();
  if (!pending.length) return;
  const failed: WebhookEvent[] = [];
  for (const event of pending) {
    try {
      await postEvent({ ...event, sentAt: new Date().toISOString(), retried: true });
    } catch {
      failed.push(event);
    }
  }
  writePending(failed);
}

export function buildExamReport({ registration, questions, answers, elapsedSeconds, autoSubmitted, startedAt, tabSwitches, preview }: {
  registration: ScheduledRegistration;
  questions: SessionQuestion[];
  answers: Record<string, string>;
  elapsedSeconds: number;
  autoSubmitted: boolean;
  startedAt: number;
  tabSwitches: number;
  preview: boolean;
}): WebhookEvent {
  const correct = questions.filter((question) => answers[question.id] === question.correctAnswer).length;
  const unanswered = questions.filter((question) => !answers[question.id]).length;
  const domains = questions.reduce<Record<string, { correct: number; total: number }>>((accumulator, question) => {
    const label = getPartialExamDomain(question)?.label ?? question.domain;
    const bucket = accumulator[label] ?? { correct: 0, total: 0 };
    bucket.total += 1;
    if (answers[question.id] === question.correctAnswer) bucket.correct += 1;
    accumulator[label] = bucket;
    return accumulator;
  }, {});
  const slot = getSlot(registration.slotId);

  return {
    type: 'submitted',
    registrationId: registration.id,
    preview,
    name: registration.name,
    email: registration.email,
    slot: slot ? formatSlotLabel(slot, 'es') : registration.slotId,
    language: registration.language,
    lines: registration.lines,
    attempt: registration.attempts,
    startedAt: new Date(startedAt).toISOString(),
    submittedAt: new Date().toISOString(),
    elapsedSeconds,
    autoSubmitted,
    tabSwitches,
    score: questions.length ? Math.round((correct / questions.length) * 100) : 0,
    correct,
    incorrect: questions.length - correct - unanswered,
    unanswered,
    total: questions.length,
    domains: Object.entries(domains).map(([domain, stats]) => ({ domain, ...stats, percent: Math.round((stats.correct / stats.total) * 100) })),
    responses: questions.map((question, index) => ({
      number: index + 1,
      id: question.id,
      domain: getPartialExamDomain(question)?.label ?? question.domain,
      question: question.question,
      selectedAnswer: answers[question.id] ?? '',
      correctAnswer: question.correctAnswer,
      correct: answers[question.id] === question.correctAnswer,
    })),
  };
}
