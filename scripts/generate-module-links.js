#!/usr/bin/env node

/**
 * Generate HTML snippets for Tutor LMS module links
 * Usage: node scripts/generate-module-links.js
 * Output: Creates module-html-snippets.html with all module links
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, '../modules-config.json');

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

/**
 * Generate a URL-safe encoded domain string for URL parameters
 */
function encodeDomain(domain) {
  return encodeURIComponent(domain);
}

/**
 * Generate HTML for a single module link
 */
function generateModuleLink(module) {
  const encodedDomain = encodeDomain(module.domain);
  const simulatorUrl = `${config.baseUrl}/?domain=${encodedDomain}`;

  return `
<!-- Module ${module.id}: ${module.title.split('—')[1].trim()} -->
<div style="margin: 20px 0; padding: 16px; background: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
  <h3 style="margin-top: 0; margin-bottom: 8px; color: #1e40af; font-size: 16px;">
    ${module.title}
  </h3>
  <p style="margin: 8px 0; color: #475569; font-size: 14px;">
    ${module.description}
  </p>
  <a
    href="${simulatorUrl}"
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
 * Generate a compact text-only version for pasting into text fields
 */
function generateCompactLink(module) {
  const encodedDomain = encodeDomain(module.domain);
  const simulatorUrl = `${config.baseUrl}/?domain=${encodedDomain}`;
  return `[${module.title}](${simulatorUrl})`;
}

/**
 * Generate markdown version
 */
function generateMarkdown(module) {
  const encodedDomain = encodeDomain(module.domain);
  const simulatorUrl = `${config.baseUrl}/?domain=${encodedDomain}`;

  return `## ${module.title}

${module.description}

[→ Abrir simulador de práctica](${simulatorUrl}){:target="_blank"}
`;
}

// Generate full HTML file with all modules
const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simuladores de Práctica - Módulos</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      background: #f8fafc;
      color: #1e293b;
    }
    h1 {
      color: #0f172a;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 10px;
    }
    .intro {
      background: white;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      border: 1px solid #e2e8f0;
    }
    .module-container {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
      border-left: 4px solid #3b82f6;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .module-container h3 {
      margin-top: 0;
      margin-bottom: 12px;
      color: #1e40af;
      font-size: 16px;
    }
    .module-container p {
      margin: 8px 0;
      color: #475569;
      font-size: 14px;
    }
    .module-link {
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
      cursor: pointer;
    }
    .module-link:hover {
      background-color: #2563eb;
    }
    .code-block {
      background: #1e293b;
      color: #e2e8f0;
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      margin-top: 12px;
      font-size: 12px;
      font-family: 'Courier New', monospace;
    }
    .instructions {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
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

${config.modules.map((module) => {
  const encodedDomain = encodeDomain(module.domain);
  const simulatorUrl = `${config.baseUrl}/?domain=${encodedDomain}`;

  return `
  <div class="module-container">
    <h3>${module.title}</h3>
    <p>${module.description}</p>
    <a href="${simulatorUrl}" target="_blank" rel="noopener noreferrer" class="module-link">
      → Abrir simulador de práctica
    </a>
    <div class="code-block">URL: ${simulatorUrl}</div>
  </div>
`;
}).join('')}

  <hr style="margin-top: 40px; border: none; border-top: 2px solid #e2e8f0;">
  <p style="color: #64748b; font-size: 12px;">
    Generado el ${new Date().toLocaleString('es-ES')} | Base URL: ${config.baseUrl}
  </p>
</body>
</html>`;

// Generate individual module files for easy copy-paste
const outputDir = path.join(__dirname, '../generated-module-html');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

config.modules.forEach((module) => {
  const htmlContent = generateModuleLink(module);
  const filename = `module-${String(module.id).padStart(2, '0')}-${module.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 40)}.html`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, htmlContent.trim());
});

// Write full HTML
fs.writeFileSync(path.join(__dirname, '../module-html-snippets.html'), fullHtml);

// Generate markdown version for docs
const markdownContent = `# Simuladores de Práctica por Módulo

Cada módulo tiene su propio simulador filtrado por tema. Los enlaces abren el simulador en una ventana nueva.

## Para usar en Tutor LMS

1. Abre el módulo correspondiente en Tutor LMS
2. Copia el código HTML del archivo \`generated-module-html/module-XX-*.html\`
3. Pega el contenido en el editor de contenido del módulo
4. Guarda los cambios

## Módulos

${config.modules.map((m) => generateMarkdown(m)).join('\n')}

---

**Nota:** Los URL están codificados para filtrar automáticamente por dominio. No se requiere configuración adicional.
`;

fs.writeFileSync(path.join(__dirname, '../TUTOR_LMS_SETUP.md'), markdownContent);

console.log('✓ Generated module-html-snippets.html');
console.log('✓ Generated individual HTML files in generated-module-html/');
console.log('✓ Generated TUTOR_LMS_SETUP.md');
console.log(`\nTotal modules: ${config.modules.length}`);
console.log(`Base URL: ${config.baseUrl}`);
