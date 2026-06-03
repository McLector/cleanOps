import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function dashboardForRole(role?: string | null) {
  switch (role) {
    case 'admin':
      return '/admin/dashboard'
    case 'employee':
      return '/employee/dashboard'
    default:
      return '/dashboard'
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  let redirectPath = '/dashboard'
  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      redirectPath = dashboardForRole(data.session?.user?.user_metadata?.role)
    }
  }
  return NextResponse.redirect(`${origin}${redirectPath}`)
}
