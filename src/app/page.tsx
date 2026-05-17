import LandingPage from "@/components/LandingPage";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  
  // Check if user is already logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/feed');
  }

  return <LandingPage error={params?.error} message={params?.message} />;
}
