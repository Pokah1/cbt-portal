import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 relative overflow-hidden">

      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-800/50 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            Assessly
          </span>
        </div>
        <Link
          href="/admin/login"
          className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
        >
          Admin →
        </Link>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-6 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-4 py-2 rounded-full mb-8 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Recruitment Assessment Portal
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight max-w-4xl mb-6">
          Your Skills,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
            Proven.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-slate-400 text-lg sm:text-xl max-w-xl mb-10 leading-relaxed">
          Complete your recruitment assessment in a secure, timed, and
          professionally administered online environment.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm sm:max-w-none sm:justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8 py-4 rounded-2xl transition-all hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0"
          >
            Begin Registration
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-4 rounded-2xl transition-all"
          >
            Already registered? Resume
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-16 border-t border-white/5 w-full max-w-2xl mb-2">
          {[
            { value: '100%', label: 'Secure & Timed' },
            { value: '2', label: 'Assessment Categories' },
            { value: '40', label: 'Questions per Exam' },
            { value: '20min', label: 'Total Duration' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-extrabold text-white">{stat.value}</p>
              <p className="text-slate-500 text-xs mt-0.5 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}