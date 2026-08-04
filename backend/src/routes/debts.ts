import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { and, desc, eq, inArray, or } from 'drizzle-orm'
import { db } from '../db/index.js'
import {
  billParticipants,
  bills,
  expenseParticipants,
  expenses,
  groupMembers,
  settlementMethod,
  settlements,
  users,
} from '../db/schema.js'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set')
}

const debtsRoute = new Hono()
debtsRoute.use('*', jwt({ secret: JWT_SECRET, alg: 'HS256' }))

interface LedgerTx {
  id: string
  kind: 'expense' | 'bill'
  title: string
  date: string
  totalAmount: number
  shareAmount: number
  direction: 'owe_me' | 'i_owe'
}

interface LedgerEntry {
  net: number
  transactions: LedgerTx[]
  lastDate: string
}

async function computeLedger(userId: string, groupIdFilter?: string): Promise<Map<string, LedgerEntry>> {
  const ledger = new Map<string, LedgerEntry>()

  function ensure(otherId: string): LedgerEntry {
    let entry = ledger.get(otherId)
    if (!entry) {
      entry = { net: 0, transactions: [], lastDate: '' }
      ledger.set(otherId, entry)
    }
    return entry
  }

  function touch(otherId: string, date: string) {
    const entry = ensure(otherId)
    if (date > entry.lastDate) entry.lastDate = date
  }

  const myGroupRows = await db.select({ groupId: groupMembers.groupId }).from(groupMembers).where(eq(groupMembers.userId, userId))
  const myGroupIds = groupIdFilter
    ? myGroupRows.map((r) => r.groupId).filter((id) => id === groupIdFilter)
    : myGroupRows.map((r) => r.groupId)

  if (myGroupIds.length > 0) {
    const allExpenses = await db.select().from(expenses).where(inArray(expenses.groupId, myGroupIds))
    const expenseIds = allExpenses.map((e) => e.id)
    const allExpenseParticipants = expenseIds.length
      ? await db.select().from(expenseParticipants).where(inArray(expenseParticipants.expenseId, expenseIds))
      : []
    const participantsByExpense = new Map<string, typeof allExpenseParticipants>()
    for (const p of allExpenseParticipants) {
      const list = participantsByExpense.get(p.expenseId) ?? []
      list.push(p)
      participantsByExpense.set(p.expenseId, list)
    }

    for (const exp of allExpenses) {
      const parts = participantsByExpense.get(exp.id) ?? []
      if (exp.payerId === userId) {
        for (const p of parts) {
          if (p.userId === userId) continue
          const entry = ensure(p.userId)
          entry.net += p.shareAmount
          entry.transactions.push({
            id: exp.id,
            kind: 'expense',
            title: exp.title,
            date: exp.date,
            totalAmount: exp.amount,
            shareAmount: p.shareAmount,
            direction: 'owe_me',
          })
          touch(p.userId, exp.date)
        }
      } else {
        const myPart = parts.find((p) => p.userId === userId)
        if (myPart) {
          const entry = ensure(exp.payerId)
          entry.net -= myPart.shareAmount
          entry.transactions.push({
            id: exp.id,
            kind: 'expense',
            title: exp.title,
            date: exp.date,
            totalAmount: exp.amount,
            shareAmount: myPart.shareAmount,
            direction: 'i_owe',
          })
          touch(exp.payerId, exp.date)
        }
      }
    }

    const allBills = await db.select().from(bills).where(inArray(bills.groupId, myGroupIds))
    const billIds = allBills.map((b) => b.id)
    const allBillParticipants = billIds.length
      ? await db.select().from(billParticipants).where(inArray(billParticipants.billId, billIds))
      : []
    const participantsByBill = new Map<string, typeof allBillParticipants>()
    for (const p of allBillParticipants) {
      const list = participantsByBill.get(p.billId) ?? []
      list.push(p)
      participantsByBill.set(p.billId, list)
    }

    for (const bill of allBills) {
      const parts = participantsByBill.get(bill.id) ?? []
      if (bill.payerId === userId) {
        for (const p of parts) {
          if (p.userId === userId) continue
          const entry = ensure(p.userId)
          entry.net += p.shareAmount
          entry.transactions.push({
            id: bill.id,
            kind: 'bill',
            title: bill.title,
            date: bill.billDate,
            totalAmount: bill.amount,
            shareAmount: p.shareAmount,
            direction: 'owe_me',
          })
          touch(p.userId, bill.billDate)
        }
      } else {
        const myPart = parts.find((p) => p.userId === userId)
        if (myPart) {
          const entry = ensure(bill.payerId)
          entry.net -= myPart.shareAmount
          entry.transactions.push({
            id: bill.id,
            kind: 'bill',
            title: bill.title,
            date: bill.billDate,
            totalAmount: bill.amount,
            shareAmount: myPart.shareAmount,
            direction: 'i_owe',
          })
          touch(bill.payerId, bill.billDate)
        }
      }
    }
  }

  const mySettlements = await db
    .select()
    .from(settlements)
    .where(or(eq(settlements.fromUserId, userId), eq(settlements.toUserId, userId)))

  for (const s of mySettlements) {
    const otherId = s.fromUserId === userId ? s.toUserId : s.fromUserId
    const entry = ensure(otherId)
    if (s.fromUserId === userId) {
      entry.net += s.amount
    } else {
      entry.net -= s.amount
    }
    touch(otherId, s.settledAt.toISOString().slice(0, 10))
  }

  return ledger
}

