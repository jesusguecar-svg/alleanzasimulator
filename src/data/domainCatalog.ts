export const CANONICAL_DOMAINS = [
  'General Insurance Concepts',
  'Life Insurance',
  'Health Insurance',
  'Policy Provisions',
  'Underwriting and Delivery',
  'Taxes, Retirement and Other Insurance Concepts',
  'Unfair Trade Practices',
  'Agent Duties',
  'Types of Policies',
  'Texas Statutes: Common to All Lines',
  'Texas Statutes: Life Insurance',
  'Texas Statutes: Health Insurance',
  'Texas Statutes: HMO',
] as const;

const aliasMap: Record<string, string> = {
  'general insurance concepts': 'General Insurance Concepts',
  'life insurance': 'Life Insurance',
  'seguro de vida': 'Life Insurance',
  'health insurance': 'Health Insurance',
  'seguro de salud': 'Health Insurance',
  'policy provisions': 'Policy Provisions',
  'disposiciones de la poliza': 'Policy Provisions',
  'clausulas disposiciones opciones y exclusiones de la poliza': 'Policy Provisions',
  'clausulas adicionales disposiciones opciones y exclusiones de la poliza': 'Policy Provisions',
  'clausulas endosos opciones y exclusiones de la poliza': 'Policy Provisions',
  'endosos disposiciones opciones y exclusiones de la poliza': 'Policy Provisions',
  'underwriting and delivery': 'Underwriting and Delivery',
  'suscripcion y entrega': 'Underwriting and Delivery',
  'suscripcion y entrega de la poliza': 'Underwriting and Delivery',
  'completar la solicitud suscripcion y entrega de la poliza': 'Underwriting and Delivery',
  'unfair trade practices': 'Unfair Trade Practices',
  'practicas comerciales desleales': 'Unfair Trade Practices',
  'agent duties': 'Agent Duties',
  'deberes del agente': 'Agent Duties',
  'impuestos retiro y otros conceptos de seguros': 'Taxes, Retirement and Other Insurance Concepts',
  'impuestos jubilacion y otros conceptos de seguros': 'Taxes, Retirement and Other Insurance Concepts',
  'taxes retirement and other insurance concepts': 'Taxes, Retirement and Other Insurance Concepts',
  'types of policies': 'Types of Policies',
  'tipos de polizas': 'Types of Policies',
  'texas statutes': 'Texas Statutes: Common to All Lines',
  'estatutos de texas': 'Texas Statutes: Common to All Lines',
  'estatutos de texas comunes a todas las lineas': 'Texas Statutes: Common to All Lines',
  'estatutos del estado de texas comunes a todas las lineas': 'Texas Statutes: Common to All Lines',
  'estatutos estatales de texas comunes a todas las lineas': 'Texas Statutes: Common to All Lines',
  'estatutos de texas relacionados con vida': 'Texas Statutes: Life Insurance',
  'estatutos del estado de texas relativos a vida': 'Texas Statutes: Life Insurance',
  'estatutos estatales de texas relacionados con vida': 'Texas Statutes: Life Insurance',
  'estatutos de texas relacionados con salud': 'Texas Statutes: Health Insurance',
  'estatutos del estado de texas relacionados con salud': 'Texas Statutes: Health Insurance',
  'estatutos de texas relacionados con hmo': 'Texas Statutes: HMO',
  'estatutos del estado de texas relacionados con hmo': 'Texas Statutes: HMO',
  'estatutos del estado de texas relacionados con vida salud y hmo': 'Texas Statutes: HMO',
  'estatutos estatales de texas relacionados con vida salud y hmo': 'Texas Statutes: HMO',
};

function cleanText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ');
}

export function normalizeDomainName(domain: string | undefined): string {
  if (!domain?.trim()) return 'General Insurance Concepts';
  const cleaned = cleanText(domain);
  const aliased = aliasMap[cleaned];
  if (aliased) return aliased;

  if (cleaned.includes('hmo')) return 'Texas Statutes: HMO';
  if (cleaned.includes('estatutos') && cleaned.includes('vida') && !cleaned.includes('salud') && !cleaned.includes('hmo')) return 'Texas Statutes: Life Insurance';
  if (cleaned.includes('estatutos') && cleaned.includes('salud') && !cleaned.includes('hmo')) return 'Texas Statutes: Health Insurance';

  return 'General Insurance Concepts';
}
