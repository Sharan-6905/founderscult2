import { login, signup } from './actions'
import { Hexagon } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  const error = searchParams?.error;
  const message = searchParams?.message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)] p-4">
      <div className="w-full max-w-md bg-[var(--color-bg-elevated-1)] rounded-2xl shadow-2xl border border-[var(--color-bg-elevated-2)] overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[var(--color-accent-amber)] to-[var(--color-accent-gold)] flex items-center justify-center text-white shadow-lg">
              <span className="font-serif font-bold text-2xl font-[family-name:var(--font-logo)]">f</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-[var(--color-text-primary)] mb-2">Join FoundersCult</h2>
          <p className="text-center text-[var(--color-text-muted)] text-sm mb-6">
            Connect with founders and build your ideas.
          </p>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
              {error === 'true' ? 'Invalid email or password' : decodeURIComponent(error)}
            </div>
          )}

          {message && (
            <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm text-center">
              {decodeURIComponent(message)}
            </div>
          )}

          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[var(--color-text-secondary)]">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full h-11 px-4 rounded-lg bg-[var(--color-bg-elevated-2)] border border-transparent focus:border-[var(--color-accent-blue)] focus:bg-[var(--color-bg-elevated-1)] text-[var(--color-text-primary)] outline-none transition-all shadow-inner"
                placeholder="founder@startup.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[var(--color-text-secondary)]">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full h-11 px-4 rounded-lg bg-[var(--color-bg-elevated-2)] border border-transparent focus:border-[var(--color-accent-blue)] focus:bg-[var(--color-bg-elevated-1)] text-[var(--color-text-primary)] outline-none transition-all shadow-inner"
                placeholder="••••••••"
              />
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <button
                formAction={login}
                className="w-full h-11 rounded-lg bg-[var(--color-text-primary)] text-[var(--color-bg-base)] font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Sign In
              </button>
              <button
                formAction={signup}
                className="w-full h-11 rounded-lg bg-transparent border border-[var(--color-bg-elevated-3)] text-[var(--color-text-primary)] font-semibold hover:bg-[var(--color-bg-elevated-2)] active:scale-[0.98] transition-all"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
        <div className="px-8 py-4 bg-[var(--color-bg-elevated-2)]/50 border-t border-[var(--color-bg-elevated-2)] text-center">
          <Link href="/" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent-amber)] transition-colors">
            ← Back to Feed
          </Link>
        </div>
      </div>
    </div>
  )
}
