import { and, eq, gt, isNull } from 'drizzle-orm'
import { db } from '../db/index.js'
import { bills } from '../db/schema.js'

export async function runDailyBillCheck(): Promise<number> {
  const candidates = await db
    .select({ id: bills.id, dueDate: bills.dueDate, reminderDaysBefore: bills.reminderDaysBefore })
    .from(bills)
    .where(and(isNull(bills.paidAt), isNull(bills.reminderSentAt), gt(bills.reminderDaysBefore, 0)))

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let firedCount = 0
  for (const bill of candidates) {
    const due = new Date(bill.dueDate)
    const reminderDate = new Date(due.getFullYear(), due.getMonth(), due.getDate() - bill.reminderDaysBefore)

    if (today >= reminderDate) {
      await db.update(bills).set({ reminderSentAt: new Date() }).where(eq(bills.id, bill.id))
      firedCount += 1
    }
  }

  return firedCount
}
