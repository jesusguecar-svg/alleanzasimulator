# Integración del Simulador de Práctica en Tutor LMS

Esta guía explica cómo integrar los simuladores de práctica en cada módulo de tu curso Tutor LMS.

## Descripción General

Cada módulo del curso tiene su propio simulador de práctica con preguntas específicas del tema. Los estudiantes pueden acceder al simulador desde dentro del módulo en Tutor LMS. Tienes **dos opciones de integración**:

1. **Botón externo** — Abre el simulador en una ventana nueva (recomendado si necesitas estadísticas separadas)
2. **Iframe incrustado** — Mantiene a los estudiantes en la página del módulo con el simulador integrado

**Ventajas:**
- Los estudiantes practican preguntas específicas de cada módulo
- El simulador incluye explicaciones detalladas de respuestas correctas e incorrectas
- El simulador registra el progreso del estudiante
- No se necesita acceso a Tutor LMS desde el simulador

## Pasos para Integrar

### Opción A: Botón externo (abre en ventana nueva)

**Archivos:** `generated-module-html/module-XX-*.html`

Este es el enfoque tradicional: los estudiantes ven un botón que abre el simulador en una nueva pestaña.

**Pasos:**
1. Abre el archivo `generated-module-html/module-01-*.html` (correspondiente al módulo)
2. Copia TODO el contenido del archivo (Ctrl+A, Ctrl+C)
3. En Tutor LMS, ve al módulo → modo de edición
4. Haz clic en **"Insert" → "HTML"** (o similar según tu versión)
5. Pega el contenido (Ctrl+V) y guarda

**Ventajas:**
- Simple y rápido de implementar
- Los estudiantes ven claramente que se abre un nuevo recurso
- No hay problemas de compatibilidad

**Desventajas:**
- Abre una ventana/pestaña separada (puede ser confuso para algunos)

### Opción B: Iframe incrustado (mantiene al estudiante en el módulo)

**Archivos:** `generated-module-iframe/iframe-module-XX-*.html`

Este enfoque mantiene a los estudiantes en la página del módulo mientras usan el simulador.

**Pasos:**
1. Abre el archivo `generated-module-iframe/iframe-module-01-*.html` (correspondiente al módulo)
2. Copia TODO el contenido del archivo (Ctrl+A, Ctrl+C)
3. En Tutor LMS, ve al módulo → modo de edición
4. Haz clic en **"Insert" → "HTML"** (o similar según tu versión)
5. Pega el contenido (Ctrl+V) y guarda

**Ventajas:**
- Los estudiantes permanecen en el módulo (mejor UX)
- No se abren pestañas extras
- El simulador está contextualizad dentro del módulo

**Desventajas:**
- El altura del iframe (800px) puede necesitar ajuste según tu pantalla
- Algunos navegadores pueden tener restricciones de iframes

### Verificar que funcione

1. Abre el módulo desde la vista de estudiante
2. Deberías ver un bloque azul con:
   - El título del módulo
   - Una descripción
   - Un botón (opción A) o un simulador incrustado (opción B)
3. Prueba la interacción con el simulador para verificar que funciona correctamente

## Comparación: Botón vs Iframe

| Aspecto | Botón (Opción A) | Iframe (Opción B) |
|--------|------------------|------------------|
| **Ubicación de archivos** | `generated-module-html/` | `generated-module-iframe/` |
| **Complejidad** | Simple | Ligeramente más complejo |
| **UX** | Abre pestaña nueva | Mantiene al estudiante en el módulo |
| **Compatibilidad** | Universal | Muy alta (excepto algunos navegadores muy antiguos) |
| **Altura ajustable** | N/A | Sí (editar `height: 800px`) |
| **Mejor para** | Usuarios desktop | Usuarios mobile o que prefieren una página única |

**Recomendación:** Comienza con la **Opción A (Botón)** si es tu primera vez. Es más simple y no tienes que preocuparte por la altura del iframe. Luego puedes cambiar a la **Opción B (Iframe)** si prefieres una mejor UX.

## Mapeo de Módulos y Dominios

| Módulo | Tema | Dominio en Base de Datos |
|--------|------|--------------------------|
| 1 | Tipos de pólizas de vida | Seguro de vida |
| 2 | Cláusulas adicionales, provisiones y opciones de póliza | Cláusulas, disposiciones, opciones y exclusiones de la póliza |
| 3 | Completar la solicitud y entregar pólizas | Completar la solicitud, suscripción y entrega de la póliza |
| 4 | Conceptos de retiro y anualidades | Impuestos, retiro y otros conceptos de seguros |
| 5 | Tipos de pólizas de salud | Seguro de salud |
| 6 | Provisiones, cláusulas y cláusulas adicionales en pólizas de salud | Cláusulas, disposiciones, opciones y exclusiones de pólizas |
| 7 | Seguro social | Prácticas comerciales desleales |
| 8 | Otros conceptos de seguros | Impuestos, retiro y otros conceptos de seguros |
| 9 | Suscripción en campo | Completar la solicitud, suscripción y entrega de la póliza |
| 10 | Estatutos de Texas para seguros de vida y salud | Estatutos del estado de Texas relacionados con vida, salud y HMO |
| 11 | Regulaciones específicas para seguros de vida | Estatutos del estado de Texas comunes a todas las líneas |
| 12 | Regulaciones específicas para seguros de accidente y salud | Estatutos del estado de Texas relacionados con vida, salud y HMO |

