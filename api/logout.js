import { serializeAuthCookie } from './_auth.js';

export default function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.statusCode = 405;
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Cache-Control', 'no-store');
    return response.end(JSON.stringify({ ok: false, message: 'Method not allowed.' }));
  }

  response.setHeader('Set-Cookie', serializeAuthCookie('', 0));
  response.statusCode = 200;
  response.setHeader('Content-Type', 'application/json');
  response.setHeader('Cache-Control', 'no-store');
  return response.end(JSON.stringify({ ok: true }));
}
