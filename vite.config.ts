import fs from 'node:fs';
import path from 'node:path';
import { loadEnv, type Connect, type Plugin, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const WEBHOOK_TOKEN = '__FULL_EXAM_WEBHOOK__';

function fullExamWebhookUrl(mode: string) {
  const fileEnv = loadEnv(mode, process.cwd(), 'VITE_');
  return process.env.VITE_FULL_EXAM_WEBHOOK_URL
    || fileEnv.VITE_FULL_EXAM_WEBHOOK_URL
    || process.env.VITE_RESULTS_WEBHOOK_URL
    || fileEnv.VITE_RESULTS_WEBHOOK_URL
    || '';
}

function applyFullExamWebhook(html: string, url: string) {
  return html.split(WEBHOOK_TOKEN).join(url);
}

function isFullExamRequest(url: string | undefined) {
  const raw = url ?? '';
  const queryIndex = raw.indexOf('?');
  const pathname = queryIndex === -1 ? raw : raw.slice(0, queryIndex);
  return pathname === '/examen-completo/sesion' || pathname === '/examen-completo/sesion/' || pathname === '/examen-completo.html';
}

// public/full-exam-player.html is the question player. The booking page is the
// React route /examen-completo, so this file must not be named examen-completo.html.
function fullExamStaticRoute(mode: string): Plugin {
  const webhookUrl = fullExamWebhookUrl(mode);
  const serve = (file: string): Connect.NextHandleFunction => (req, res, next) => {
    if (!isFullExamRequest(req.url)) return next();
    const html = applyFullExamWebhook(fs.readFileSync(file, 'utf8'), webhookUrl);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.end(html);
    return;
  };

  return {
    name: 'full-exam-static-route',
    configureServer(server) {
      server.middlewares.use(serve(path.join(server.config.publicDir, 'full-exam-player.html')));
    },
    configurePreviewServer(server) {
      server.middlewares.use(serve(path.resolve(server.config.root, server.config.build.outDir, 'full-exam-player.html')));
    },
    closeBundle() {
      const file = path.resolve(process.cwd(), 'dist/full-exam-player.html');
      if (!fs.existsSync(file)) return;
      fs.writeFileSync(file, applyFullExamWebhook(fs.readFileSync(file, 'utf8'), webhookUrl));
    },
  };
}

export default defineConfig(({ mode }) => ({
  define: {
    'import.meta.env.VITE_VERCEL_ENV': JSON.stringify(process.env.VITE_VERCEL_ENV || process.env.VERCEL_ENV || ''),
  },
  plugins: [react(), fullExamStaticRoute(mode)],
}));
