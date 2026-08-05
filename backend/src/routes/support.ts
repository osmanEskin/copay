import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { sendEmail } from '../lib/email.js'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set')
}

const support = new Hono()
support.use('*', jwt({ secret: JWT_SECRET, alg: 'HS256' }))

const feedbackSchema = z.object({
  type: z.enum(['feedback', 'bug']),
  message: z.string().min(1).max(5000),
})

support.post('/feedback', zValidator('json', feedbackSchema), async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }
  const { type, message } = c.req.valid('json')

  const user = await db.query.users.findFirst({ where: eq(users.id, payload.sub) })
  if (!user) {
    return c.json({ error: 'Kullanıcı bulunamadı' }, 404)
  }

  const supportEmail = process.env.SUPPORT_EMAIL ?? process.env.BREVO_SENDER_EMAIL
  if (!supportEmail) {
    throw new Error('SUPPORT_EMAIL is not set')
  }

  const subject = type === 'bug' ? 'Copay - Hata Bildirimi' : 'Copay - Geri Bildirim'
  await sendEmail({
    to: supportEmail,
    subject,
    html: `<p><strong>Gönderen:</strong> ${user.name} (${user.email})</p><p><strong>Mesaj:</strong></p><p>${message.replace(/\n/g, '<br />')}</p>`,
  })

  return c.json({ message: 'Mesajınız iletildi, teşekkürler!' })
})

export default support
