# Integración del Simulador de Práctica en Tutor LMS

Esta guía explica cómo integrar los simuladores de práctica en cada módulo de tu curso Tutor LMS.

## Descripción General

Cada módulo del curso tiene su propio simulador de práctica con preguntas específicas del tema. Los estudiantes pueden acceder al simulador desde dentro del módulo en Tutor LMS. El simulador se abre en una ventana nueva.

**Ventajas:**
- Los estudiantes practican preguntas específicas de cada módulo
- El simulador incluye explicaciones detalladas de respuestas correctas e incorrectas
- El simulador registra el progreso del estudiante
- No se necesita acceso a Tutor LMS desde el simulador

## Pasos para Integrar

### 1. Ubicar el archivo HTML del módulo

Para cada módulo, hay un archivo HTML correspondiente en la carpeta `generated-module-html/`:

```
generated-module-html/
├── module-01-m-dulo-1-dominio-i-tipos-de-p-lizas-de-v.html
├── module-02-m-dulo-2-dominio-ii-cl-usulas-adicionale.html
├── module-03-m-dulo-3-dominio-iii-completar-la-solici.html
└── ... (12 módulos en total)
```

### 2. Copiar el código HTML

Para cada módulo en Tutor LMS:

1. Abre el archivo HTML correspondiente (ej: `module-01-*.html`)
2. Copia TODO el contenido del archivo (Ctrl+A, Ctrl+C)

### 3. Pegar en el módulo de Tutor LMS

1. Ve al módulo correspondiente en Tutor LMS
2. Entra en modo de edición del módulo
3. Busca la sección donde deseas agregar el simulador (ej: al final del contenido)
4. Haz clic en **"Insert" → "HTML"** o similar (depende de tu versión de Tutor LMS)
5. Pega el contenido que copiaste (Ctrl+V)
6. Guarda los cambios

### 4. Verificar que funcione

1. Abre el módulo desde la vista de estudiante
2. Deberías ver un bloque azul con:
   - El título del módulo
   - Una descripción
   - Un botón "→ Abrir simulador de práctica"
3. Haz clic en el botón para verificar que el simulador se abre correctamente

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

Cada archivo HTML contiene:

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

El HTML es **auto-contenido** con estilos inline, por lo que funciona en cualquier contexto.

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

## Seguridad

- El HTML generado es **estático y seguro** (sin scripts ejecutables)
- Los URL usan **codificación estándar de parámetros**
- El simulador se abre en una ventana nueva con `rel="noopener noreferrer"` por seguridad

## Nota para Administradores

Para que esto funcione correctamente:

1. Asegúrate de que `https://alleanzasimulator-texas.vercel.app` esté accesible desde tu red
2. Si usas filtros de contenido, agrega el dominio a la lista de permitidos
3. El simulador usa `localStorage` para guardar progreso de estudiantes (por navegador)

---

**Última actualización:** Junio 13, 2026

Para preguntas o soporte, contacta al administrador del curso.
