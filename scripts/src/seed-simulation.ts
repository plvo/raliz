import { faker } from '@faker-js/faker';
import { RalizABI } from '@repo/contracts';
import type { Raliz } from '@repo/contracts/typechain-types';
import {
  db,
  notificationTable,
  organizerSeasonStatsTable,
  organizerTable,
  participationTable,
  raffleTable,
  seasonRewardTable,
  seasonTable,
  userSeasonStatsTable,
  userTable,
  winnerTable,
} from '@repo/db';
import bcrypt from 'bcryptjs';
import { and, desc, eq, or } from 'drizzle-orm';
import { ethers } from 'ethers';

// Configuration
const RALIZ_CONTRACT_ADDRESS = '0x52288e58c73cE8A91B6Cce9438EE2D0C0202fE3A';
const PRIVATE_KEY = '0xba56aff2a5282583c0b83c543a24e4bfe69edc440a581c115b5d8c51f0769517';
const RPC_URL = 'https://spicy-rpc.chiliz.com';

const FAN_TOKENS = {
  PSG: '0x1de38d1def488Dc35d48F62C87647f9864C029f2',
  BAR: '0x3877B63d3Db6163b26B34250dD06f88a7a219CA3',
  CITY: '0xB33C9B5454EB4377520731CC545fB062B63Afd83',
  GAL: '0xBc2873F1e3d303D9F23E24CB5c42E84832aeEef6',
};

// Initialize blockchain connection
const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// Contract instance
const contract = new ethers.Contract(RALIZ_CONTRACT_ADDRESS, RalizABI, signer) as unknown as Raliz;