function statusFor(net: number): 'owe_me' | 'i_owe' | 'settled' {
  if (net > 0.01) return 'owe_me'
  if (net < -0.01) return 'i_owe'
  return 'settled'
}

debtsRoute.get('/mine', async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }
  const groupIdFilter = c.req.query('groupId')
  const ledger = await computeLedger(payload.sub, groupIdFilter)
  const otherIds = [...ledger.keys()]
  if (otherIds.length === 0) {
    return c.json([])
  }

  const people = await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, otherIds))
  const nameById = new Map(people.map((p) => [p.id, p.name]))

  const result = otherIds.map((id) => {
    const entry = ledger.get(id)!
    return {
      personId: id,
      personName: nameById.get(id) ?? '',
      amount: Math.round(Math.abs(entry.net) * 100) / 100,
      type: statusFor(entry.net),
      openTxCount: entry.transactions.length,
      lastDate: entry.lastDate || null,
    }
  })

  return c.json(result)
})

debtsRoute.get('/history', async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }

  const rows = await db
    .select()
    .from(settlements)
    .where(or(eq(settlements.fromUserId, payload.sub), eq(settlements.toUserId, payload.sub)))
    .orderBy(desc(settlements.settledAt))

  const otherIds = [...new Set(rows.map((r) => (r.fromUserId === payload.sub ? r.toUserId : r.fromUserId)))]
  const people = otherIds.length ? await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, otherIds)) : []
  const nameById = new Map(people.map((p) => [p.id, p.name]))

  return c.json(
    rows.map((r) => {
      const otherId = r.fromUserId === payload.sub ? r.toUserId : r.fromUserId
      return {
        id: r.id,
        amount: r.amount,
        method: r.method,
        note: r.note,
        settledAt: r.settledAt,
        otherUserId: otherId,
        otherUserName: nameById.get(otherId) ?? '',
        direction: r.fromUserId === payload.sub ? 'paid' : 'received',
      }
    })
  )
})

debtsRoute.get('/:personId', async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }
  const personId = c.req.param('personId')

  const [person] = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.id, personId))
  if (!person) {
    return c.json({ error: 'Kullanıcı bulunamadı' }, 404)
  }

  const ledger = await computeLedger(payload.sub)
  const entry = ledger.get(personId)
  const net = entry?.net ?? 0
  const transactions = [...(entry?.transactions ?? [])].sort((a, b) => b.date.localeCompare(a.date))

  return c.json({
    personId,
    personName: person.name,
    amount: Math.round(Math.abs(net) * 100) / 100,
    type: statusFor(net),
    openTxCount: transactions.length,
    lastDate: entry?.lastDate || null,
    transactions,
  })
})

const settleSchema = z.object({
  otherUserId: z.string().uuid(),
  amount: z.number().positive(),
  direction: z.enum(['i_paid', 'they_paid']),
  method: z.enum(settlementMethod),
  note: z.string().nullable(),
})

debtsRoute.post('/settle', zValidator('json', settleSchema), async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }
  const { otherUserId, amount, direction, method, note } = c.req.valid('json')

  if (otherUserId === payload.sub) {
    return c.json({ error: 'Kendine hesaplaşma kaydı oluşturamazsın' }, 400)
  }

  const myGroups = await db.select({ groupId: groupMembers.groupId }).from(groupMembers).where(eq(groupMembers.userId, payload.sub))
  const myGroupIds = new Set(myGroups.map((g) => g.groupId))
  const otherGroups = await db.select({ groupId: groupMembers.groupId }).from(groupMembers).where(eq(groupMembers.userId, otherUserId))
  const sharesGroup = otherGroups.some((g) => myGroupIds.has(g.groupId))
  if (!sharesGroup) {
    return c.json({ error: 'Bu kullanıcıyla ortak bir grubunuz yok' }, 403)
  }

  const fromUserId = direction === 'i_paid' ? payload.sub : otherUserId
  const toUserId = direction === 'i_paid' ? otherUserId : payload.sub

  const [settlement] = await db.insert(settlements).values({ fromUserId, toUserId, amount, method, note }).returning()

  return c.json(settlement, 201)
})

export default debtsRoute
