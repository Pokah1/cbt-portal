import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bank Recruitment Assessment
        </h1>
        <p className="text-gray-500 mb-8">
          Welcome to the official CBT portal. Please register to begin your assessment.
        </p>
        <Link
          href="/register"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Register for Assessment
        </Link>
      </div>
    </main>
  )
}