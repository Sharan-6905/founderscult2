'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  // New profile fields
  const phone = formData.get('phone') as string;
  const age = parseInt(formData.get('age') as string) || null;
  const gender = formData.get('gender') as string;
  const status = formData.get('status') as string;
  const interestsRaw = formData.get('interests') as string;
  const building_details = formData.get('building_details') as string;
  const linkedin = formData.get('linkedin') as string;
  const twitter = formData.get('twitter') as string;
  const instagram = formData.get('instagram') as string;

  if (!email || !password) {
    redirect('/?error=Email and password are required')
  }

  // 1. Attempt login first
  const signInResponse = await supabase.auth.signInWithPassword({ email, password })
  let authData: any = signInResponse.data;
  let error = signInResponse.error;

  // 2. If it fails with "Invalid login credentials", they are a new user
  if (error && error.message === 'Invalid login credentials') {
    const { data, error: signupError } = await supabase.auth.signUp({ email, password })
    
    if (signupError) {
      if (signupError.message.includes('User already registered')) {
        redirect('/?error=Invalid login credentials')
      }
      redirect(`/?error=${encodeURIComponent(signupError.message)}`)
    }
    
    authData = data;

    // 3. Auto-confirm using Service Role
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
        const { data: finalAuth } = await supabase.auth.signInWithPassword({ email, password });
        authData = finalAuth;
      } catch (err) {
        console.error('Admin confirm error:', err)
      }
    }
  } else if (error) {
    redirect(`/?error=${encodeURIComponent(error.message)}`)
  }

  // 4. Update the profile with the extra information
  if (authData?.user) {
    const interests = interestsRaw ? interestsRaw.split(',').map(i => i.trim()) : [];
    
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        phone,
        age,
        gender,
        status,
        interests,
        building_details,
        linkedin,
        twitter,
        instagram,
        updated_at: new Date().toISOString()
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
    }
  }

  revalidatePath('/', 'layout')
  redirect('/feed')
}

export async function signup(formData: FormData) {
  return login(formData);
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
