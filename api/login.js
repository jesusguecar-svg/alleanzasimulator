import { createAuthCookieValue, getAccessPassword, serializeAuthCookie } from './_auth.js';

function sendJson(response, statusCode, body, headers = {}) {
  response.statusCode = statusCode;
  Object.entries({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers }).forEach(([key, value]) => {
    response.setHeader(key, value);
  });
  response.end(JSON.stringify(body));
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return {};
  }
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendJson(response, 405, { ok: false, message: 'Method not allowed.' });
  }

  const accessPassword = getAccessPassword();
  if (!accessPassword) {
    return sendJson(response, 500, {
      ok: false,
      code: 'missing_password',
      message: 'Access is not configured. Please ask the site owner to set APP_ACCESS_PASSWORD.',
    });
  }

  const body = await readJsonBody(request);
  if (typeof body.password !== 'string' || body.password !== accessPassword) {
    return sendJson(response, 401, { ok: false, message: 'Invalid password.' });
  }

  response.setHeader('Set-Cookie', serializeAuthCookie(createAuthCookieValue(accessPassword)));
  return sendJson(response, 200, { ok: true });
}
