import { randomInt } from 'node:crypto'
import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { groupMembers, groupRole, groups, users } from '../db/schema.js'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set')
}

const groupsRoute = new Hono()
groupsRoute.use('*', jwt({ secret: JWT_SECRET, alg: 'HS256' }))

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[randomInt(0, chars.length)]
  }
  return code
}

function getMembership(groupId: string, userId: string) {
  return db.query.groupMembers.findFirst({
    where: and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)),
  })
}

const createGroupSchema = z.object({
  name: z.string().min(1),
})

groupsRoute.post('/', zValidator('json', createGroupSchema), async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }
  const { name } = c.req.valid('json')

  const [group] = await db.insert(groups).values({
    name,
    inviteCode: generateInviteCode(),
    createdBy: payload.sub,
  }).returning()

  await db.insert(groupMembers).values({ groupId: group.id, userId: payload.sub, role: 'admin' })

  return c.json({ ...group, role: 'admin', memberCount: 1 }, 201)
})

groupsRoute.get('/mine', async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }

  const rows = await db
    .select({
      id: groups.id,
      name: groups.name,
      inviteCode: groups.inviteCode,
      createdAt: groups.createdAt,
      role: groupMembers.role,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groups.id, groupMembers.groupId))
    .where(eq(groupMembers.userId, payload.sub))

  const withCounts = await Promise.all(
    rows.map(async (group) => {
      const members = await db.select().from(groupMembers).where(eq(groupMembers.groupId, group.id))
      return { ...group, memberCount: members.length }
    })
  )

  return c.json(withCounts)
})

groupsRoute.get('/:id', async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }
  const groupId = c.req.param('id')

  const membership = await getMembership(groupId, payload.sub)
  if (!membership) {
    return c.json({ error: 'Bu gruba erişiminiz yok' }, 403)
  }

  const [group] = await db.select().from(groups).where(eq(groups.id, groupId))
  if (!group) {
    return c.json({ error: 'Grup bulunamadı' }, 404)
  }

  const members = await db
    .select({
      userId: groupMembers.userId,
      role: groupMembers.role,
      joinedAt: groupMembers.joinedAt,
      name: users.name,
      email: users.email,
    })
    .from(groupMembers)
    .innerJoin(users, eq(users.id, groupMembers.userId))
    .where(eq(groupMembers.groupId, groupId))

  return c.json({ ...group, members })
})

const joinGroupSchema = z.object({
  code: z.string().min(1),
})

groupsRoute.post('/join', zValidator('json', joinGroupSchema), async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }
  const { code } = c.req.valid('json')

  const [group] = await db.select().from(groups).where(eq(groups.inviteCode, code.trim().toUpperCase()))
  if (!group) {
    return c.json({ error: 'Geçersiz davet kodu' }, 404)
  }

  const existing = await getMembership(group.id, payload.sub)
  if (existing) {
    return c.json({ error: 'Bu grubun zaten üyesisiniz' }, 409)
  }

  await db.insert(groupMembers).values({ groupId: group.id, userId: payload.sub, role: 'member' })

  return c.json(group, 201)
})

const updateMemberRoleSchema = z.object({
  role: z.enum(groupRole),
})

groupsRoute.patch('/:id/members/:userId', zValidator('json', updateMemberRoleSchema), async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }
  const groupId = c.req.param('id')
  const targetUserId = c.req.param('userId')
  const { role } = c.req.valid('json')

  const requesterMembership = await getMembership(groupId, payload.sub)
  if (!requesterMembership || requesterMembership.role !== 'admin') {
    return c.json({ error: 'Bu işlem için admin olmanız gerekiyor' }, 403)
  }

  await db.update(groupMembers)
    .set({ role })
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, targetUserId)))

  return c.json({ success: true })
})

groupsRoute.delete('/:id/members/:userId', async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }
  const groupId = c.req.param('id')
  const targetUserId = c.req.param('userId')

  const requesterMembership = await getMembership(groupId, payload.sub)
  if (!requesterMembership) {
    return c.json({ error: 'Bu gruba erişiminiz yok' }, 403)
  }

  const isSelf = targetUserId === payload.sub
  if (!isSelf && requesterMembership.role !== 'admin') {
    return c.json({ error: 'Bu işlem için admin olmanız gerekiyor' }, 403)
  }

  await db.delete(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, targetUserId)))

  return c.json({ success: true })
})

export default groupsRoute
