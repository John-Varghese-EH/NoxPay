import { updateSession } from '@/utils/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
    const authPassword = process.env.AUTH_PASSWORD

    // If an AUTH_PASSWORD is set, we require it globally for the dashboard
    if (authPassword && authPassword.length > 0) {
        const { pathname } = request.nextUrl
        const publicPaths = ['/auth-password', '/api/auth-password']

        const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

        if (!isPublicPath) {
            const authCookie = request.cookies.get('noxpay-global-auth')
            if (authCookie?.value !== 'true') {
                return NextResponse.redirect(new URL('/auth-password', request.url))
            }
        }
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