// Main seeder function
async function seedSimulation() {
  console.log('🌱 Starting Raliz simulation seeder...');

  try {
    // 1. Create Seasons - Updated to current year
    console.log('\n📅 Creating seasons...');
    const currentYear = new Date().getFullYear();
    const now = new Date();
    const season1 = await createSeason(
      `Saison Q1 ${currentYear}`,
      new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
      new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      false,
    );
    const season2 = await createSeason(
      `Saison Q2 ${currentYear}`,
      new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      true,
    );

    if (!season1 || !season2) {
      throw new Error('Failed to create seasons');
    }

    // const season1 = {
    //   id: 'd4d83e59-3229-41ec-a9da-f2f5c9316835',
    // };
    // const season2 = {
    //   id: 'cb6b6708-6783-4ec4-a8a9-8022f866227e',
    // };

    // 2. Create Organizers
    console.log('\n🏢 Creating organizers...');

    // Insert organizers if not already present, then fetch them with correct column mapping
    // (drizzle-orm requires camelCase keys matching the schema)
    await db
      .insert(organizerTable)
      .values([
        {
          name: 'Manchester City',
          email: 'manchester-city@example.com',
          password: '$2b$10$142VmFQWry6XfXm.GMDsrOFV8EiaHm39cHNXESwi5V.Ha4oFpzQce',
          description: 'Manchester City is a football club based in Manchester, England.',
          logoUrl: 'https://fr.mancity.com/dist/images/logos/crest.svg',
          walletAddress: '0x116F2F9e6fEe5ad8d308a6b0E882E74B9fA6a236',
          fanTokenAddress: '0xB33C9B5454EB4377520731CC545fB062B63Afd83',
          fanTokenSymbol: 'CITY',
          isVerified: true,
          totalChzEngaged: '0.00000000',
          totalCompletedRaffles: 0,
          leaderboardRank: null,
        },
        {
          name: 'Paris Saint-Germain',
          email: 'psg@example.com',
          password: '$2b$10$8qxAz.FdrSYjuaBsq.6B3uLmaZ3LKxkoADnkiPnB8HAg12UoQ9M3a',
          description: 'Paris Saint-Germain is a football club based in Paris, France.',
          logoUrl: 'https://www.psg.fr/themes/custom/psg/logo.svg',
          walletAddress: '0x8342beD0Af2372C9370a56aBB0D1D908B49349a8',
          fanTokenAddress: '0x1de38d1def488Dc35d48F62C87647f9864C029f2',
          fanTokenSymbol: 'PSG',
          isVerified: true,
          totalChzEngaged: '0.00000000',
          totalCompletedRaffles: 0,
          leaderboardRank: null,
        },
        {
          name: 'Galatasaray',
          email: 'galatasaray@example.com',
          password: '$2b$10$BgA/wb4IQVQ1Aezi0p6D..OR5r2UBT/4moHfZMBGR1DuRIQUvltja',
          description: 'Galatasaray is a football club based in Istanbul, Turkey.',
          logoUrl:
            'https://upload.wikimedia.org/wikipedia/fr/thumb/b/bd/Logo_Galatasaray_SK_2023.svg/1200px-Logo_Galatasaray_SK_2023.svg.png',
          walletAddress: '0xd92A5E1F95A56D3aDa442D94457f5aCDE4A4D36F',
          fanTokenAddress: '0xBc2873F1e3d303D9F23E24CB5c42E84832aeEef6',
          fanTokenSymbol: 'GAL',
          isVerified: true,
          totalChzEngaged: '0.00000000',
          totalCompletedRaffles: 0,
          leaderboardRank: null,
        },
        {
          name: 'FC Barcelona',
          email: 'barcelona@example.com',
          password: '$2b$10$TPu3farPaiFvxTZ3F4dpMeY6qWZ1rBD56pYM7tYLanUFsghYawVIO',
          description: 'FC Barcelona is a football club based in Barcelona, Spain.',
          logoUrl:
            'https://upload.wikimedia.org/wikipedia/fr/thumb/1/1d/Logo_FC_Barcelone.svg/langfr-250px-Logo_FC_Barcelone.svg.png',
          walletAddress: '0x7913D77c13aB41c63F6031afE1608D24f4f30901',
          fanTokenAddress: '0x3877B63d3Db6163b26B34250dD06f88a7a219CA3',
          fanTokenSymbol: 'BAR',
          isVerified: true,
          totalChzEngaged: '0.00000000',
          totalCompletedRaffles: 0,
          leaderboardRank: null,
        },
      ])
      .onConflictDoNothing();

    // Fetch all organizers (with correct column names)
    const organizers = await db.select().from(organizerTable);

    // 3. Create Users
    console.log('\n👥 Creating users...');
    // const users = await createUsers(50);
    const users = await db.select().from(userTable);

    // 4. Create Raffles for Season 1 (completed) - Updated dates
    console.log('\n🎟️ Creating raffles for Season 1...');
    const season1Raffles = [];

    for (const organizer of organizers) {
      for (let i = 0; i < 1; i++) {
        // Use future dates for blockchain validation, then mark as completed in DB
        const now = new Date();
        const startDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000); // i days from now
        const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later

        const raffle = await createRaffle(
          organizer.id,
          season1.id,
          `${organizer.name} - ${faker.commerce.productName()}`,
          startDate,
          endDate,
          true, // completed
        );
        season1Raffles.push(raffle);
      }
    }

    // 5. Create participations for Season 1 with winners
    // console.log('\n🎯 Creating participations and winners for Season 1...');
    // for (const raffle of season1Raffles) {
    //   const participantCount = randomBetween(10, 30);
    //   const participants = faker.helpers.arrayElements(users, participantCount);

    //   const participations = [];
    //   for (const user of participants) {
    //     if (!user) continue;
    //     const participation = await createParticipation(user.id, raffle.id, raffle.blockchainId);
    //     participations.push({ participation, user });
    //   }

    //   // Select winners (1-3 based on raffle config)
    //   const maxWinners = raffle.maxWinners;
    //   if (!maxWinners) continue;

    //   const winnerCount = Number.parseInt(maxWinners);
    //   const winners = faker.helpers.arrayElements(participations, Math.min(winnerCount, participations.length));

    //   for (let i = 0; i < winners.length; i++) {
    //     const winner = winners[i];
    //     if (!winner) continue;

    //     if (!winner.participation || !winner.user) continue;

    //     await createWinner(
    //       winner.participation.id,
    //       raffle.id,
    //       winner.user.id,
    //       `${i + 1}`, // rank
    //     );

    //     // Update participation as winner
    //     await db
    //       .update(participationTable)
    //       .set({ isWinner: true, pointsEarned: 6 }) // 1 base + 5 bonus
    //       .where(eq(participationTable.id as any, winner.participation.id));
    //   }
    // }

    // 6. Create Raffles for Season 2 (ongoing) - Updated dates
    console.log('\n🎟️ Creating raffles for Season 2 (ongoing)...');
    const season2Raffles = [];

    for (const organizer of organizers) {
      for (let i = 0; i < randomBetween(1, 3); i++) {
        // Use future dates for blockchain validation
        const now = new Date();
        const startDate = new Date(now.getTime() + (30 + i * 7) * 24 * 60 * 60 * 1000); // 30+ days from now
        const endDate = new Date(startDate.getTime() + randomBetween(30, 60) * 24 * 60 * 60 * 1000); // 30-60 days later

        // const startDate = new Date('2025-07-10');
        // const endDate = new Date('2025-07-14');

        const isActive = endDate > now;

        const raffle = await createRaffle(
          organizer.id,
          season2.id,
          `${organizer.name} - ${faker.commerce.productName()}`,
          startDate,
          endDate,
          !isActive, // completed only if end date passed
        );
        season2Raffles.push(raffle);

        // Add participations for active/recent raffles
        if (startDate < new Date()) {
          const participantCount = randomBetween(5, 25);
          const participants = faker.helpers.arrayElements(participantCount);

          for (const user of participants) {
            if (!user) continue;
            await createParticipation(user.id, raffle.id, raffle.blockchainId);
          }
        }
      }
    }

    throw new Error('Stop here');

    // 7. Calculate Season Stats
    console.log('\n📊 Calculating season statistics...');
    await calculateSeasonStats(season1.id, organizers, users);
    await calculateSeasonStats(season2.id, organizers, users);

    // 8. Create Season 1 Rewards (distributed)
    // console.log('\n🏆 Creating season 1 rewards...');
    // await createSeasonRewards(season1.id, organizers, users);

    // // 9. Create Notifications
    // console.log('\n🔔 Creating notifications...');
    // await createNotifications(users, [...season1Raffles, ...season2Raffles]);

    console.log('\n✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Utility functions
function generateWalletAddress(): string {
  return ethers.Wallet.createRandom().address;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('Cannot select from empty array');
  }
  const element = array[Math.floor(Math.random() * array.length)];
  if (element === undefined) {
    throw new Error('Selected element is undefined');
  }
  return element;
}

// Helper functions for notifications
function getNotificationTitle(type: string): string {
  switch (type) {
    case 'RAFFLE_CREATED':
      return 'Nouveau tirage disponible !';
    case 'PARTICIPATION_CONFIRMED':
      return 'Participation confirmée';
    case 'WINNER_SELECTED':
      return 'Félicitations, vous avez gagné !';
    case 'RAFFLE_ENDED':
      return 'Tirage terminé';
    case 'SEASON_REWARD':
      return 'Récompense de saison';
    case 'LEADERBOARD_UPDATE':
      return 'Classement mis à jour';
    default:
      return 'Notification';
  }
}

function getNotificationMessage(type: string, user: any, raffle: any): string {
  switch (type) {
    case 'RAFFLE_CREATED':
      return `Un nouveau tirage "${raffle.title}" est maintenant disponible !`;
    case 'PARTICIPATION_CONFIRMED':
      return `Votre participation au tirage "${raffle.title}" a été confirmée.`;
    case 'WINNER_SELECTED':
      return `Vous avez remporté le tirage "${raffle.title}" ! Félicitations !`;
    case 'RAFFLE_ENDED':
      return `Le tirage "${raffle.title}" est maintenant terminé.`;
    case 'SEASON_REWARD':
      return 'Vous avez reçu une récompense de saison !';
    case 'LEADERBOARD_UPDATE':
      return 'Votre position dans le classement a été mise à jour.';
    default:
      return 'Vous avez une nouvelle notification.';
  }
}

// Helper functions

async function createSeason(name: string, startDate: Date, endDate: Date, isActive: boolean) {
  const [season] = await db
    .insert(seasonTable)
    .values({
      name,
      description: `${name} - Compétition inter-équipes avec récompenses en CHZ`,
      startDate,
      endDate,
      isActive,
      rewardsDistributed: !isActive,
    })
    .returning();

  console.log(`  ✓ Created season: ${name}`);
  return season;
}

async function createUsers(count: number) {
  const users = [];

  for (let i = 0; i < count; i++) {
    const [user] = await db
      .insert(userTable)
      .values({
        id: `user_${Date.now()}_${i}`,
        username: faker.internet.userName(),
        walletAddress: generateWalletAddress(),
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: faker.phone.number(),
        emailVerified: Math.random() > 0.3,
      })
      .returning();

    users.push(user);
  }

  console.log(`  ✓ Created ${count} users`);
  return users;
}

async function createRaffle(
  organizerId: string,
  seasonId: string,
  title: string,
  startDate: Date,
  endDate: Date,
  completed: boolean,
) {
  // Get organizer wallet for transaction
  const [organizer] = await db.select().from(organizerTable).where(eq(organizerTable.id, organizerId));
  if (!organizer) throw new Error('Organizer not found');

  // First create on blockchain
  const participationFee = ethers.parseEther(randomBetween(1, 10).toString()); // 1-10 CHZ
  const maxWinners = randomBetween(1, 3);
  const maxParticipants = randomElement([20, 50, 100, 200, 500, 1000]);
  const fanTokenAddress = randomElement([FAN_TOKENS.PSG, FAN_TOKENS.BAR, FAN_TOKENS.CITY]);

  // Note: In real scenario, we'd use a wallet for each organizer
  // For simulation, we use the main signer and simulate it's from the organizer
  console.log(`  Creating raffle "${title}" on blockchain...`);

  const tx = await contract.createRaffle(
    title,
    faker.lorem.paragraph(),
    participationFee,
    fanTokenAddress,
    ethers.parseEther('50'), // 50 fan tokens minimum
    Math.floor(startDate.getTime() / 1000),
    Math.floor(endDate.getTime() / 1000),
    maxWinners,
    maxParticipants,
  );

  const receipt = await tx.wait();
  if (!receipt) throw new Error('Transaction failed');

  // Extract raffle ID from event
  let blockchainRaffleId = 0;
  for (const log of receipt.logs) {
    try {
      const parsedLog = contract.interface.parseLog(log);
      if (parsedLog?.name === 'RaffleCreated') {
        blockchainRaffleId = Number(parsedLog.args.raffleId);
        break;
      }
    } catch (e) {
      // Not our event, continue
    }
  }

  // Then create in database
  const [raffle] = await db
    .insert(raffleTable)
    .values({
      contractRaffleId: blockchainRaffleId,
      organizerId,
      seasonId,
      title,
      description: faker.lorem.paragraph(),
      prizeDescription: faker.commerce.productDescription(),
      imageUrl: faker.image.url(),
      participationPrice: ethers.formatEther(participationFee),
      tokenSymbol: 'CHZ',
      minimumFanTokens: 50,
      startDate,
      endDate,
      maxWinners: maxWinners.toString(),
      maxParticipants: maxParticipants.toString(),
      status: completed ? 'ENDED' : startDate < new Date() ? 'ACTIVE' : 'DRAFT',
      smartContractAddress: RALIZ_CONTRACT_ADDRESS,
      totalChzCollected: completed
        ? (randomBetween(10, 70) * Number.parseFloat(ethers.formatEther(participationFee))).toString()
        : '0',
    })
    .returning();

  console.log(`  ✓ Created raffle: ${title} (blockchain ID: ${blockchainRaffleId})`);
  return { ...raffle, blockchainId: blockchainRaffleId };
}

async function createParticipation(userId: string, raffleId: string, blockchainRaffleId: number) {
  const [user] = await db.select().from(userTable).where(eq(userTable.id, userId)).limit(1);
  const [raffle] = await db.select().from(raffleTable).where(eq(raffleTable.id, raffleId)).limit(1);

  if (!user || !raffle) {
    throw new Error('User or raffle not found');
  }

  // Simulate blockchain participation
  const tx = await contract.participate(blockchainRaffleId, {
    value: ethers.parseEther(raffle.participationPrice),
  });

  const receipt = await tx.wait();
  if (!receipt) throw new Error('Transaction failed');

  const [participation] = await db
    .insert(participationTable)
    .values({
      userId,
      raffleId,
      walletAddress: user.walletAddress,
      transactionHash: receipt.hash,
      amountPaid: raffle.participationPrice,
      tokenUsed: 'CHZ',
      participatedAt: faker.date.between({
        from: raffle.startDate,
        to: raffle.endDate < new Date() ? raffle.endDate : new Date(),
      }),
    })
    .returning();

  return participation;
}

async function createWinner(participationId: string, raffleId: string, userId: string, rank: string) {
  const [winner] = await db
    .insert(winnerTable)
    .values({
      participationId,
      raffleId,
      userId,
      winnerRank: rank,
      hasBeenContacted: Math.random() > 0.5,
      contactedAt: Math.random() > 0.5 ? faker.date.recent() : null,
    })
    .returning();

  return winner;
}

async function calculateSeasonStats(seasonId: string, organizers: any[], users: any[]) {
  // Calculate organizer stats
  for (const organizer of organizers) {
    const stats = await db
      .select()
      .from(raffleTable)
      .where(and(eq(raffleTable.seasonId, seasonId), eq(raffleTable.organizerId, organizer.id)));

    const totalChz = stats.reduce((sum, raffle) => sum + Number.parseFloat(raffle.totalChzCollected), 0);

    await db.insert(organizerSeasonStatsTable).values({
      organizerId: organizer.id,
      seasonId,
      totalChzEngaged: totalChz.toString(),
      totalRafflesCompleted: stats.filter((r) => r.status === 'ENDED').length,
      totalParticipantsUnique: randomBetween(20, 100),
      averageParticipationRate: (randomBetween(40, 85) / 100).toString(),
      leaderboardPosition: randomBetween(1, 10),
    });
  }

  // Sample user stats
  const sampleUsers = faker.helpers.arrayElements(users, 20);
  for (const user of sampleUsers) {
    if (!user) continue;
    await db.insert(userSeasonStatsTable).values({
      userId: user.id,
      seasonId,
      organizerId: randomElement(organizers)?.id || organizers[0].id,
      totalPoints: randomBetween(5, 150),
      totalParticipations: randomBetween(1, 20),
      totalChzSpent: randomBetween(10, 500).toString(),
      rankInTeam: randomBetween(1, 50),
    });
  }
}

async function createSeasonRewards(seasonId: string, organizers: any[], users: any[]) {
  // Team rewards (TOP 3)
  const topOrganizers = faker.helpers.arrayElements(organizers, 3);
  for (let i = 0; i < topOrganizers.length; i++) {
    const organizer = topOrganizers[i];
    if (!organizer) continue;

    await db.insert(seasonRewardTable).values({
      seasonId,
      rewardType: 'TEAM_TOP3' as const,
      organizerId: organizer.id,
      position: i + 1,
      rewardAmountChz: (1000 * (3 - i)).toString(), // 3000, 2000, 1000 CHZ
      rewardDescription: `Récompense équipe TOP ${i + 1}`,
      distributed: true,
      transactionHash: `0x${faker.string.hexadecimal({ length: 64 })}`,
      distributedAt: faker.date.recent(),
    });
  }

  // Individual MVP rewards
  const mvpUsers = faker.helpers.arrayElements(users, 5);
  for (const user of mvpUsers) {
    if (!user) continue;

    await db.insert(seasonRewardTable).values({
      seasonId,
      rewardType: 'INDIVIDUAL_MVP' as const,
      userId: user.id,
      rewardAmountChz: randomBetween(100, 500).toString(),
      rewardDescription: 'Récompense MVP individuel',
      distributed: true,
      transactionHash: `0x${faker.string.hexadecimal({ length: 64 })}`,
      distributedAt: faker.date.recent(),
    });
  }
}

async function createNotifications(users: any[], raffles: any[]) {
  const notificationTypes = [
    'RAFFLE_CREATED',
    'PARTICIPATION_CONFIRMED',
    'WINNER_SELECTED',
    'RAFFLE_ENDED',
    'SEASON_REWARD',
    'LEADERBOARD_UPDATE',
  ] as const;

  // Create various notification types
  for (let i = 0; i < 50; i++) {
    const user = randomElement(users);
    const raffle = randomElement(raffles);
    const type = randomElement([...notificationTypes]); // Convert readonly to mutable

    if (!user || !raffle) continue;

    await db.insert(notificationTable).values({
      userId: user.id,
      raffleId: ['RAFFLE_CREATED', 'PARTICIPATION_CONFIRMED', 'WINNER_SELECTED', 'RAFFLE_ENDED'].includes(type)
        ? raffle.id
        : null,
      type,
      title: getNotificationTitle(type),
      message: getNotificationMessage(type, user, raffle),
      isRead: Math.random() > 0.3,
      readAt: Math.random() > 0.3 ? faker.date.recent() : null,
    });
  }
}

// Run the seeder
seedSimulation()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
