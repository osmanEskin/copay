import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { desc, eq, and } from 'drizzle-orm'
import { db } from '../db/index.js'
import { expenseParticipants, expenseSplitMethod, expenses, groupMembers, groups, users } from '../db/schema.js'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set')
}

const expensesRoute = new Hono()
expensesRoute.use('*', jwt({ secret: JWT_SECRET, alg: 'HS256' }))

function getGroupMembership(groupId: string, userId: string) {
  return db.query.groupMembers.findFirst({
    where: and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)),
  })
}

async function getGroupMemberIds(groupId: string): Promise<Set<string>> {
  const members = await db.select({ userId: groupMembers.userId }).from(groupMembers).where(eq(groupMembers.groupId, groupId))
  return new Set(members.map((m) => m.userId))
}

const participantSchema = z.object({
  userId: z.string().uuid(),
  shareAmount: z.number().positive(),
})

const expenseInputSchema = z.object({
  groupId: z.string().uuid(),
  title: z.string().min(1),
  category: z.string().min(1),
  description: z.string().nullable(),
  amount: z.number().positive(),
  date: z.string().min(1),
  payerId: z.string().uuid(),
  splitMethod: z.enum(expenseSplitMethod),
  participants: z.array(participantSchema).min(1),
})

async function validateExpenseInput(input: z.infer<typeof expenseInputSchema>, requesterId: string) {
  const requesterMembership = await getGroupMembership(input.groupId, requesterId)
  if (!requesterMembership) {
    return 'Bu gruba erişiminiz yok'
  }

  const memberIds = await getGroupMemberIds(input.groupId)
  if (!memberIds.has(input.payerId)) {
    return 'Ödeyen kişi grup üyesi değil'
  }
  for (const p of input.participants) {
    if (!memberIds.has(p.userId)) {
      return 'Katılımcılardan biri grup üyesi değil'
    }
  }

  const participantSum = input.participants.reduce((sum, p) => sum + p.shareAmount, 0)
  if (Math.abs(participantSum - input.amount) > 0.5) {
    return 'Katılımcı paylarının toplamı tutarı tutmuyor'
  }

  return null
}

expensesRoute.post('/', zValidator('json', expenseInputSchema), async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }
  const input = c.req.valid('json')

  const validationError = await validateExpenseInput(input, payload.sub)
  if (validationError) {
    return c.json({ error: validationError }, 400)
  }

  const [expense] = await db.insert(expenses).values({
    groupId: input.groupId,
    title: input.title,
    category: input.category,
    description: input.description,
    amount: input.amount,
    date: input.date,
    payerId: input.payerId,
    splitMethod: input.splitMethod,
  }).returning()

  await db.insert(expenseParticipants).values(
    input.participants.map((p) => ({
      expenseId: expense.id,
      userId: p.userId,
      shareAmount: p.shareAmount,
    }))
  )

  return c.json(expense, 201)
})

expensesRoute.get('/mine', async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }

  const rows = await db
    .select({
      id: expenses.id,
      title: expenses.title,
      category: expenses.category,
      description: expenses.description,
      amount: expenses.amount,
      date: expenses.date,
      splitMethod: expenses.splitMethod,
      groupId: expenses.groupId,
      groupName: groups.name,
      payerId: expenses.payerId,
      payerName: users.name,
      createdAt: expenses.createdAt,
    })
    .from(expenses)
    .innerJoin(groupMembers, eq(groupMembers.groupId, expenses.groupId))
    .innerJoin(groups, eq(groups.id, expenses.groupId))
    .innerJoin(users, eq(users.id, expenses.payerId))
    .where(eq(groupMembers.userId, payload.sub))
    .orderBy(desc(expenses.date), desc(expenses.createdAt))

  return c.json(rows)
})

