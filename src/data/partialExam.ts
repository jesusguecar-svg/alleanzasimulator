import type { NormalizedQuestion, SessionQuestion } from '../types/question';
import { shuffleArray } from '../utils/shuffle';

export const PARTIAL_EXAM_MAX_QUESTIONS = 75;
export const PARTIAL_EXAM_SECONDS_PER_QUESTION = 60;

export type PartialExamDomain = {
  id: string;
  label: string;
  modules: string;
  domains: string[];
  target: number;
  recommendation: string;
};

export const partialExamDomains: PartialExamDomain[] = [
  {
    id: 'life',
    label: 'Vida y tipos de pólizas',
    modules: 'Módulo 1',
    domains: ['Tipos de pólizas', 'Seguro de vida', 'Life Insurance'],
    target: 10,
    recommendation: 'Repasa vida temporal, vida entera, vida universal, beneficiarios y anualidades.',
  },
  {
    id: 'provisions',
    label: 'Cláusulas, provisiones y opciones',
    modules: 'Módulos 2 y 6',
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
  },
  {
    id: 'application',
    label: 'Solicitud, suscripción y entrega',
    modules: 'Módulos 3 y 9',
    domains: ['Completar la solicitud, suscripción y entrega de la póliza', 'Suscripción y entrega', 'Underwriting and Delivery'],
    target: 15,
    recommendation: 'Practica interés asegurable, recibos, suscripción en campo, entrega y responsabilidades del agente.',
  },
  {
    id: 'retirement',
    label: 'Retiro, seguro social y otros conceptos',
    modules: 'Módulos 4, 7 y 8',
    domains: ['Impuestos, jubilación y otros conceptos de seguros', 'Impuestos, retiro y otros conceptos de seguros'],
    target: 20,
    recommendation: 'Repasa anualidades, impuestos, planes de retiro, Seguro Social, Medicare y coordinación de beneficios.',
  },
  {
    id: 'health',
    label: 'Salud y tipos de cobertura',
    modules: 'Módulo 5',
    domains: ['Seguro de salud', 'Health Insurance'],
    target: 10,
    recommendation: 'Refuerza HMO, PPO, discapacidad, cuidado a largo plazo, Medicare y gastos médicos.',
  },
];

const normalize = (value: string) => value.trim().toLocaleLowerCase('es');

export function getPartialExamDomain(question: Pick<NormalizedQuestion, 'domain'>): PartialExamDomain | undefined {
  const questionDomain = normalize(question.domain);
  return partialExamDomains.find((group) => group.domains.some((domain) => normalize(domain) === questionDomain));
}

export function isPartialExamQuestion(question: Pick<NormalizedQuestion, 'domain'>): boolean {
  return Boolean(getPartialExamDomain(question));
}

export function buildPartialExamSession(
  questions: NormalizedQuestion[],
  desiredCount = PARTIAL_EXAM_MAX_QUESTIONS,
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

  return shuffleArray(selected).map((question) => ({
    ...question,
    shuffledOptions: shuffleArray(question.options),
  }));
}
