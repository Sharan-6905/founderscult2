'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    redirect('/?error=Email and password are required')
  }

  // 1. Attempt login first
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  // 2. If it fails with "Invalid login credentials", they might be a new user
  if (error) {
    if (error.message === 'Invalid login credentials') {
      
      // Attempt to sign them up instead
      const { data, error: signupError } = await supabase.auth.signUp({ email, password })
      
      if (signupError) {
        // If they already exist, it means they just typed the wrong password
        if (signupError.message.includes('User already registered') || signupError.message.includes('already exists')) {
          redirect('/?error=Invalid login credentials')
        }
        redirect(`/?error=${encodeURIComponent(signupError.message)}`)
      }

      // 3. Auto-confirm using Service Role if available
      if (process.env.SUPABASE_SERVICE_ROLE_KEY && data.user) {
        try {
          const adminAuthClient = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { autoRefreshToken: false, persistSession: false } }
          );
          
          await adminAuthClient.auth.admin.updateUserById(data.user.id, { 
            email_confirm: true,
            user_metadata: { email_verified: true } 
          });

          // Final sign in to get the session
          await supabase.auth.signInWithPassword({ email, password });
        } catch (err) {
          console.error('Admin confirm error:', err)
        }
      }
    } else {
      console.error('Login error:', error)
      redirect(`/?error=${encodeURIComponent(error.message)}`)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/feed')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    redirect('/?error=Email and password are required')
  }

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    redirect(`/?error=${encodeURIComponent(error.message)}`)
  }

  // Auto-confirm using Service Role if available
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && data.user) {
    try {
      const adminAuthClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
      
      await adminAuthClient.auth.admin.updateUserById(data.user.id, { 
        email_confirm: true,
        user_metadata: { email_verified: true } 
      });

      await supabase.auth.signInWithPassword({ email, password });
    } catch (err) {
      console.error('Admin confirm error:', err)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/feed')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

