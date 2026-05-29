import { AUTH_COOKIE_NAME, getAccessPassword, isValidAuthCookie, parseCookieHeader } from './api/_auth.js';

export const config = {
  runtime: 'nodejs',
  matcher: ['/((?!api/|assets/|favicon.ico|robots.txt|manifest.json).*)'],
};

function redirect(pathname, request) {
  return Response.redirect(new URL(pathname, request.url));
}

export default function middleware(request) {
  const url = new URL(request.url);
  const password = getAccessPassword();
  const cookies = parseCookieHeader(request.headers.get('cookie') ?? '');
  const hasValidCookie = isValidAuthCookie(cookies[AUTH_COOKIE_NAME], password);

  if (url.pathname === '/login') {
    return hasValidCookie ? redirect('/', request) : undefined;
  }

  if (!hasValidCookie) {
    return redirect('/login', request);
  }

  return undefined;
}
