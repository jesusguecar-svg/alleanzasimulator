import type { NormalizedQuestion } from '../types/question';

export type PracticeScope = 'general' | 'state';

export type StudyGroup = {
  id: string;
  title: string;
  description: string;
  icon: 'landmark' | 'book' | 'health';
};

const generalGroups: StudyGroup[] = [
  { id: 'general-foundations', title: 'Fundamentos de seguros', description: 'Conceptos, riesgos y tipos de cobertura.', icon: 'book' },
  { id: 'general-life', title: 'Vida y anualidades', description: 'Vida, anualidades, beneficiarios y liquidaciones.', icon: 'book' },
  { id: 'general-health', title: 'Salud y HMO', description: 'Gastos médicos, Medicare, redes y HMO.', icon: 'health' },
  { id: 'general-accident', title: 'Accidentes y discapacidad', description: 'AD&D, discapacidad y protección de ingresos.', icon: 'health' },
  { id: 'general-provisions', title: 'Cláusulas y disposiciones', description: 'Endosos, exclusiones, opciones y términos de póliza.', icon: 'book' },
  { id: 'general-application', title: 'Solicitud y suscripción', description: 'Solicitud, evaluación del riesgo y entrega.', icon: 'book' },
  { id: 'general-ownership', title: 'Propiedad y beneficiarios', description: 'Derechos del titular, beneficiarios y asignaciones.', icon: 'book' },
  { id: 'general-tax', title: 'Impuestos y jubilación', description: 'Tratamiento fiscal, retiro y planificación.', icon: 'landmark' },
  { id: 'general-ethics', title: 'Deberes y prácticas comerciales', description: 'Ética, deber fiduciario y prácticas desleales.', icon: 'landmark' },
];

const texasGroups: StudyGroup[] = [
  { id: 'texas-regulation', title: 'Regulación y licencias de Texas', description: 'Agentes, licencias, deberes y prácticas comerciales.', icon: 'landmark' },
  { id: 'texas-common', title: 'Estatutos comunes de Texas', description: 'Reglas estatales aplicables a todas las líneas.', icon: 'landmark' },
  { id: 'texas-life', title: 'Vida y anualidades de Texas', description: 'Reglas estatales para vida, anualidades y productos afines.', icon: 'book' },
  { id: 'texas-health', title: 'Salud y HMO de Texas', description: 'Reglas estatales de salud, HMO y discapacidad.', icon: 'health' },
];

const floridaGroups: StudyGroup[] = [
  { id: 'florida-regulation', title: 'Regulación general de Florida', description: 'DFS, OIR, licencias, ética y prácticas comerciales.', icon: 'landmark' },
  { id: 'florida-life', title: 'Vida, anualidades y productos variables', description: 'Reemplazo, disposiciones, vida grupal y anualidades.', icon: 'book' },
  { id: 'florida-health', title: 'Salud y HMO de Florida', description: 'Planes, Medigap, LTC, continuidad y reglas estatales.', icon: 'health' },
];

export const groupCatalog = (scope: PracticeScope, stateName: string): StudyGroup[] => {
  if (scope === 'general') return generalGroups;
  if (stateName === 'Texas') return texasGroups;
  if (stateName === 'Florida') return floridaGroups;
  return [];
};

const searchable = (question: NormalizedQuestion) =>
  `${question.domain} ${question.subdomain ?? ''} ${question.question} ${question.explanation ?? ''}`.toLowerCase();

export const isSpecificToState = (question: NormalizedQuestion, stateName: string) => searchable(question).includes(stateName.toLowerCase());

export const isAnyStateSpecific = (question: NormalizedQuestion) =>
  ['Texas', 'Florida'].some((state) => isSpecificToState(question, state));

export const getStudyGroupId = (question: NormalizedQuestion, scope: PracticeScope, stateName: string): string => {
  const text = searchable(question);
  if (scope === 'state' && stateName === 'Florida') {
    if (question.domain === 'Common All-Lines Florida') return 'florida-regulation';
    if (question.domain === 'Florida Health') return 'florida-health';
    return 'florida-life';
  }
  if (scope === 'state' && stateName === 'Texas') {
    if (/salud|health|hmo|disabil|enfermed/.test(text)) return 'texas-health';
    if (/vida|life|annuit|anualidad/.test(text)) return 'texas-life';
    if (/licen|agente|agent|appointment|dfs|oir|ofr|práctica|practice|unfair/.test(text)) return 'texas-regulation';
    return 'texas-common';
  }
  if (question.domain === 'Tipos de pólizas' && /accident|accidente|disabil|discapacidad|ad&d|muerte accidental/.test(text)) return 'general-accident';
  if (question.domain === 'Tipos de pólizas') return 'general-foundations';
  if (/impuesto|tax|retir|jubil/.test(text)) return 'general-tax';
  if (/deberes del agente|prácticas comerciales|unfair trade|commingling|rebating|twisting|churning/.test(text)) return 'general-ethics';
  if (/solicitud|suscripci|underwriting|delivery|entrega/.test(text)) return 'general-application';
  if (/cláusula|clausula|disposici|endoso|exclusi|policy provision/.test(text)) return 'general-provisions';
  if (/benefici|propietar|ownership|assign/.test(text)) return 'general-ownership';
  if (/accident|accidente|disabil|discapacidad|ad&d|muerte accidental/.test(text)) return 'general-accident';
  if (/salud|health|hmo|medicare|medigap|medical|dental|hospital/.test(text)) return 'general-health';
  if (/vida|life|anualidad|annuit|mortgage|life settlement/.test(text)) return 'general-life';
  return 'general-foundations';
};
