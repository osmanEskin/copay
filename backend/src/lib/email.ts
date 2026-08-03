export async function sendEmail(options: { to: string; subject: string; html: string }): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not set')
  }
  if (!senderEmail) {
    throw new Error('BREVO_SENDER_EMAIL is not set')
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: 'Copay' },
      to: [{ email: options.to }],
      subject: options.subject,
      htmlContent: options.html,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Brevo email failed: ${response.status} ${body}`)
  }
}
