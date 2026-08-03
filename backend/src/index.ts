import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { sql } from 'drizzle-orm'
import { db } from './db/index.js'
import auth from './routes/auth.js'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/auth', auth)

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
