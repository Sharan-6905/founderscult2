import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/feed'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Create profile automatically using database trigger, or
      // it's already handled if the trigger is setup.
      return NextResponse.redirect(`${origin}${next}`)
    }
    
    console.error('OAuth Error:', error.message)
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/?error=Authentication%20failed`)
}
