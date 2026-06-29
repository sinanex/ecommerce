import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ==========================================
// 🔴 MAINTENANCE MODE TOGGLE
// ==========================================
// Change this to `false` when you want to make the website live again.
const IS_MAINTENANCE_MODE = true;
// ==========================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!IS_MAINTENANCE_MODE) {
    // If maintenance is over, redirect anyone on the maintenance page back to home
    if (pathname.startsWith('/maintenance')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Exclude these paths from being redirected:
  // 1. /maintenance (To avoid infinite loop)
  // 2. /admin (So you can still access the dashboard)
  // 3. /api (So backend APIs still work)
  // 4. Any static files like images, fonts, etc. (contains a dot)
  if (
    pathname.startsWith('/maintenance') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Redirect all other users to the maintenance screen
  return NextResponse.redirect(new URL('/maintenance', request.url));
}

// Config ensures middleware runs on all paths
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
