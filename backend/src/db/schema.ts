import { pgTable, uuid, text, numeric, date, boolean, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  username: text('username'),
  phone: text('phone'),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  uniqueIndex('users_email_idx').on(table.email),
])

export const billStatus = ['Bekliyor', 'Yaklaşan', 'Geciken', 'Ödendi'] as const

export const bills = pgTable('bills', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  dueDate: date('due_date').notNull(),
  status: text('status', { enum: billStatus }).notNull().default('Bekliyor'),
  payerId: uuid('payer_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  date: date('date').notNull(),
  payerId: uuid('payer_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const expenseParticipants = pgTable('expense_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  expenseId: uuid('expense_id').notNull().references(() => expenses.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  shareAmount: numeric('share_amount', { precision: 12, scale: 2 }).notNull(),
})

export const settlements = pgTable('settlements', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromUserId: uuid('from_user_id').notNull().references(() => users.id),
  toUserId: uuid('to_user_id').notNull().references(() => users.id),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
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