expensesRoute.get('/analytics', async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }

  const rows = await db
    .select({
      amount: expenses.amount,
      category: expenses.category,
      date: expenses.date,
      payerId: expenses.payerId,
      payerName: users.name,
    })
    .from(expenses)
    .innerJoin(groupMembers, eq(groupMembers.groupId, expenses.groupId))
    .innerJoin(users, eq(users.id, expenses.payerId))
    .where(eq(groupMembers.userId, payload.sub))

  const now = new Date()
  const monthPrefix = now.toISOString().slice(0, 7)
  const monthRows = rows.filter((r) => r.date.startsWith(monthPrefix))

  const monthlyTotal = monthRows.reduce((sum, r) => sum + r.amount, 0)

  const byCategory = new Map<string, number>()
  for (const r of monthRows) {
    byCategory.set(r.category, (byCategory.get(r.category) ?? 0) + r.amount)
  }
  const categories = [...byCategory.entries()]
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: monthlyTotal ? Math.round((amount / monthlyTotal) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  const bySpender = new Map<string, { name: string; amount: number }>()
  for (const r of monthRows) {
    const existing = bySpender.get(r.payerId)
    bySpender.set(r.payerId, { name: r.payerName, amount: (existing?.amount ?? 0) + r.amount })
  }
  const topSpender = [...bySpender.values()].sort((a, b) => b.amount - a.amount)[0] ?? null

  const weekdayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
  const orderedWeekdays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
  const byWeekday = new Map<string, number>()
  for (const r of monthRows) {
    const day = weekdayNames[new Date(r.date).getUTCDay()]
    byWeekday.set(day, (byWeekday.get(day) ?? 0) + r.amount)
  }
  const maxWeekday = Math.max(1, ...orderedWeekdays.map((d) => byWeekday.get(d) ?? 0))
  const dailyChart = orderedWeekdays.map((day) => ({
    day,
    amount: byWeekday.get(day) ?? 0,
    height: Math.round(((byWeekday.get(day) ?? 0) / maxWeekday) * 100),
  }))

  return c.json({
    monthlyTotal,
    topSpender,
    topCategory: categories[0] ?? null,
    categories,
    dailyChart,
  })
})

expensesRoute.get('/:id', async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }
  const expenseId = c.req.param('id')

  const [expense] = await db.select().from(expenses).where(eq(expenses.id, expenseId))
  if (!expense) {
    return c.json({ error: 'Harcama bulunamadı' }, 404)
  }

  const membership = await getGroupMembership(expense.groupId, payload.sub)
  if (!membership) {
    return c.json({ error: 'Bu harcamaya erişiminiz yok' }, 403)
  }

  const [payer] = await db.select({ name: users.name }).from(users).where(eq(users.id, expense.payerId))

  const participants = await db
    .select({
      userId: expenseParticipants.userId,
      shareAmount: expenseParticipants.shareAmount,
      name: users.name,
    })
    .from(expenseParticipants)
    .innerJoin(users, eq(users.id, expenseParticipants.userId))
    .where(eq(expenseParticipants.expenseId, expenseId))

  return c.json({ ...expense, payerName: payer?.name ?? '', participants })
})

expensesRoute.patch('/:id', zValidator('json', expenseInputSchema), async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }
  const expenseId = c.req.param('id')
  const input = c.req.valid('json')

  const [existing] = await db.select().from(expenses).where(eq(expenses.id, expenseId))
  if (!existing) {
    return c.json({ error: 'Harcama bulunamadı' }, 404)
  }

  const membership = await getGroupMembership(existing.groupId, payload.sub)
  if (!membership) {
    return c.json({ error: 'Bu harcamaya erişiminiz yok' }, 403)
  }

  if (input.groupId !== existing.groupId) {
    return c.json({ error: 'Bir harcamanın grubu değiştirilemez' }, 400)
  }

  const validationError = await validateExpenseInput(input, payload.sub)
  if (validationError) {
    return c.json({ error: validationError }, 400)
  }

  const [updated] = await db.update(expenses).set({
    title: input.title,
    category: input.category,
    description: input.description,
    amount: input.amount,
    date: input.date,
    payerId: input.payerId,
    splitMethod: input.splitMethod,
  }).where(eq(expenses.id, expenseId)).returning()

  await db.delete(expenseParticipants).where(eq(expenseParticipants.expenseId, expenseId))
  await db.insert(expenseParticipants).values(
    input.participants.map((p) => ({
      expenseId,
      userId: p.userId,
      shareAmount: p.shareAmount,
    }))
  )

  return c.json(updated)
})

expensesRoute.delete('/:id', async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }
  const expenseId = c.req.param('id')

  const [existing] = await db.select().from(expenses).where(eq(expenses.id, expenseId))
  if (!existing) {
    return c.json({ error: 'Harcama bulunamadı' }, 404)
  }

  const membership = await getGroupMembership(existing.groupId, payload.sub)
  if (!membership) {
    return c.json({ error: 'Bu harcamaya erişiminiz yok' }, 403)
  }

  await db.delete(expenses).where(eq(expenses.id, expenseId))

  return c.json({ success: true })
})

export default expensesRoute
