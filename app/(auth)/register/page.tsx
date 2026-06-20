import { createClient } from '@/lib/supabase/server'
import RegisterForm from '@/components/RegisterForm'
import ResumeForm from '@/components/ResumeForm'
import Link from 'next/link'

export default async function RegisterPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, description')
    .order('name')

  return (
    <main className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-slate-800/50 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full flex-shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Assessly</span>
        </Link>
      </nav>

      {/* Content — fills remaining viewport height */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-5xl">

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1.5">
              Get Started
            </h1>
            <p className="text-slate-400 text-sm">
              Register as a new candidate or resume an existing session
            </p>
          </div>

          {/* Two-column layout on large screens, stacked on mobile */}
          <div className="flex flex-col lg:flex-row gap-5 lg:items-stretch">
            <div className="flex-1">
              <RegisterForm categories={categories ?? []} />
            </div>

            {/* Divider — vertical on desktop, horizontal on mobile */}
            <div className="flex lg:flex-col items-center gap-3 lg:gap-0">
              <div className="flex-1 lg:flex-none lg:flex-1 h-px lg:h-auto lg:w-px bg-white/10" />
              <span className="text-slate-500 text-xs font-medium uppercase tracking-widest px-2 lg:py-2">
                or
              </span>
              <div className="flex-1 lg:flex-none lg:flex-1 h-px lg:h-auto lg:w-px bg-white/10" />
            </div>

            <div className="flex-1">
              <ResumeForm />
            </div>
          </div>

        </div>
      </div>

    </main>
  )
}