## Estructura del HTML Generado

### Opción A: Botón externo

```html
<div style="...">
  <h3>Módulo X — Dominio Y: Tema</h3>
  <p>Descripción del tema</p>
  <a href="https://alleanzasimulator-texas.vercel.app/?domain=Tema%20Específico" 
     target="_blank" 
     rel="noopener noreferrer">
    → Abrir simulador de práctica
  </a>
</div>
```

### Opción B: Iframe incrustado

```html
<div style="...">
  <h3>Módulo X — Dominio Y: Tema</h3>
  <p>Descripción del tema</p>
  <iframe
    src="https://alleanzasimulator-texas.vercel.app/?domain=Tema%20Específico"
    style="width: 100%; height: 800px; border: 1px solid #cbd5e1; border-radius: 6px;"
    title="Simulador de práctica - Módulo X"
    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-storage-access-by-user-activation"
  ></iframe>
</div>
```

Ambos son **auto-contenidos** con estilos inline, por lo que funcionan en cualquier contexto.

### Ajustar la altura del iframe

Si necesitas cambiar la altura del iframe (por defecto 800px), edita el CSS `height: 800px` en el archivo HTML.

## Cómo Funciona el Filtrado

Cuando el estudiante hace clic en el botón del simulador:

1. Se abre el simulador en una ventana nueva
2. El URL contiene un parámetro de filtrado: `?domain=Seguro%20de%20vida`
3. El simulador carga **solo** las preguntas del dominio especificado
4. El estudiante practica con esas preguntas específicas

**Ejemplo de URLs generadas:**
- Módulo 1: `https://alleanzasimulator-texas.vercel.app/?domain=Seguro%20de%20vida`
- Módulo 2: `https://alleanzasimulator-texas.vercel.app/?domain=Cl%C3%A1usulas%2C%20disposiciones%2C%20opciones%20y%20exclusiones%20de%20la%20p%C3%B3liza`

## Regenerar los Archivos

Si necesitas actualizar las descripiciones de los módulos o los URL, puedes:

1. Editar `modules-config.json` con los cambios deseados
2. Ejecutar: `npm run generate:modules` o `node scripts/generate-module-links.js`
3. Los archivos HTML se regenerarán automáticamente

## Troubleshooting

**P: El simulador muestra "No hay preguntas disponibles"**
- R: El dominio en el URL no coincide exactamente con los dominios en la base de datos. Verifica que el nombre del dominio sea idéntico.

**P: El botón no abre el simulador**
- R: Asegúrate de que JavaScript esté habilitado en el navegador. Si Tutor LMS filtra HTML, intenta pegar el URL directamente.

**P: El simulador carga pero sin filtro de dominio**
- R: Si el parámetro `?domain=...` no funciona, el sitio podría estar en modo de acceso protegido (pantalla de login). Verifica que el estudiante esté autenticado.

**P: El iframe no carga (opción B)**
- R: Algunos servidores LMS o navegadores pueden bloquear iframes por razones de seguridad. Intenta:
  - Cambiar a la **Opción A (Botón)** 
  - Pedir al administrador de Tutor LMS que verifique las políticas de CORS/X-Frame-Options
  - Probar en un navegador diferente

**P: El iframe se ve muy pequeño o muy grande**
- R: Ajusta el valor de `height` en el HTML. Ejemplo: cambiar `height: 800px` a `height: 600px` para una altura menor.

**P: Progreso guardado en iframe vs botón**
- R: El simulador usa `localStorage` por navegador/dominio. El progreso se guarda igual en ambos casos (iframe y botón), pero es local a cada dispositivo.

## Seguridad

- El HTML generado es **estático y seguro** (sin scripts ejecutables)
- Los URL usan **codificación estándar de parámetros**
- El simulador se abre en una ventana nueva con `rel="noopener noreferrer"` por seguridad (opción A)
- Los iframes (opción B) usan `sandbox` con permisos limitados:
  - `allow-same-origin` — para que funcione el localStorage
  - `allow-scripts` — para que ejecute JavaScript
  - `allow-forms` — para que procese respuestas
  - `allow-popups` — para funcionalidad futura
  - `allow-storage-access-by-user-activation` — para acceso a almacenamiento con consentimiento

## Nota para Administradores

Para que esto funcione correctamente:

1. Asegúrate de que `https://alleanzasimulator-texas.vercel.app` esté accesible desde tu red
2. Si usas filtros de contenido, agrega el dominio a la lista de permitidos
3. El simulador usa `localStorage` para guardar progreso de estudiantes (por navegador)

---

**Última actualización:** Junio 13, 2026

Para preguntas o soporte, contacta al administrador del curso.
