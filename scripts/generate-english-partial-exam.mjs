import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourceDir = path.join(root, 'validated_questions');
const outputPath = path.join(root, 'src', 'data', 'partialExam.en.json');

const eligibleDomains = new Set([
  'Tipos de pólizas',
  'Seguro de vida',
  'Life Insurance',
  'Cláusulas adicionales, disposiciones, opciones y exclusiones de la póliza',
  'Cláusulas, disposiciones, opciones y exclusiones de la póliza',
  'Cláusulas, disposiciones, opciones y exclusiones de pólizas',
  'Cláusulas, endosos, opciones y exclusiones de la póliza',
  'Endosos, disposiciones, opciones y exclusiones de la póliza',
  'Disposiciones de la póliza',
  'Policy Provisions',
  'Completar la solicitud, suscripción y entrega de la póliza',
  'Suscripción y entrega',
  'Underwriting and Delivery',
  'Impuestos, jubilación y otros conceptos de seguros',
  'Impuestos, retiro y otros conceptos de seguros',
  'Seguro de salud',
  'Health Insurance',
]);

function polishTranslation(value) {
  return value
    .replace(/medical subscription/gi, 'medical underwriting')
    .replace(/subscription period/gi, 'underwriting period')
    .replace(/outcome of the subscription/gi, 'underwriting decision')
    .replace(/uncontestability/gi, 'incontestability')
    .replace(/non-expiration option/gi, 'nonforfeiture option')
    .replace(/free review period/gi, 'free-look period')
    .replace(/The senior doctor pays covered expenses/gi, 'Major medical insurance pays covered expenses')
    .replace(/false declaration/gi, 'misstatement');
}

async function translateText(value, attempt = 1) {
  if (!value) return '';
  const params = new URLSearchParams({
    client: 'gtx',
    sl: 'es',
    tl: 'en',
    dt: 't',
    q: value,
  });
  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    return polishTranslation(payload[0].map((part) => part[0]).join('').trim());
  } catch (error) {
    if (attempt >= 4) throw error;
    await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    return translateText(value, attempt + 1);
  }
}

async function translateQuestion(raw) {
  const optionTexts = raw.options.map((option) => option.text);
  const wrongLabels = Object.keys(raw.wrong_explanations ?? {});
  const fields = [
    raw.subdomain ?? '',
    raw.stem,
    ...optionTexts,
    raw.correct_explanation ?? '',
    ...wrongLabels.map((label) => raw.wrong_explanations[label]),
  ];
  const translated = [];
  for (const field of fields) translated.push(await translateText(field));
  let cursor = 0;
  const subdomain = translated[cursor++];
  const question = translated[cursor++];
  const options = optionTexts.map(() => translated[cursor++]);
  const explanation = translated[cursor++];
  const correctIndex = raw.options.findIndex((option) => option.label === raw.correct_answer);
  const optionExplanations = {};
  for (const label of wrongLabels) {
    const index = raw.options.findIndex((option) => option.label === label);
    if (index >= 0) optionExplanations[options[index]] = translated[cursor++];
  }
  return {
    question,
    subdomain,
    options,
    correctAnswer: options[correctIndex],
    explanation,
    optionExplanations,
  };
}

const files = (await readdir(sourceDir))
  .filter((file) => /^question_bank_validated_batch_\d+_es\.json$/.test(file))
  .sort();
const rawQuestions = [];
for (const file of files) {
  const data = JSON.parse(await readFile(path.join(sourceDir, file), 'utf8'));
  rawQuestions.push(...data.questions.filter((question) => eligibleDomains.has(question.domain)));
}

const translations = {};
let cursor = 0;
const workers = Array.from({ length: 8 }, async () => {
  while (cursor < rawQuestions.length) {
    const index = cursor++;
    const question = rawQuestions[index];
    translations[question.question_id] = await translateQuestion(question);
    process.stdout.write(`\rTranslated ${Object.keys(translations).length}/${rawQuestions.length}`);
  }
});
await Promise.all(workers);
await writeFile(outputPath, `${JSON.stringify(translations, null, 2)}\n`);
process.stdout.write(`\nWrote ${outputPath}\n`);
