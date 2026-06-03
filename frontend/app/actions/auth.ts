'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { validatePassword } from '@/lib/passwordValidation'
import type { Database } from '@/lib/supabase/database.types'

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

function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function signUp(formData: {
  email: string
  password: string
  fullName: string
  role: 'customer' | 'employee'
}) {
  // Validate password on the server side
  const passwordValidation = validatePassword(formData.password)
  if (!passwordValidation.isValid) {
    throw new Error(
      `Password validation failed: ${passwordValidation.errors.join(', ')}`
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.fullName,
        role: formData.role,
      }
    }
  })
  if (error) throw error
  if (data.user) {
    // Create profile using the admin client to bypass RLS.
    const adminSupabase = createAdminClient()
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        full_name: formData.fullName,
        role: formData.role,
      } as any, { onConflict: 'id' })
    if (profileError) throw profileError
  }

  if (data.session) {
    redirect(dashboardForRole(data.user?.user_metadata?.role))
  }

  redirect('/login?signup=success')
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  redirect(dashboardForRole(data.user?.user_metadata?.role))
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function createProfile(profileData: {
  id: string
  fullName: string
  role: 'customer' | 'employee'
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
    .from('profiles')
    .upsert({
      id: profileData.id,
      full_name: profileData.fullName, 
      role: profileData.role,
    } as any, { onConflict: 'id' })
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true, data }
}
