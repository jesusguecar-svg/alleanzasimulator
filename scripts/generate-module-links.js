#!/usr/bin/env node

/**
 * Generate Tutor LMS module link snippets from modules-config.json.
 *
 * Usage: node scripts/generate-module-links.js  (or: npm run generate:modules)
 *
 * Outputs:
 *   - generated-module-html/module-XX-*.html   (button snippets to paste in Tutor LMS)
 *   - generated-module-embed/module-XX-*.html  (iframe embed snippets — quiz inline)
 *   - module-html-snippets.html                (preview of all modules)
 *   - TUTOR_LMS_SETUP.md                        (markdown reference)
 *   - src/data/topics.json                      (topic -> domains map consumed by the app)
 *
 * Each module links to the simulator with ?topic=<slug>. The app expands the
 * slug to every domain spelling variant via src/data/topics.json, so the filter
 * catches all relevant questions regardless of how the domain was labeled.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'modules-config.json'), 'utf-8'));

// Load the question bank so we can report how many questions each topic covers.
function loadQuestionDomains() {
  const dir = path.join(root, 'validated_questions');
  const counts = {};
  if (!fs.existsSync(dir)) return counts;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.json')) continue;
    let data;
    try {
      data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'));
    } catch {
      continue;
    }
    for (const q of data.questions ?? []) {
      if (q && typeof q.domain === 'string') counts[q.domain] = (counts[q.domain] ?? 0) + 1;
    }
  }
  return counts;
}

const domainCounts = loadQuestionDomains();

function topicFor(module) {
  const topic = config.topics?.[module.topic];
  if (!topic) throw new Error(`Module ${module.id} references unknown topic "${module.topic}"`);
  return topic;
}

function questionCountFor(module) {
  return topicFor(module).domains.reduce((sum, d) => sum + (domainCounts[d] ?? 0), 0);
}

function simulatorUrl(module) {
  return `${config.baseUrl}/?topic=${encodeURIComponent(module.topic)}`;
}

/** Button snippet for pasting into a Tutor LMS HTML block. */
function generateModuleLink(module) {
  const url = simulatorUrl(module);
  return `
<!-- ${module.title} -->
<div style="margin: 20px 0; padding: 16px; background: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
  <h3 style="margin-top: 0; margin-bottom: 8px; color: #1e40af; font-size: 16px;">
    ${module.title}
  </h3>
  <p style="margin: 8px 0; color: #475569; font-size: 14px;">
    ${module.description}
  </p>
  <a
    href="${url}"
    target="_blank"
    rel="noopener noreferrer"
    style="
      display: inline-block;
      margin-top: 12px;
      padding: 10px 20px;
      background-color: #3b82f6;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      font-size: 14px;
      transition: background-color 0.2s;
    "
    onmouseover="this.style.backgroundColor='#2563eb'"
    onmouseout="this.style.backgroundColor='#3b82f6'"
  >
    → Abrir simulador de práctica
  </a>
</div>`;
}

/**
 * Iframe embed snippet for pasting into a Tutor LMS "Custom HTML" block.
 * Renders the simulator (filtered to this module's topic) INLINE in the lesson,
 * instead of opening a new tab. Includes a fallback link in case the host blocks
 * iframes. The app keeps progress/theme in the iframe's own localStorage, so no
 * extra configuration is required.
 */
function generateModuleEmbed(module) {
  const url = simulatorUrl(module);
  return `
<!-- ${module.title} (embed) -->
<div style="margin: 20px 0;">
  <div style="position: relative; width: 100%; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <iframe
      src="${url}"
      title="${module.title}"
      loading="lazy"
      style="display: block; width: 100%; height: 900px; border: 0;"
      allow="clipboard-write"
    ></iframe>
  </div>
  <p style="margin: 8px 0 0; color: #64748b; font-size: 13px;">
    ¿No se ve el simulador?
    <a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #2563eb;">Ábrelo en una ventana nueva</a>.
  </p>
</div>`;
}

function generateMarkdown(module) {
  return `## ${module.title}

${module.description}

Preguntas disponibles: **${questionCountFor(module)}**

[→ Abrir simulador de práctica](${simulatorUrl(module)}){:target="_blank"}
`;
}

function moduleFilename(module) {
  const slug = module.title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);
  return `module-${String(module.id).padStart(2, '0')}-${slug}.html`;
}

// --- Write the topic -> domains map the app imports ---
const topicsForApp = Object.fromEntries(
  Object.entries(config.topics).map(([slug, t]) => [slug, t.domains]),
);
const srcDataDir = path.join(root, 'src', 'data');
fs.mkdirSync(srcDataDir, { recursive: true });
fs.writeFileSync(path.join(srcDataDir, 'topics.json'), JSON.stringify(topicsForApp, null, 2) + '\n');

// --- Write individual button snippets ---
const outputDir = path.join(root, 'generated-module-html');
fs.mkdirSync(outputDir, { recursive: true });
for (const module of config.modules) {
  fs.writeFileSync(path.join(outputDir, moduleFilename(module)), generateModuleLink(module).trim());
}

