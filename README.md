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

