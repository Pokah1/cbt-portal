type Props = {
  candidateName: string
  candidateEmail: string
  candidatePhone: string
  categoryName: string
  examTitle: string
  score: number
  totalMarks: number
  percentage: number
  passed: boolean
  submittedAt: string
}

export function adminNotificationHtml({
  candidateName,
  candidateEmail,
  candidatePhone,
  categoryName,
  examTitle,
  score,
  totalMarks,
  percentage,
  passed,
  submittedAt,
}: Props): string {
  const statusColor = passed ? '#16a34a' : '#dc2626'
  const statusBg = passed ? '#f0fdf4' : '#fef2f2'
  const statusBorder = passed ? '#bbf7d0' : '#fecaca'

  const rows = [
    { label: 'Full Name', value: candidateName },
    { label: 'Email', value: candidateEmail },
    { label: 'Phone', value: candidatePhone },
    { label: 'Category', value: categoryName },
    {
      label: 'Submitted',
      value: new Date(submittedAt).toLocaleString('en-NG', {
        dateStyle: 'long',
        timeStyle: 'short',
      }),
    },
  ]

  const rowsHtml = rows
    .map(
      (row) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px;">
          ${row.label}
        </td>
        <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 13px; font-weight: 500; text-align: right;">
          ${row.value}
        </td>
      </tr>`
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Assessment Submission</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">

          <!-- Header -->
          <div style="background-color: #111827; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: bold;">
              New Assessment Submission
            </h1>
            <p style="color: #9ca3af; margin: 6px 0 0; font-size: 13px;">
              CBT Portal — Admin Notification
            </p>
          </div>

          <!-- Result badge -->
          <div style="background-color: ${statusBg}; border: 1px solid ${statusBorder}; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 16px;">
            <span style="font-size: 28px; font-weight: 900; color: ${statusColor};">
              ${percentage}% — ${passed ? 'PASS' : 'FAIL'}
            </span>
            <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0;">
              ${score}/${totalMarks} marks · ${examTitle}
            </p>
          </div>

          <!-- Candidate details -->
          <div style="background-color: #ffffff; border-radius: 12px; padding: 24px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
            <h2 style="color: #111827; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 16px;">
              Candidate Information
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
              ${rowsHtml}
            </table>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding: 8px;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0;">
              This is an automated message from your CBT Portal.
            </p>
          </div>

        </div>
      </body>
    </html>
  `
}