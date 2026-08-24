import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Check for the session cookie which is set upon login
  const session = request.cookies.get('session')?.value;
  
  // Protect the dashboard route
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('auth', 'true');
    url.searchParams.set('redirect', '/dashboard');
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  // Match all routes inside /dashboard
  matcher: ['/dashboard/:path*'],
};
