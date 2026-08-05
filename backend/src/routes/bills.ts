import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { desc, asc, eq, and, isNotNull, isNull } from 'drizzle-orm'
import { db } from '../db/index.js'
import {
  billParticipants,
  billRecurrence,
  bills,
  expenseSplitMethod,
  groupMembers,
  groups,
  users,
} from '../db/schema.js'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set')
}

const billsRoute = new Hono()
billsRoute.use('*', jwt({ secret: JWT_SECRET, alg: 'HS256' }))

export type BillStatus = 'Bekliyor' | 'Yaklaşan' | 'Geciken' | 'Ödendi'

function computeStatus(dueDate: string, paidAt: Date | null): BillStatus {
  if (paidAt) return 'Ödendi'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000)
  if (diffDays < 0) return 'Geciken'
  if (diffDays <= 3) return 'Yaklaşan'
  return 'Bekliyor'
}

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

const billInputSchema = z.object({
  groupId: z.string().uuid(),
  title: z.string().min(1),
  category: z.string().min(1),
  description: z.string().nullable(),
  amount: z.number().positive(),
  billDate: z.string().min(1),
  dueDate: z.string().min(1),
  payerId: z.string().uuid(),
  splitMethod: z.enum(expenseSplitMethod),
  recurrence: z.enum(billRecurrence),
  reminderDaysBefore: z.number().int().min(0),
  variableAmount: z.boolean(),
  participants: z.array(participantSchema).min(1),
})

function addInterval(dateIso: string, recurrence: (typeof billRecurrence)[number]): string {
  const monthsByRecurrence: Partial<Record<(typeof billRecurrence)[number], number>> = {
    monthly: 1,
    quarterly: 3,
    semiannual: 6,
    yearly: 12,
  }

  const [year, month, day] = dateIso.split('-').map(Number)

  if (recurrence === 'weekly') {
    const date = new Date(year, month - 1, day)
    date.setDate(date.getDate() + 7)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const months = monthsByRecurrence[recurrence]
  if (!months) {
    return dateIso
  }

  const totalMonth = month - 1 + months
  const targetYear = year + Math.floor(totalMonth / 12)
  const targetMonth = totalMonth % 12
  const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate()
  const targetDay = Math.min(day, lastDayOfTargetMonth)

  return `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`
}

async function validateBillInput(input: z.infer<typeof billInputSchema>, requesterId: string) {
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

billsRoute.post('/', zValidator('json', billInputSchema), async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }
  const input = c.req.valid('json')

  const validationError = await validateBillInput(input, payload.sub)
  if (validationError) {
    return c.json({ error: validationError }, 400)
  }

  const [bill] = await db.insert(bills).values({
    groupId: input.groupId,
    title: input.title,
    category: input.category,
    description: input.description,
    amount: input.amount,
    billDate: input.billDate,
    dueDate: input.dueDate,
    payerId: input.payerId,
    splitMethod: input.splitMethod,
    recurrence: input.recurrence,
    reminderDaysBefore: input.reminderDaysBefore,
    variableAmount: input.variableAmount,
  }).returning()

  await db.insert(billParticipants).values(
    input.participants.map((p) => ({
      billId: bill.id,
      userId: p.userId,
      shareAmount: p.shareAmount,
    }))
  )

  return c.json({ ...bill, status: computeStatus(bill.dueDate, bill.paidAt) }, 201)
})

billsRoute.get('/mine', async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }
  const groupIdFilter = c.req.query('groupId')

  const conditions = [eq(groupMembers.userId, payload.sub)]
  if (groupIdFilter) {
    conditions.push(eq(bills.groupId, groupIdFilter))
  }

  const rows = await db
    .select({
      id: bills.id,
      title: bills.title,
      category: bills.category,
      description: bills.description,
      amount: bills.amount,
      billDate: bills.billDate,
      dueDate: bills.dueDate,
      splitMethod: bills.splitMethod,
      recurrence: bills.recurrence,
      reminderDaysBefore: bills.reminderDaysBefore,
      reminderSentAt: bills.reminderSentAt,
      variableAmount: bills.variableAmount,
      paidAt: bills.paidAt,
      groupId: bills.groupId,
      groupName: groups.name,
      payerId: bills.payerId,
      payerName: users.name,
      createdAt: bills.createdAt,
    })
    .from(bills)
    .innerJoin(groupMembers, eq(groupMembers.groupId, bills.groupId))
    .innerJoin(groups, eq(groups.id, bills.groupId))
    .innerJoin(users, eq(users.id, bills.payerId))
    .where(and(...conditions))
    .orderBy(asc(bills.dueDate))

  return c.json(rows.map((r) => ({ ...r, status: computeStatus(r.dueDate, r.paidAt) })))
})

