type Props = {
  candidateName: string
  examTitle: string
  score: number
  totalMarks: number
  percentage: number
  passed: boolean
  sectionBreakdown: {
    title: string
    score: number
    total: number
  }[]
  submittedAt: string
}

export function candidateResultHtml({
  candidateName,
  examTitle,
  score,
  totalMarks,
  percentage,
  passed,
  sectionBreakdown,
  submittedAt,
}: Props): string {
  const statusColor = passed ? '#16a34a' : '#dc2626'
  const statusBg = passed ? '#f0fdf4' : '#fef2f2'
  const statusBorder = passed ? '#bbf7d0' : '#fecaca'
  const statusText = passed ? '🎉 Congratulations — You Passed!' : 'You did not pass this time'

  const sectionsHtml = sectionBreakdown
    .map(
      (section) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #374151; font-size: 14px;">
          ${section.title}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">
          ${section.score}/${section.total}
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
        <title>Your CBT Result</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">

          <!-- Header -->
          <div style="background-color: #1d4ed8; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">
              CBT Assessment Result
            </h1>
            <p style="color: #bfdbfe; margin: 8px 0 0; font-size: 14px;">
              ${examTitle}
            </p>
          </div>

          <!-- Greeting -->
          <div style="background-color: #ffffff; border-radius: 12px; padding: 24px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
            <p style="color: #374151; font-size: 16px; margin: 0 0 8px;">
              Dear ${candidateName},
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.6;">
              Thank you for completing the recruitment assessment. Your results are shown below.
            </p>
          </div>

          <!-- Score card -->
          <div style="background-color: ${statusBg}; border: 1px solid ${statusBorder}; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 16px;">
            <div style="font-size: 64px; font-weight: 900; color: ${statusColor}; line-height: 1; margin-bottom: 8px;">
              ${percentage}%
            </div>
            <p style="font-size: 18px; font-weight: 600; color: ${statusColor}; margin: 0 0 8px;">
              ${statusText}
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              ${score} out of ${totalMarks} marks
            </p>
          </div>

          <!-- Section breakdown -->
          <div style="background-color: #ffffff; border-radius: 12px; padding: 24px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
            <h2 style="color: #111827; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 16px;">
              Section Breakdown
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
              ${sectionsHtml}
            </table>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding: 16px;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.6;">
              Submitted on ${new Date(submittedAt).toLocaleString('en-NG', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0;">
              You will be contacted if you progress to the next stage of recruitment.
            </p>
          </div>

        </div>
      </body>
    </html>
  `
}