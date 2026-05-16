import LandingPage from "@/components/LandingPage";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  return <LandingPage error={params?.error} message={params?.message} />;
}
