# Integración del Simulador de Práctica en Tutor LMS

Esta guía explica cómo integrar los simuladores de práctica en cada módulo de tu curso Tutor LMS.

## Descripción General

Cada módulo del curso enlaza con el simulador, filtrado automáticamente al tema de ese módulo. El estudiante hace clic en un botón que abre el simulador en una ventana nueva con solo las preguntas relevantes.

**Ventajas:**
- Los estudiantes practican preguntas específicas de cada módulo
- El simulador incluye explicaciones detalladas de respuestas correctas e incorrectas (lo que el cuestionario nativo de Tutor LMS no ofrece)
- El simulador registra el progreso del estudiante (en el navegador)
- El acceso lo controla el LMS: los enlaces viven dentro de los módulos pagados

## Cómo Integrar

Para cada módulo:

1. Abre el archivo correspondiente en `generated-module-html/` (ver la tabla de abajo)
2. Copia TODO el contenido del archivo (Ctrl+A, Ctrl+C)
3. En Tutor LMS, ve al módulo → modo de edición
4. Inserta un bloque **HTML / Custom HTML** (según tu versión de Tutor LMS)
5. Pega el contenido (Ctrl+V) y guarda
6. Verifica desde la vista de estudiante: deberías ver un bloque azul con el título, una descripción y el botón **"→ Abrir simulador de práctica"**

## Mapeo de Módulos, Archivos y Temas

> El banco de preguntas está organizado por **dominios del examen**, no por los 12 módulos del curso. Por eso varios módulos comparten un mismo conjunto de preguntas (ver "Notas importantes").

| Módulo | Archivo en `generated-module-html/` | Tema (`?topic=`) | Preguntas |
|--------|-------------------------------------|------------------|-----------|
| 1 | `module-01-*.html` | `tipos-vida` | 40 |
| 2 | `module-02-*.html` | `provisiones` | 51 |
| 3 | `module-03-*.html` | `solicitud-suscripcion` | 14 |
| 4 | `module-04-*.html` | `impuestos-retiro-otros` | 28 |
| 5 | `module-05-*.html` | `tipos-salud` | 13 |
| 6 | `module-06-*.html` | `provisiones` | 51 |
| 7 | `module-07-*.html` | `impuestos-retiro-otros` | 28 |
| 8 | `module-08-*.html` | `impuestos-retiro-otros` | 28 |
| 9 | `module-09-*.html` | `solicitud-suscripcion` | 14 |
| 10 | `module-10-*.html` | `estatutos-comunes` | 48 |
| 11 | `module-11-*.html` | `estatutos-vsh` | 31 |
| 12 | `module-12-*.html` | `estatutos-vsh` | 31 |

## Cómo Funciona el Filtrado

El enlace de cada módulo usa un parámetro de tema, por ejemplo:

```
https://alleanzasimulator-texas.vercel.app/?topic=tipos-vida
```

El simulador convierte ese `topic` en **todas** las variantes de nombre de dominio que existen en el banco de preguntas (ver más abajo) y carga únicamente esas preguntas. Esto resuelve un problema real: el mismo dominio aparece escrito de varias formas en el banco (por ejemplo, *"Estatutos del Estado de Texas comunes a todas las líneas"* y *"Estatutos estatales de Texas comunes a todas las líneas"*). El filtro por tema captura todas las variantes, no solo una.

### Temas y los dominios que agrupan

| Tema | Dominios del banco que incluye |
|------|--------------------------------|
| `tipos-vida` | Tipos de pólizas · Seguro de vida · Life Insurance |
| `tipos-salud` | Seguro de salud · Health Insurance |
| `provisiones` | Cláusulas/Endosos/Disposiciones (todas las variantes) · Policy Provisions |
| `solicitud-suscripcion` | Completar la solicitud, suscripción y entrega · Suscripción y entrega · Underwriting and Delivery |
| `impuestos-retiro-otros` | Impuestos, jubilación y otros conceptos · Impuestos, retiro y otros conceptos |
| `estatutos-comunes` | Estatutos de Texas comunes (todas las variantes) · Texas Statutes · Prácticas comerciales desleales · Unfair Trade Practices · Deberes del agente |
| `estatutos-vsh` | Estatutos de Texas rel. vida/salud/HMO (todas las variantes) |

## Notas Importantes

**Módulos que comparten preguntas.** Como el banco tiene ~7 dominios reales y el curso tiene 12 módulos, estos comparten conjunto:
- **2 y 6** → `provisiones`
- **4, 7 y 8** → `impuestos-retiro-otros`
- **3 y 9** → `solicitud-suscripcion`
- **11 y 12** → `estatutos-vsh`

Esto es funcional, pero si quieres conjuntos distintos por módulo hay que crear/re-etiquetar preguntas en `validated_questions/`.

**Módulo 7 (Seguro social) — cobertura provisional.** El banco aún **no tiene un dominio dedicado de "Seguro social"** (Medicare / Medicaid / Seguro Social). Como solución temporal, el Módulo 7 usa el grupo `impuestos-retiro-otros`. Recomendación: redactar preguntas específicas de seguro social y crear un tema propio para ese módulo.

## Estructura del HTML Generado

```html
<div style="...">
  <h3>Módulo X — Dominio Y: Tema</h3>
  <p>Descripción del tema</p>
  <a href="https://alleanzasimulator-texas.vercel.app/?topic=tipos-vida"
     target="_blank"
     rel="noopener noreferrer">
    → Abrir simulador de práctica
  </a>
</div>
```

El HTML es **auto-contenido** con estilos inline, por lo que funciona en cualquier editor.

## Regenerar los Archivos

Si editas títulos, descripciones, el mapeo de temas o agregas preguntas:

1. Edita `modules-config.json` (única fuente de verdad).
2. Ejecuta: `npm run generate:modules`
3. Se regeneran los snippets HTML, `module-html-snippets.html`, `TUTOR_LMS_SETUP.md` y `src/data/topics.json` (que consume la app).
4. Si cambiaste el mapeo de temas, vuelve a desplegar la app en Vercel para que el simulador conozca los nuevos temas.

## Troubleshooting

**P: El simulador muestra "No hay preguntas disponibles".**
- R: El `topic` del enlace no existe en `src/data/topics.json`, o la app no se ha vuelto a desplegar tras cambiar el mapeo. Regenera y redespliega.

**P: El botón no abre el simulador.**
- R: Asegúrate de que el bloque sea HTML (no texto plano) y que Tutor LMS no haya escapado las etiquetas. Como alternativa, pega el URL directamente como hipervínculo.

**P: Quiero más/menos preguntas por sesión.**
- R: Al abrir el simulador, el estudiante puede ajustar la cantidad y la dificultad antes de comenzar. La cantidad se ajusta automáticamente al tamaño del tema.

## Seguridad

- El HTML generado es **estático y seguro** (sin scripts ejecutables).
- El simulador se abre en ventana nueva con `rel="noopener noreferrer"`.
- El acceso está controlado por el LMS; el simulador es público + `noindex` (no se indexa en buscadores).

---

**Última actualización:** Junio 13, 2026
