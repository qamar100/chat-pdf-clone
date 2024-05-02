import { neon, neonConfig } from '@neondatabase/serverless'
import {drizzle} from 'drizzle-orm/neon-http'

{/* so that it caches the connection that been set */ }
neonConfig.fetchConnectionCache = true 

if (!process.env.DATABASE_URL) {

    throw new Error("Database URL not found")
}
{/* if we have a database url than we can connect the sql server if not it will throw error*/ }

const sql = neon(process.env.DATABASE_URL)

export const db = drizzle(sql)

