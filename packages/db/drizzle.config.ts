import * as dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';
dotenv.config();

if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
  throw new Error('DATABASE_URL environment variable is not set (drizzle.config.ts)');
}

export default {
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5434/database',
    ssl: true,
  },
  verbose: true,
  schemaFilter: ['public'],
} satisfies Config;
