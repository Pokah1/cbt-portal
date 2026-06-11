import { createClient } from '@/lib/supabase/server'
import RegisterForm from '@/components/RegisterForm'
import ResumeForm from '@/components/ResumeForm'

export default async function RegisterPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, description')
    .order('name')

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Candidate Registration
          </h1>
          <p className="text-gray-500 mt-2">
            Complete your registration to begin the assessment
          </p>
        </div>

        {/* Registration form */}
        <RegisterForm categories={categories ?? []} />

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm font-medium">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Resume form */}
        <ResumeForm />

      </div>
    </main>
  )
}