billsRoute.get('/history', async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }

  const rows = await db
    .select({
      id: bills.id,
      title: bills.title,
      category: bills.category,
      description: bills.description,
      amount: bills.amount,
      billDate: bills.billDate,
      dueDate: bills.dueDate,
      splitMethod: bills.splitMethod,
      recurrence: bills.recurrence,
      reminderDaysBefore: bills.reminderDaysBefore,
      reminderSentAt: bills.reminderSentAt,
      variableAmount: bills.variableAmount,
      paidAt: bills.paidAt,
      groupId: bills.groupId,
      groupName: groups.name,
      payerId: bills.payerId,
      payerName: users.name,
      createdAt: bills.createdAt,
    })
    .from(bills)
    .innerJoin(groupMembers, eq(groupMembers.groupId, bills.groupId))
    .innerJoin(groups, eq(groups.id, bills.groupId))
    .innerJoin(users, eq(users.id, bills.payerId))
    .where(and(eq(groupMembers.userId, payload.sub), isNotNull(bills.paidAt)))
    .orderBy(desc(bills.paidAt))

  return c.json(rows.map((r) => ({ ...r, status: computeStatus(r.dueDate, r.paidAt) })))
})

billsRoute.get('/recurring', async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }

  const rows = await db
    .select({
      id: bills.id,
      title: bills.title,
      category: bills.category,
      description: bills.description,
      amount: bills.amount,
      billDate: bills.billDate,
      dueDate: bills.dueDate,
      splitMethod: bills.splitMethod,
      recurrence: bills.recurrence,
      reminderDaysBefore: bills.reminderDaysBefore,
      reminderSentAt: bills.reminderSentAt,
      variableAmount: bills.variableAmount,
      paidAt: bills.paidAt,
      groupId: bills.groupId,
      groupName: groups.name,
      payerId: bills.payerId,
      payerName: users.name,
      createdAt: bills.createdAt,
    })
    .from(bills)
    .innerJoin(groupMembers, eq(groupMembers.groupId, bills.groupId))
    .innerJoin(groups, eq(groups.id, bills.groupId))
    .innerJoin(users, eq(users.id, bills.payerId))
    .where(and(eq(groupMembers.userId, payload.sub), isNull(bills.paidAt)))
    .orderBy(desc(bills.createdAt))

  const recurring = rows.filter((r) => r.recurrence !== 'none')
  return c.json(recurring.map((r) => ({ ...r, status: computeStatus(r.dueDate, r.paidAt) })))
})

billsRoute.get('/:id', async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }
  const billId = c.req.param('id')

  const [bill] = await db.select().from(bills).where(eq(bills.id, billId))
  if (!bill) {
    return c.json({ error: 'Fatura bulunamadı' }, 404)
  }

  const membership = await getGroupMembership(bill.groupId, payload.sub)
  if (!membership) {
    return c.json({ error: 'Bu faturaya erişiminiz yok' }, 403)
  }

  const [payer] = await db.select({ name: users.name }).from(users).where(eq(users.id, bill.payerId))

  const participants = await db
    .select({
      userId: billParticipants.userId,
      shareAmount: billParticipants.shareAmount,
      name: users.name,
    })
    .from(billParticipants)
    .innerJoin(users, eq(users.id, billParticipants.userId))
    .where(eq(billParticipants.billId, billId))

  return c.json({
    ...bill,
    payerName: payer?.name ?? '',
    status: computeStatus(bill.dueDate, bill.paidAt),
    participants,
  })
})

