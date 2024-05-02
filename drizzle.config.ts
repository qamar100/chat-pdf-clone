import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: '.env' })

export default {
    driver: 'pg',
    schema: './src/lib/db/schema.ts',
    dbCredentials: {
        connectionString: process.env.DATABASE_URL!,
        
    },  // By using !, you're essentially telling TypeScript, "I know that process.env.DATABASE_URL will not be null or undefined, so treat it as a string without performing any checks."
    // we need to install npm dotenv cuz nextjs does allow env to be accessed outside of src folder
} satisfies Config