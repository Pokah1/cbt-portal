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
    <main className="min-h-screen bg-slate-950 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-slate-800/50 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Assessly</span>
        </Link>
      </nav>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-white mb-2">
              Create Your Profile
            </h1>
            <p className="text-slate-400 text-sm">
              Register to access your assessment
            </p>
          </div>

          {/* Registration form */}
          <RegisterForm categories={categories ?? []} />

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-slate-500 text-xs font-medium uppercase tracking-widest">
              or
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Resume form */}
          <ResumeForm />

        </div>
      </div>

    </main>
  )
}