import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;

    const protectedPaths = ['/car/add', '/car/edit']; // all protected routes here
    const authPath = '/auth';

    const currentPath = request.nextUrl.pathname;
    const isProtectedRoute = protectedPaths.some(path => currentPath.startsWith(path));
    const isAuthRoute = currentPath.startsWith(authPath);

    // If the user is authenticated and accesses the /auth route, redirect to home
    if (isAuthRoute && token) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // If the user is not authenticated and accesses a protected route, redirect to /auth
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL(authPath, request.url));
    }

    // Allow access for all other cases
    return NextResponse.next();
}
