import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

/**
 * NoxPay Edge Middleware — HTTP Basic Auth Gate
 * 
 * Protects admin routes at the edge level BEFORE any HTML/JS/CSS is served.
 * Unauthorized users see the browser's native "Enter credentials" popup.
 * Zero information leakage — no page source, no component names, nothing.
 * 
 * Public routes (checkout, widget, API, landing) bypass this entirely.
 */

// Routes that should NEVER require Basic Auth
const PUBLIC_PREFIXES = [
  '/checkout',
  '/widget',
  '/api/',
  '/_next/',
  '/health',
]

const PUBLIC_EXACT = [
  '/',
  '/favicon.ico',
  '/icon.svg',
]

function isPublicRoute(pathname: string): boolean {
  // Exact matches
  if (PUBLIC_EXACT.includes(pathname)) return true

  // Prefix matches
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(prefix)) return true
  }

  // Static file extensions
  if (/\.(svg|png|jpg|jpeg|gif|ico|webp|woff2?|ttf|css|js|map)$/i.test(pathname)) {
    return true
  }

  return false
}

function unauthorizedResponse() {
  return new NextResponse('Authentication required to access NoxPay Dashboard.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="NoxPay Admin Dashboard", charset="UTF-8"',
      'Content-Type': 'text/plain',
    },
  })
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes through without any auth
  if (isPublicRoute(pathname)) {
    return updateSession(request)
  }

  // --- HTTP Basic Auth Check for admin routes ---
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return unauthorizedResponse()
  }

  // Decode Base64 credentials → "username:password"
  const base64Credentials = authHeader.split(' ')[1]
  let credentials: string

  try {
    credentials = atob(base64Credentials)
  } catch {
    return unauthorizedResponse()
  }

  const [username, password] = credentials.split(':')
  const expectedPassword = process.env.AUTH_PASSWORD

  if (!expectedPassword) {
    // If AUTH_PASSWORD is not set, block everything for safety
    return new NextResponse('Server misconfiguration: AUTH_PASSWORD is not set.', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  // Validate credentials: username must be "admin", password must match AUTH_PASSWORD
  if (username !== 'admin' || password !== expectedPassword) {
    return unauthorizedResponse()
  }

  // Auth passed — continue to Supabase session refresh and the page
  return updateSession(request)
}

// Ensure Next.js middleware execution by aliasing
export const middleware = proxy;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
