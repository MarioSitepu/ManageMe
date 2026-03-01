import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_this_later_in_production';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

const protectedRoutes = ['/', '/schedule', '/finance', '/profile', '/notes'];
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isProtectedRoute = protectedRoutes.some(route =>
        route === '/' ? pathname === '/' : (pathname === route || pathname.startsWith(`${route}/`))
    ) && !pathname.startsWith('/api/') && !pathname.startsWith('/_next/');

    const isAuthRoute = authRoutes.includes(pathname);

    const token = request.cookies.get('auth_token')?.value;

    let isAuthValid = false;

    if (token) {
        try {
            await jwtVerify(token, encodedSecret);
            isAuthValid = true;
        } catch (error) {
            isAuthValid = false;
        }
    }

    // Redirect to login if accessing protected route without valid token
    if (isProtectedRoute && !isAuthValid) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect to dashboard if trying to access login/register while authenticated
    if (isAuthRoute && isAuthValid) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
