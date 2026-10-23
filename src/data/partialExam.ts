import type { NormalizedQuestion, SessionQuestion } from '../types/question';
import { shuffleArray } from '../utils/shuffle';
import englishTranslations from './partialExam.en.json';

export const PARTIAL_EXAM_MAX_QUESTIONS = 75;
export const PARTIAL_EXAM_SECONDS_PER_QUESTION = 60;
export type ExamLanguage = 'es' | 'en';

export type PartialExamDomain = {
  id: string;
  label: string;
  labelEn: string;
  modules: string;
  modulesEn: string;
  domains: string[];
  target: number;
  recommendation: string;
  recommendationEn: string;
};

export const partialExamDomains: PartialExamDomain[] = [
  {
    id: 'life',
    label: 'Vida y tipos de pólizas',
    labelEn: 'Life insurance and policy types',
    modules: 'Módulo 1',
    modulesEn: 'Module 1',
    domains: ['Tipos de pólizas', 'Seguro de vida', 'Life Insurance'],
    target: 10,
    recommendation: 'Repasa vida temporal, vida entera, vida universal, beneficiarios y anualidades.',
    recommendationEn: 'Review term, whole and universal life, beneficiaries, settlement options, and annuities.',
  },
  {
    id: 'provisions',
    label: 'Cláusulas, provisiones y opciones',
    labelEn: 'Policy provisions, riders, and options',
    modules: 'Módulos 2 y 6',
    modulesEn: 'Modules 2 and 6',
    domains: [
      'Cláusulas adicionales, disposiciones, opciones y exclusiones de la póliza',
      'Cláusulas, disposiciones, opciones y exclusiones de la póliza',
      'Cláusulas, disposiciones, opciones y exclusiones de pólizas',
      'Cláusulas, endosos, opciones y exclusiones de la póliza',
      'Endosos, disposiciones, opciones y exclusiones de la póliza',
      'Disposiciones de la póliza',
      'Policy Provisions',
    ],
    target: 20,
    recommendation: 'Refuerza períodos de gracia, incontestabilidad, cláusulas, endosos, exclusiones y opciones de liquidación.',
    recommendationEn: 'Reinforce grace periods, incontestability, riders, exclusions, and settlement options.',
  },
  {
    id: 'application',
    label: 'Solicitud, suscripción y entrega',
    labelEn: 'Application, underwriting, and delivery',
    modules: 'Módulos 3 y 9',
    modulesEn: 'Modules 3 and 9',
    domains: ['Completar la solicitud, suscripción y entrega de la póliza', 'Suscripción y entrega', 'Underwriting and Delivery'],
    target: 15,
    recommendation: 'Practica interés asegurable, recibos, suscripción en campo, entrega y responsabilidades del agente.',
    recommendationEn: 'Practice insurable interest, receipts, field underwriting, policy delivery, and agent responsibilities.',
  },
  {
    id: 'retirement',
    label: 'Retiro, seguro social y otros conceptos',
    labelEn: 'Retirement, Social Security, and related concepts',
    modules: 'Módulos 4, 7 y 8',
    modulesEn: 'Modules 4, 7, and 8',
    domains: ['Impuestos, jubilación y otros conceptos de seguros', 'Impuestos, retiro y otros conceptos de seguros'],
    target: 20,
    recommendation: 'Repasa anualidades, impuestos, planes de retiro, Seguro Social, Medicare y coordinación de beneficios.',
    recommendationEn: 'Review annuities, taxation, retirement plans, Social Security, Medicare, and coordination of benefits.',
  },
  {
    id: 'health',
    label: 'Salud y tipos de cobertura',
    labelEn: 'Health insurance and coverage types',
    modules: 'Módulo 5',
    modulesEn: 'Module 5',
    domains: ['Seguro de salud', 'Health Insurance'],
    target: 10,
    recommendation: 'Refuerza HMO, PPO, discapacidad, cuidado a largo plazo, Medicare y gastos médicos.',
    recommendationEn: 'Reinforce HMO, PPO, disability, long-term care, Medicare, and medical expense coverage.',
  },
];

const normalize = (value: string) => value.trim().toLocaleLowerCase('es');

export function getPartialExamDomain(question: Pick<NormalizedQuestion, 'domain'>, language: ExamLanguage = 'es'): PartialExamDomain | undefined {
  const questionDomain = normalize(question.domain);
  const group = partialExamDomains.find((item) => item.domains.some((domain) => normalize(domain) === questionDomain));
  if (!group || language === 'es') return group;
  return { ...group, label: group.labelEn, modules: group.modulesEn, recommendation: group.recommendationEn };
}

const healthLinePattern = /salud|health|hmo|ppo|disabil|discapacidad|medicare|medicaid|m[eé]dic|hospital|enfermed|cuidado a largo|long-term care|accident/i;

/** Life vs. health line. Shared domains (provisions, underwriting, retirement) are split by the question's own subject. */
export function getPartialExamLine(question: Pick<NormalizedQuestion, 'domain' | 'question' | 'subdomain' | 'tags'>): 'life' | 'health' {
  const group = getPartialExamDomain(question)?.id;
  if (group === 'health') return 'health';
  if (group === 'life') return 'life';
  return healthLinePattern.test(`${question.question} ${question.subdomain ?? ''} ${question.tags?.join(' ') ?? ''}`) ? 'health' : 'life';
}

export function isPartialExamQuestion(question: Pick<NormalizedQuestion, 'domain'>): boolean {
  return Boolean(getPartialExamDomain(question));
}

export function buildPartialExamSession(
  questions: NormalizedQuestion[],
  desiredCount = PARTIAL_EXAM_MAX_QUESTIONS,
  language: ExamLanguage = 'es',
): SessionQuestion[] {
  const limit = Math.min(PARTIAL_EXAM_MAX_QUESTIONS, Math.max(1, desiredCount));
  const used = new Set<string>();
  const selected: NormalizedQuestion[] = [];

  for (const group of partialExamDomains) {
    const pool = shuffleArray(questions.filter((question) => getPartialExamDomain(question)?.id === group.id));
    for (const question of pool.slice(0, Math.min(group.target, limit - selected.length))) {
      if (!used.has(question.id)) {
        selected.push(question);
        used.add(question.id);
      }
    }
  }

  if (selected.length < limit) {
    const remainder = shuffleArray(questions.filter((question) => isPartialExamQuestion(question) && !used.has(question.id)));
    selected.push(...remainder.slice(0, limit - selected.length));
  }

  return shuffleArray(selected).map((question) => {
    const translation = language === 'en'
      ? (englishTranslations as Record<string, Partial<NormalizedQuestion>>)[question.id]
      : undefined;
    const localized = translation ? { ...question, ...translation, id: question.id, domain: question.domain } : question;
    return { ...localized, shuffledOptions: shuffleArray(localized.options) };
  });
}
