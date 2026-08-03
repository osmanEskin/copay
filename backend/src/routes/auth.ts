import { randomInt } from 'node:crypto'
import { Hono } from 'hono'
import { jwt, sign } from 'hono/jwt'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { and, desc, eq, isNull } from 'drizzle-orm'
import { db } from '../db/index.js'
import { passwordResetCodes, users } from '../db/schema.js'
import { sendEmail } from '../lib/email.js'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set')
}

const auth = new Hono()

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
})

auth.post('/register', zValidator('json', registerSchema), async (c) => {
  const { name, email, password } = c.req.valid('json')

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) })
  if (existing) {
    return c.json({ error: 'Bu email zaten kayıtlı' }, 409)
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const [user] = await db.insert(users).values({ name, email, passwordHash }).returning()

  const token = await sign({ sub: user.id, email: user.email }, JWT_SECRET)
  return c.json({ token, user: { id: user.id, name: user.name, email: user.email } }, 201)
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')

  const user = await db.query.users.findFirst({ where: eq(users.email, email) })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return c.json({ error: 'Geçersiz email veya şifre' }, 401)
  }

  const token = await sign({ sub: user.id, email: user.email }, JWT_SECRET)
  return c.json({ token, user: { id: user.id, name: user.name, email: user.email } })
})

auth.get('/me', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }
  const user = await db.query.users.findFirst({ where: eq(users.id, payload.sub) })
  if (!user) {
    return c.json({ error: 'Kullanıcı bulunamadı' }, 404)
  }
  return c.json({ id: user.id, name: user.name, email: user.email })
})

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

auth.post('/forgot-password', zValidator('json', forgotPasswordSchema), async (c) => {
  const { email } = c.req.valid('json')

  const user = await db.query.users.findFirst({ where: eq(users.email, email) })

  if (user) {
    const code = randomInt(100000, 999999).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
    await db.insert(passwordResetCodes).values({ userId: user.id, code, expiresAt })
    await sendEmail({
      to: user.email,
      subject: 'Şifre Sıfırlama Kodu',
      html: `<p>Şifrenizi sıfırlamak için kodunuz: <strong>${code}</strong></p><p>Bu kod 15 dakika içinde geçerliliğini kaybedecek.</p>`,
    })
  }

  // Kullanıcı gerçekten var mı bilgisini sızdırmamak için her durumda aynı cevabı dönüyoruz.
  return c.json({ message: 'Eğer bu email kayıtlıysa bir sıfırlama kodu gönderildi.' })
})

const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8),
})

auth.post('/reset-password', zValidator('json', resetPasswordSchema), async (c) => {
  const { email, code, newPassword } = c.req.valid('json')

  const user = await db.query.users.findFirst({ where: eq(users.email, email) })
  if (!user) {
    return c.json({ error: 'Geçersiz veya süresi dolmuş kod' }, 400)
  }

  const resetCode = await db.query.passwordResetCodes.findFirst({
    where: and(
      eq(passwordResetCodes.userId, user.id),
      eq(passwordResetCodes.code, code),
      isNull(passwordResetCodes.usedAt)
    ),
    orderBy: desc(passwordResetCodes.createdAt),
  })

  if (!resetCode || resetCode.expiresAt < new Date()) {
    return c.json({ error: 'Geçersiz veya süresi dolmuş kod' }, 400)
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)
  await db.update(users).set({ passwordHash }).where(eq(users.id, user.id))
  await db.update(passwordResetCodes).set({ usedAt: new Date() }).where(eq(passwordResetCodes.id, resetCode.id))

  return c.json({ message: 'Şifreniz güncellendi' })
})

export default auth
