import type { Connect, Plugin } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// public/examen-completo.html is a static page. Rewrite the extensionless
// path before Vite's static middleware and SPA fallback so dev and preview
// match the vercel.json rewrite.
const rewriteFullExam: Connect.NextHandleFunction = (req, _res, next) => {
  const raw = req.url ?? '';
  const queryIndex = raw.indexOf('?');
  const path = queryIndex === -1 ? raw : raw.slice(0, queryIndex);
  const search = queryIndex === -1 ? '' : raw.slice(queryIndex);
  if (path === '/examen-completo' || path === '/examen-completo/') {
    req.url = `/examen-completo.html${search}`;
  }
  next();
};

function fullExamStaticRoute(): Plugin {
  return {
    name: 'full-exam-static-route',
    configureServer(server) {
      server.middlewares.use(rewriteFullExam);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewriteFullExam);
    },
  };
}

export default defineConfig({
  plugins: [react(), fullExamStaticRoute()],
});
