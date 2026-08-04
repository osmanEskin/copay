import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { sql } from 'drizzle-orm'
import { db } from './db/index.js'
import auth from './routes/auth.js'
import groups from './routes/groups.js'
import expenses from './routes/expenses.js'
import bills from './routes/bills.js'

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/auth', auth)
app.route('/groups', groups)
app.route('/expenses', expenses)
app.route('/bills', bills)

app.get('/health/db', async (c) => {
  const result = await db.execute(sql`select 1 as ok`)
  return c.json({ db: result.rows[0] })
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
