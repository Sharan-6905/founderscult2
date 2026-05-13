import LandingPage from "@/components/LandingPage";

export default function Home({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  return <LandingPage error={searchParams?.error} message={searchParams?.message} />;
}
