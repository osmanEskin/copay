import { pgTable, uuid, text, numeric, date, boolean, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  username: text('username'),
  phone: text('phone'),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
  notifyNewExpense: boolean('notify_new_expense').notNull().default(true),
  notifyNewBill: boolean('notify_new_bill').notNull().default(true),
  notifyUpcomingBills: boolean('notify_upcoming_bills').notNull().default(true),
  notifyDebtUpdates: boolean('notify_debt_updates').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  uniqueIndex('users_email_idx').on(table.email),
])

export const settlementMethod = ['cash', 'bank_transfer', 'other'] as const

export const settlements = pgTable('settlements', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromUserId: uuid('from_user_id').notNull().references(() => users.id),
  toUserId: uuid('to_user_id').notNull().references(() => users.id),
  amount: numeric('amount', { precision: 12, scale: 2, mode: 'number' }).notNull(),
  method: text('method', { enum: settlementMethod }).notNull().default('cash'),
  note: text('note'),
  settledAt: timestamp('settled_at').notNull().defaultNow(),
})

export const passwordResetCodes = pgTable('password_reset_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const twoFactorCodes = pgTable('two_factor_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const groupRole = ['admin', 'member'] as const
export const groupType = ['ev', 'seyahat', 'arkadas', 'diger'] as const

export const groups = pgTable('groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type', { enum: groupType }).notNull().default('diger'),
  inviteCode: text('invite_code').notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  uniqueIndex('groups_invite_code_idx').on(table.inviteCode),
])

export const groupMembers = pgTable('group_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role', { enum: groupRole }).notNull().default('member'),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
}, (table) => [
  uniqueIndex('group_members_group_user_idx').on(table.groupId, table.userId),
])

export const expenseSplitMethod = ['equal', 'percentage', 'amount'] as const

export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  category: text('category').notNull(),
  description: text('description'),
  amount: numeric('amount', { precision: 12, scale: 2, mode: 'number' }).notNull(),
  date: date('date').notNull(),
  payerId: uuid('payer_id').notNull().references(() => users.id),
  splitMethod: text('split_method', { enum: expenseSplitMethod }).notNull().default('equal'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const expenseParticipants = pgTable('expense_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  expenseId: uuid('expense_id').notNull().references(() => expenses.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  shareAmount: numeric('share_amount', { precision: 12, scale: 2, mode: 'number' }).notNull(),
})

export const billRecurrence = ['none', 'weekly', 'monthly', 'quarterly', 'semiannual', 'yearly'] as const
export const billReminder = ['none', '1_day', '3_days', '1_week'] as const

export const bills = pgTable('bills', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  category: text('category').notNull(),
  description: text('description'),
  amount: numeric('amount', { precision: 12, scale: 2, mode: 'number' }).notNull(),
  billDate: date('bill_date').notNull(),
  dueDate: date('due_date').notNull(),
  payerId: uuid('payer_id').notNull().references(() => users.id),
  splitMethod: text('split_method', { enum: expenseSplitMethod }).notNull().default('equal'),
  recurrence: text('recurrence', { enum: billRecurrence }).notNull().default('none'),
  reminder: text('reminder', { enum: billReminder }).notNull().default('none'),
  variableAmount: boolean('variable_amount').notNull().default(false),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const billParticipants = pgTable('bill_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  billId: uuid('bill_id').notNull().references(() => bills.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  shareAmount: numeric('share_amount', { precision: 12, scale: 2, mode: 'number' }).notNull(),
})
