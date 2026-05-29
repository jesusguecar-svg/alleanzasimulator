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

## Protección de acceso en Vercel

La app incluye una pantalla de acceso propia antes de cargar el simulador. No usa Vercel Password Protection.

- La contraseña se lee únicamente en servidor desde `APP_ACCESS_PASSWORD`.
- No crees una variable `NEXT_PUBLIC_` ni `VITE_` para esta contraseña; esas variables pueden terminar expuestas al navegador.
- Al iniciar sesión correctamente, el servidor crea una cookie `HttpOnly` para mantener la sesión durante 7 días.
- Si `APP_ACCESS_PASSWORD` no está configurada, la pantalla de acceso muestra un mensaje seguro y no revela ningún secreto.

### Configurar `APP_ACCESS_PASSWORD` en Vercel

1. En Vercel, abre el proyecto.
2. Ve a **Settings → Environment Variables**.
3. Agrega una variable llamada exactamente `APP_ACCESS_PASSWORD`.
4. Escribe una contraseña fuerte como valor.
5. Selecciona los entornos donde debe aplicar (por ejemplo, **Production**, **Preview** y/o **Development**).
6. Guarda la variable.
7. Vuelve a desplegar el proyecto para que las funciones y el middleware reciban la variable.

## Despliegue (GitHub Pages / Vercel / Netlify)

Recomendado: Vercel para despliegue simple desde GitHub.

1. Push del repositorio a GitHub.
2. Importar proyecto en Vercel.
3. Configurar `APP_ACCESS_PASSWORD` en Vercel antes de compartir la URL.
4. Build command: `npm run build`
5. Output dir: `dist`

