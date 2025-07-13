import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from '../database';
import * as schema from '../schema';

async function main() {
  await db.insert(schema.organizerTable).values([
    {
      name: 'Paris Saint-Germain',
      email: 'psg@example.com',
      description: 'Paris Saint-Germain is a football club based in Paris, France.',
      password: bcrypt.hashSync('password'),
      walletAddress: '0x8342beD0Af2372C9370a56aBB0D1D908B49349a8',
      fanTokenAddress: '0x9D5C707722ef87918C9002562F7EBDa3012fEe2a',
      fanTokenSymbol: 'PSG',
      logoUrl: 'https://www.psg.fr/themes/custom/psg/logo.svg',
      isVerified: true,
    },
    {
      name: 'Manchester City',
      email: 'manchester-city@example.com',
      description: 'Manchester City is a football club based in Manchester, England.',
      password: bcrypt.hashSync('password'),
      walletAddress: '0x116F2F9e6fEe5ad8d308a6b0E882E74B9fA6a236',
      fanTokenAddress: '0xC6eBeceC197645d04890D7697744a828495159D6',
      fanTokenSymbol: 'MCFC',
      logoUrl: 'https://fr.mancity.com/dist/images/logos/crest.svg',
      isVerified: true,
    },
    {
      name: 'FC Barcelona',
      email: 'barcelona@example.com',
      description: 'FC Barcelona is a football club based in Barcelona, Spain.',
      password: bcrypt.hashSync('password'),
      walletAddress: '0x7913D77c13aB41c63F6031afE1608D24f4f30901',
      fanTokenAddress: '0xD20d41726d048a11E46bEbFcBCa9B485D000afC8',
      fanTokenSymbol: 'BAR',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/fr/thumb/1/1d/Logo_FC_Barcelone.svg/langfr-250px-Logo_FC_Barcelone.svg.png',
      isVerified: true,
    },
    {
      name: 'Galatasaray',
      email: 'galatasaray@example.com',
      description: 'Galatasaray is a football club based in Istanbul, Turkey.',
      password: bcrypt.hashSync('password'),
      walletAddress: '0xd92A5E1F95A56D3aDa442D94457f5aCDE4A4D36F',
      fanTokenAddress: '0x7dd87529f5BEA538c2e686Db86B4878930cced5F8',
        logoUrl:
        'https://upload.wikimedia.org/wikipedia/fr/thumb/b/bd/Logo_Galatasaray_SK_2023.svg/1200px-Logo_Galatasaray_SK_2023.svg.png',
      isVerified: true,
    },
  ]);
  console.log('🌱 Database seeded successfully!');
}

main().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
