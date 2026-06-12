import { Resend } from 'resend'
import { candidateResultHtml } from './candidateResult'
import { adminNotificationHtml } from './adminNotification'

const resend = new Resend(process.env.RESEND_API_KEY)

type SendResultEmailsProps = {
  candidate: {
    full_name: string
    email: string
    phone: string
  }
  category: { name: string }
  exam: { title: string }
  attempt: {
    score: number
    total_marks: number
    submitted_at: string
  }
  sectionBreakdown: {
    title: string
    score: number
    total: number
  }[]
}

export async function sendResultEmails({
  candidate,
  category,
  exam,
  attempt,
  sectionBreakdown,
}: SendResultEmailsProps) {
  const percentage = Math.round(
    (attempt.score / attempt.total_marks) * 100
  )
  const passed = percentage >= 50

  const [candidateEmail, adminEmail] = await Promise.allSettled([
    resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: candidate.email,
      subject: `Your CBT Result — ${exam.title}`,
      html: candidateResultHtml({
        candidateName: candidate.full_name,
        examTitle: exam.title,
        score: attempt.score,
        totalMarks: attempt.total_marks,
        percentage,
        passed,
        sectionBreakdown,
        submittedAt: attempt.submitted_at,
      }),
    }),

    resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: process.env.ADMIN_EMAIL!,
      subject: `New Submission — ${candidate.full_name} (${passed ? 'PASS' : 'FAIL'})`,
      html: adminNotificationHtml({
        candidateName: candidate.full_name,
        candidateEmail: candidate.email,
        candidatePhone: candidate.phone,
        categoryName: category.name,
        examTitle: exam.title,
        score: attempt.score,
        totalMarks: attempt.total_marks,
        percentage,
        passed,
        submittedAt: attempt.submitted_at,
      }),
    }),
  ])

  if (candidateEmail.status === 'rejected') {
    console.error('Candidate email failed:', candidateEmail.reason)
  }

  if (adminEmail.status === 'rejected') {
    console.error('Admin email failed:', adminEmail.reason)
  }

  return { success: true }
}