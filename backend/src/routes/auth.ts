import { Hono } from 'hono'
import { jwt, sign } from 'hono/jwt'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'

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

export default auth
