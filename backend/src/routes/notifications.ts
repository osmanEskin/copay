import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import { and, desc, eq, gte, inArray, isNull, lte, or } from 'drizzle-orm'
import { db } from '../db/index.js'
import { bills, expenses, groupMembers, groups, settlements, users } from '../db/schema.js'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set')
}

const notificationsRoute = new Hono()
notificationsRoute.use('*', jwt({ secret: JWT_SECRET, alg: 'HS256' }))

notificationsRoute.get('/', async (c) => {
  const payload = c.get('jwtPayload') as { sub: string }

  const user = await db.query.users.findFirst({ where: eq(users.id, payload.sub) })
  if (!user) {
    return c.json({ error: 'Kullanıcı bulunamadı' }, 404)
  }

  const myGroupRows = await db.select({ groupId: groupMembers.groupId }).from(groupMembers).where(eq(groupMembers.userId, payload.sub))
  const myGroupIds = myGroupRows.map((r) => r.groupId)

  if (myGroupIds.length === 0) {
    return c.json({ upcoming: [], recent: [] })
  }

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
  const todayIso = now.toISOString().slice(0, 10)
  const threeDaysIso = threeDaysFromNow.toISOString().slice(0, 10)

  const recentItems: { id: string; type: 'expense_added' | 'bill_added' | 'debt_settled'; message: string; groupName: string; createdAt: Date }[] = []

  if (user.notifyNewExpense) {
    const recentExpenses = await db
      .select({
        id: expenses.id,
        title: expenses.title,
        amount: expenses.amount,
        createdAt: expenses.createdAt,
        groupName: groups.name,
        payerName: users.name,
      })
      .from(expenses)
      .innerJoin(groups, eq(groups.id, expenses.groupId))
      .innerJoin(users, eq(users.id, expenses.payerId))
      .where(and(inArray(expenses.groupId, myGroupIds), gte(expenses.createdAt, sevenDaysAgo)))
      .orderBy(desc(expenses.createdAt))
      .limit(20)

    recentItems.push(
      ...recentExpenses.map((e) => ({
        id: `expense-${e.id}`,
        type: 'expense_added' as const,
        message: `${e.payerName} "${e.title}" harcaması ekledi (₺${e.amount.toLocaleString('tr-TR')})`,
        groupName: e.groupName,
        createdAt: e.createdAt,
      }))
    )
  }

  if (user.notifyNewBill) {
    const recentBills = await db
      .select({
        id: bills.id,
        title: bills.title,
        amount: bills.amount,
        createdAt: bills.createdAt,
        groupName: groups.name,
        payerName: users.name,
      })
      .from(bills)
      .innerJoin(groups, eq(groups.id, bills.groupId))
      .innerJoin(users, eq(users.id, bills.payerId))
      .where(and(inArray(bills.groupId, myGroupIds), gte(bills.createdAt, sevenDaysAgo)))
      .orderBy(desc(bills.createdAt))
      .limit(20)

    recentItems.push(
      ...recentBills.map((b) => ({
        id: `bill-${b.id}`,
        type: 'bill_added' as const,
        message: `${b.payerName} "${b.title}" faturası ekledi (₺${b.amount.toLocaleString('tr-TR')})`,
        groupName: b.groupName,
        createdAt: b.createdAt,
      }))
    )
  }

  if (user.notifyDebtUpdates) {
    const recentSettlements = await db
      .select({
        id: settlements.id,
        amount: settlements.amount,
        settledAt: settlements.settledAt,
        fromUserId: settlements.fromUserId,
        toUserId: settlements.toUserId,
        fromName: users.name,
      })
      .from(settlements)
      .innerJoin(users, eq(users.id, settlements.fromUserId))
      .where(and(or(eq(settlements.fromUserId, payload.sub), eq(settlements.toUserId, payload.sub)), gte(settlements.settledAt, sevenDaysAgo)))
      .orderBy(desc(settlements.settledAt))
      .limit(20)

    const otherPartyIds = recentSettlements.map((s) => (s.fromUserId === payload.sub ? s.toUserId : s.fromUserId))
    const otherParties = otherPartyIds.length
      ? await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, otherPartyIds))
      : []
    const nameById = new Map(otherParties.map((p) => [p.id, p.name]))

    recentItems.push(
      ...recentSettlements.map((s) => {
        const iPaid = s.fromUserId === payload.sub
        const otherName = nameById.get(iPaid ? s.toUserId : s.fromUserId) ?? ''
        return {
          id: `settlement-${s.id}`,
          type: 'debt_settled' as const,
          message: iPaid
            ? `${otherName} ile ₺${s.amount.toLocaleString('tr-TR')} hesaplaştın`
            : `${otherName}, sana ₺${s.amount.toLocaleString('tr-TR')} ödedi`,
          groupName: '',
          createdAt: s.settledAt,
        }
      })
    )
  }

  const recent = recentItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 20)

  let upcoming: { id: string; type: 'bill_upcoming'; message: string; groupName: string; dueDate: string }[] = []

  if (user.notifyUpcomingBills) {
    const upcomingBillsRows = await db
      .select({
        id: bills.id,
        title: bills.title,
        amount: bills.amount,
        dueDate: bills.dueDate,
        groupName: groups.name,
      })
      .from(bills)
      .innerJoin(groups, eq(groups.id, bills.groupId))
      .where(
        and(
          inArray(bills.groupId, myGroupIds),
          isNull(bills.paidAt),
          gte(bills.dueDate, todayIso),
          lte(bills.dueDate, threeDaysIso)
        )
      )
      .orderBy(bills.dueDate)

    upcoming = upcomingBillsRows.map((b) => ({
      id: `upcoming-${b.id}`,
      type: 'bill_upcoming' as const,
      message: `"${b.title}" faturasının son ödeme tarihi ${new Date(b.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} (₺${b.amount.toLocaleString('tr-TR')})`,
      groupName: b.groupName,
      dueDate: b.dueDate,
    }))
  }

  return c.json({ upcoming, recent })
})

export default notificationsRoute
