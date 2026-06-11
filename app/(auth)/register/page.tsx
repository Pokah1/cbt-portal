import { createClient } from '@/lib/supabase/server'
import RegisterForm from '@/components/RegisterForm'

export default async function RegisterPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, description')
    .order('name')


  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Candidate Registration
          </h1>
          <p className="text-gray-500 mt-2">
            Complete your registration to begin the assessment
          </p>
        </div>
        <RegisterForm categories={categories ?? []} />
      </div>
    </main>
  )
}