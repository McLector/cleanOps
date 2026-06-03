import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const publicPaths = new Set([
    '/',
    '/homepage',
    '/login',
    '/signup',
    '/forgot-password',
    '/auth/callback',
  ])

  // Public pages do not need auth refresh. Skipping Supabase here avoids
  // edge-runtime fetch noise for anonymous traffic and dev startup.
  if (publicPaths.has(pathname)) {
    return NextResponse.next({ request })
  }

  const hasSupabaseSessionCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith('sb-'))

  // If the request has no Supabase cookies, there is nothing to refresh.
  if (!hasSupabaseSessionCookie) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }: any) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  try {
    await supabase.auth.getUser()
  } catch (error) {
    // Keep the request flowing if Supabase auth refresh is unavailable.
    // This prevents dev-time noise and avoids hard failures on transient auth/network issues.
    console.warn('[supabase/middleware] session refresh skipped:', error instanceof Error ? error.message : error)
  }
  return supabaseResponse
}
