import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import { db } from '../database';
import * as schema from '../schema';
import bcrypt from 'bcryptjs';

async function main() {

    await db.insert(schema.organizerTable).values([
        {
            name: 'Paris Saint-Germain',
            email: 'psg@example.com',
            description: 'Paris Saint-Germain is a football club based in Paris, France.',
            password: bcrypt.hashSync('password'),
            walletAddress: '0x123abc',
            fanTokenAddress: '0x123abc',
            logoUrl: 'https://www.psg.fr/themes/custom/psg/logo.svg',
            isVerified: true,
        },
    ]);
    console.log('🌱 Database seeded successfully!');
}

main().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
