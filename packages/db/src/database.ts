import 'dotenv/config';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

dotenv.config();

if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set (from database.ts)');
}

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5434/database';

export const db = drizzle({
  schema,
  connection: {
    connectionString,
    // ssl: process.env.NODE_ENV === 'production',
  },
});