// --- Write individual iframe embed snippets ---
const embedDir = path.join(root, 'generated-module-embed');
fs.mkdirSync(embedDir, { recursive: true });
for (const module of config.modules) {
  fs.writeFileSync(path.join(embedDir, moduleFilename(module)), generateModuleEmbed(module).trim());
}

// --- Write the all-in-one preview page ---
const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simuladores de Práctica - Módulos</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; background: #f8fafc; color: #1e293b; }
    h1 { color: #0f172a; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
    .intro { background: white; padding: 16px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #e2e8f0; }
    .module-container { background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px; border-left: 4px solid #3b82f6; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .module-container h3 { margin-top: 0; margin-bottom: 12px; color: #1e40af; font-size: 16px; }
    .module-container p { margin: 8px 0; color: #475569; font-size: 14px; }
    .module-link { display: inline-block; margin-top: 12px; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px; }
    .module-link:hover { background-color: #2563eb; }
    .code-block { background: #1e293b; color: #e2e8f0; padding: 12px; border-radius: 6px; overflow-x: auto; margin-top: 12px; font-size: 12px; font-family: 'Courier New', monospace; }
    .instructions { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>Simuladores de Práctica por Módulo</h1>
  <div class="intro">
    <p>Cada módulo tiene su propio simulador de práctica con preguntas específicas del tema.</p>
    <p><strong>Nota:</strong> Los enlaces abren el simulador en una ventana nueva.</p>
  </div>
  <div class="instructions">
    <strong>Para usar en Tutor LMS:</strong> Copia el código HTML de cada módulo en el editor de contenido del módulo correspondiente.
  </div>
${config.modules
  .map(
    (module) => `
  <div class="module-container">
    <h3>${module.title}</h3>
    <p>${module.description}</p>
    <p style="color:#0f766e;font-size:13px;margin:4px 0;">Preguntas disponibles: <strong>${questionCountFor(module)}</strong></p>
    <a href="${simulatorUrl(module)}" target="_blank" rel="noopener noreferrer" class="module-link">→ Abrir simulador de práctica</a>
    <div class="code-block">URL: ${simulatorUrl(module)}</div>
    <p style="margin:12px 0 4px;color:#475569;font-size:13px;"><strong>Código embed (iframe):</strong></p>
    <div class="code-block">${generateModuleEmbed(module).trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
  </div>
`,
  )
  .join('')}
  <hr style="margin-top: 40px; border: none; border-top: 2px solid #e2e8f0;">
  <p style="color: #64748b; font-size: 12px;">Generado el ${new Date().toLocaleString('es-ES')} | Base URL: ${config.baseUrl}</p>
</body>
</html>`;
fs.writeFileSync(path.join(root, 'module-html-snippets.html'), fullHtml);

// --- Write the markdown reference ---
const markdownContent = `# Simuladores de Práctica por Módulo

Cada módulo tiene su propio simulador filtrado por tema. Los enlaces abren el simulador en una ventana nueva.

## Para usar en Tutor LMS

Hay dos formas de integrar el simulador en cada módulo. Elige una:

**Opción A — Botón (abre el simulador en una ventana nueva)**

1. Abre el módulo correspondiente en Tutor LMS
2. Copia el código HTML del archivo \`generated-module-html/module-XX-*.html\`
3. Pega el contenido en el editor de contenido del módulo (bloque HTML)
4. Guarda los cambios

**Opción B — Embed (el cuestionario se ve dentro de la lección)**

1. Abre el módulo correspondiente en Tutor LMS
2. Copia el código HTML del archivo \`generated-module-embed/module-XX-*.html\`
3. Pega el contenido en un bloque **HTML / Custom HTML** del módulo
4. Guarda los cambios. El simulador aparece incrustado (iframe) con un enlace de
   respaldo por si el tema bloquea iframes.

## Módulos

${config.modules.map((m) => generateMarkdown(m)).join('\n')}

---

**Nota:** Los enlaces usan \`?topic=<slug>\`, que el simulador expande a todas las variantes de nombre de dominio. No se requiere configuración adicional.
`;
fs.writeFileSync(path.join(root, 'TUTOR_LMS_SETUP.md'), markdownContent);

console.log('✓ Generated src/data/topics.json');
console.log('✓ Generated button link snippets in generated-module-html/');
console.log('✓ Generated iframe embed snippets in generated-module-embed/');
console.log('✓ Generated module-html-snippets.html');
console.log('✓ Generated TUTOR_LMS_SETUP.md');
console.log(`\nTotal modules: ${config.modules.length} | Base URL: ${config.baseUrl}`);
console.log('\nQuestions per module:');
for (const m of config.modules) {
  console.log(`  Módulo ${String(m.id).padStart(2, ' ')} [${m.topic}]: ${questionCountFor(m)}`);
}
