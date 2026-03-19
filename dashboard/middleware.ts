import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// Public routes that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/forgot-password',
  '/reset-password',
  '/checkout',
  '/widget',
  '/auth',
  '/docs',
  '/api',
]

function isPublicPath(pathname: string): boolean {
  return publicPaths.some(path => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  })
}

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}