billsRoute.patch('/:id', zValidator('json', billInputSchema), async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }
  const billId = c.req.param('id')
  const input = c.req.valid('json')

  const [existing] = await db.select().from(bills).where(eq(bills.id, billId))
  if (!existing) {
    return c.json({ error: 'Fatura bulunamadı' }, 404)
  }

  const membership = await getGroupMembership(existing.groupId, payload.sub)
  if (!membership) {
    return c.json({ error: 'Bu faturaya erişiminiz yok' }, 403)
  }

  if (input.groupId !== existing.groupId) {
    return c.json({ error: 'Bir faturanın grubu değiştirilemez' }, 400)
  }

  const validationError = await validateBillInput(input, payload.sub)
  if (validationError) {
    return c.json({ error: validationError }, 400)
  }

  const [updated] = await db.update(bills).set({
    title: input.title,
    category: input.category,
    description: input.description,
    amount: input.amount,
    billDate: input.billDate,
    dueDate: input.dueDate,
    payerId: input.payerId,
    splitMethod: input.splitMethod,
    recurrence: input.recurrence,
    reminderDaysBefore: input.reminderDaysBefore,
    reminderSentAt: null,
    variableAmount: input.variableAmount,
  }).where(eq(bills.id, billId)).returning()

  await db.delete(billParticipants).where(eq(billParticipants.billId, billId))
  await db.insert(billParticipants).values(
    input.participants.map((p) => ({
      billId,
      userId: p.userId,
      shareAmount: p.shareAmount,
    }))
  )

  return c.json({ ...updated, status: computeStatus(updated.dueDate, updated.paidAt) })
})

billsRoute.post('/:id/pay', async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }
  const billId = c.req.param('id')

  const [existing] = await db.select().from(bills).where(eq(bills.id, billId))
  if (!existing) {
    return c.json({ error: 'Fatura bulunamadı' }, 404)
  }

  const membership = await getGroupMembership(existing.groupId, payload.sub)
  if (!membership) {
    return c.json({ error: 'Bu faturaya erişiminiz yok' }, 403)
  }

  if (existing.amount <= 0) {
    return c.json({ error: 'Ödeme olarak işaretlemeden önce bu ayın tutarını girmelisin' }, 400)
  }

  const [updated] = await db.update(bills).set({ paidAt: new Date() }).where(eq(bills.id, billId)).returning()

  if (existing.recurrence !== 'none') {
    const existingParticipants = await db
      .select({ userId: billParticipants.userId, shareAmount: billParticipants.shareAmount })
      .from(billParticipants)
      .where(eq(billParticipants.billId, billId))

    const nextAmount = existing.variableAmount ? 0 : existing.amount

    const [nextBill] = await db.insert(bills).values({
      groupId: existing.groupId,
      title: existing.title,
      category: existing.category,
      description: existing.description,
      amount: nextAmount,
      billDate: addInterval(existing.billDate, existing.recurrence),
      dueDate: addInterval(existing.dueDate, existing.recurrence),
      payerId: existing.payerId,
      splitMethod: existing.splitMethod,
      recurrence: existing.recurrence,
      reminderDaysBefore: existing.reminderDaysBefore,
      variableAmount: existing.variableAmount,
    }).returning()

    if (existingParticipants.length > 0) {
      await db.insert(billParticipants).values(
        existingParticipants.map((p) => ({
          billId: nextBill.id,
          userId: p.userId,
          shareAmount: existing.variableAmount ? 0 : p.shareAmount,
        }))
      )
    }
  }

  return c.json({ ...updated, status: computeStatus(updated.dueDate, updated.paidAt) })
})

billsRoute.delete('/:id', async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }
  const billId = c.req.param('id')

  const [existing] = await db.select().from(bills).where(eq(bills.id, billId))
  if (!existing) {
    return c.json({ error: 'Fatura bulunamadı' }, 404)
  }

  const membership = await getGroupMembership(existing.groupId, payload.sub)
  if (!membership) {
    return c.json({ error: 'Bu faturaya erişiminiz yok' }, 403)
  }

  await db.delete(bills).where(eq(bills.id, billId))

  return c.json({ success: true })
})

export default billsRoute
