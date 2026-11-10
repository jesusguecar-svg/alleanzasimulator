# Simulador de Práctica — Texas General Lines

Aplicación web (React + TypeScript + Vite + Tailwind) para practicar el examen de **Texas General Lines (Life, Accident, Health & HMO)** con interfaz en español.

## Carpeta de preguntas (obligatoria)

Sube los JSON validados en:

- `validated_questions/`

La app carga automáticamente **todos** los `*.json` de esa carpeta y no requiere cambios de código al agregar nuevos archivos.

## Comandos locales

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run test`
- `npm run validate:questions`

## ¿Cómo funciona la carga JSON?

- `src/data/loadQuestions.ts` usa `import.meta.glob('/validated_questions/*.json', { eager: true })`.
- Cada objeto se normaliza (`src/data/normalizeQuestions.ts`).
- Después se valida (`src/data/validateQuestions.ts`).
- Preguntas inválidas se excluyen sin romper la app.
- En desarrollo se muestra `console.warn` con razones de invalidez.

## Funcionalidades

- Modo práctica
- Filtros por dominio y dificultad
- Selector de cantidad de preguntas
- Feedback inmediato o solo al final
- Resultado con revisión de errores y explicaciones
- Reintento de falladas
- Progreso básico en `localStorage`
- Reinicio de progreso con confirmación

## Acceso

El simulador es de **acceso público**. La protección la provee el LMS (Alleanza Academy):
los enlaces al simulador viven dentro de los módulos pagados, así que solo los estudiantes
inscritos los ven. El simulador no requiere contraseña propia.

- Para evitar que aparezca en buscadores se incluye `<meta name="robots" content="noindex, nofollow">`
  en `index.html` y un `public/robots.txt` con `Disallow: /`.
- Cada módulo enlaza con un filtro de dominio mediante el parámetro `?domain=...`.
  Ver `TUTOR_LMS_INTEGRATION.md`.

## Despliegue (Vercel)

1. Push del repositorio a GitHub.
2. Importar proyecto en Vercel.
3. Build command: `npm run build`
4. Output dir: `dist`


## Scheduled weekend exam (`/examen-programado`)

Students book an hourly slot (Sat/Sun, 8 AM–8 PM CT), choose Spanish or English and Life + Health, Life only or Health only. The exam unlocks only during the first 60 minutes of their slot, shows the exam conditions, and sends every registration, start and submission to a Google Sheet.

1. Create a Google Sheet → Extensions → Apps Script → paste `scripts/results-sheet-apps-script.gs`.
2. Deploy → New deployment → Web app · Execute as **Me** · Access **Anyone** → copy the URL.
3. In Vercel set `VITE_RESULTS_WEBHOOK_URL` to that URL, `VITE_PREVIEW_KEY` to a secret word, and `VITE_RETAKE_TOKEN` to the private retake-link token, then redeploy.
4. Test outside a slot with `/examen-programado?preview=<VITE_PREVIEW_KEY>` (rows are marked PREVIEW).
5. Give an authorized student `/examen-programado?retake=<token>` to reopen their saved registration at any time. The saved attempt count is preserved and increments when the retake starts; results are not marked as previews. `VITE_RETAKE_TOKEN` is the legacy non-expiring Luz link. The four named `VITE_*_RETAKE_TOKEN` links expire at `2026-10-28T03:59:00Z` and also allow a first attempt when no matching registration is saved.

Slot dates and hours live at the top of `src/data/scheduledExam.ts`.

## Full practice exam (`/examen-completo`)

The booking page reuses the scheduled-exam form: name, email, Central Time slot, language, line, and state. Students can start any hour from Monday November 9 through Sunday November 15, 2026, 24 hours, Central time (`FULL_EXAM_SCHEDULE`). The scheduled exam dates are unchanged. Vida y Salud is 150 questions and 150 minutes. Single-line lengths follow the Pearson VUE handbooks where the bank is large enough (`src/data/fullExamPlan.ts`). When the student submits — or the clock hits 0:00 — the browser posts one `full-exam` event to `VITE_FULL_EXAM_WEBHOOK_URL`, or to `VITE_RESULTS_WEBHOOK_URL` when that override is empty. The request uses `text/plain` and `no-cors`, same as the scheduled exam, and retries once. The results screen stays up if the request fails. The event includes the line and the reserved slot. `Submitted at` is written in Central time.

`scripts/results-sheet-apps-script.gs` writes that event to a tab named **Examen Completo** and leaves Registrations, Results, and Responses alone. The web app that is already deployed ignores unknown event types until this file is published:

1. Open the same Google Sheet → Extensions → Apps Script.
2. Replace the project source with `scripts/results-sheet-apps-script.gs`.
3. Deploy → Manage deployments → Edit → Version: New version → Deploy.

That keeps the current web app URL. Create a new deployment only if you intend to change `VITE_RESULTS_WEBHOOK_URL` (or set `VITE_FULL_EXAM_WEBHOOK_URL` and redeploy the site).
