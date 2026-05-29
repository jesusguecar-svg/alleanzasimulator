import { createHmac, timingSafeEqual } from 'node:crypto';

export const AUTH_COOKIE_NAME = 'alleanza_access';
export const AUTH_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const AUTH_COOKIE_PAYLOAD = 'authenticated';

export function getAccessPassword() {
  const password = process.env.APP_ACCESS_PASSWORD;
  return typeof password === 'string' && password.length > 0 ? password : null;
}

function signPayload(payload, password) {
  return createHmac('sha256', password).update(payload).digest('base64url');
}

export function createAuthCookieValue(password) {
  return `${AUTH_COOKIE_PAYLOAD}.${signPayload(AUTH_COOKIE_PAYLOAD, password)}`;
}

export function isValidAuthCookie(cookieValue, password) {
  if (!cookieValue || !password) return false;

  const [payload, signature] = cookieValue.split('.');
  if (payload !== AUTH_COOKIE_PAYLOAD || !signature) return false;

  const expected = signPayload(payload, password);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function serializeAuthCookie(value, maxAge = AUTH_MAX_AGE_SECONDS) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${AUTH_COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`;
}

export function parseCookieHeader(cookieHeader = '') {
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const separatorIndex = cookie.indexOf('=');
        if (separatorIndex === -1) return [cookie, ''];
        return [cookie.slice(0, separatorIndex), decodeURIComponent(cookie.slice(separatorIndex + 1))];
      }),
  );
}
