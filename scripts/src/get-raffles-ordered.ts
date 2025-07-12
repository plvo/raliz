#!/usr/bin/env tsx
import { db, eq, raffleTable } from '@repo/db';

async function getRafflesOrdered() {
  console.log('🎟️ Fetching raffles ordered by creation date...\n');

  try {
    // Retrieve all raffles sorted by createdAt (oldest first)
    const raffles = await db
      .select({
        id: raffleTable.id,
        title: raffleTable.title,
        status: raffleTable.status,
        organizerId: raffleTable.organizerId,
        seasonId: raffleTable.seasonId,
        contractRaffleId: raffleTable.contractRaffleId,
        createdAt: raffleTable.createdAt,
        startDate: raffleTable.startDate,
        endDate: raffleTable.endDate,
      })
      .from(raffleTable)
      .orderBy(raffleTable.createdAt); // Ascending order (oldest first)

    console.log(`📊 Total raffles found: ${raffles.length}\n`);

    if (raffles.length === 0) {
      console.log('❌ No raffles found. Please run the seeder first.\n');
      return;
    }

    // Display raffles in order
    console.log('🔢 Raffle IDs in creation order:');
    console.log('='.repeat(80));

    raffles.forEach((raffle, index) => {
      const contractId = raffle.contractRaffleId ? `[Contract: ${raffle.contractRaffleId}]` : '[No Contract ID]';
      const formattedDate = raffle.createdAt.toLocaleString('en-US');

      console.log(`${(index + 1).toString().padStart(3, ' ')}. ID: ${raffle.id}`);
      console.log(`     ${contractId}`);
      console.log(`     📅 ${formattedDate}`);
      console.log(`     🎯 "${raffle.title}"`);
      console.log(`     📍 Status: ${raffle.status}`);
      console.log(`     🏢 Organizer: ${raffle.organizerId}`);
      console.log(`     🏆 Season: ${raffle.seasonId || 'N/A'}`);
      console.log(`     ⏰ Start: ${raffle.startDate.toLocaleString('en-US')}`);
      console.log(`     ⏰ End: ${raffle.endDate.toLocaleString('en-US')}`);
      console.log('');
    });

    console.log('='.repeat(80));
    console.log('\n📋 Status summary:');

    const statusCounts = raffles.reduce(
      (acc, raffle) => {
        acc[raffle.status] = (acc[raffle.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} raffle${count > 1 ? 's' : ''}`);
    });

    console.log('\n📋 Season summary:');

    const seasonCounts = raffles.reduce(
      (acc, raffle) => {
        const season = raffle.seasonId || 'No season';
        acc[season] = (acc[season] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    Object.entries(seasonCounts).forEach(([season, count]) => {
      console.log(`   ${season}: ${count} raffle${count > 1 ? 's' : ''}`);
    });

    console.log('\n🔗 Contract Raffle IDs mapping:');
    const contractMappings = raffles
      .filter((raffle) => raffle.contractRaffleId !== null)
      .map((raffle) => ({
        dbId: raffle.id,
        contractId: raffle.contractRaffleId,
        title: raffle.title,
      }));

    if (contractMappings.length > 0) {
      contractMappings.forEach((mapping) => {
        console.log(`   DB: ${mapping.dbId} -> Contract: ${mapping.contractId} | "${mapping.title}"`);
      });
    } else {
      console.log('   ⚠️  No Contract ID mapping found');
    }

    // Export IDs in order for use in other scripts
    console.log('\n📝 Export IDs (copyable):');
    console.log('const raffleIds = [');
    raffles.forEach((raffle, index) => {
      const comma = index === raffles.length - 1 ? '' : ',';
      console.log(`  "${raffle.id}"${comma} // ${raffle.title}`);
    });
    console.log('];');

    console.log('\n✅ Script completed successfully!');
    return raffles;
  } catch (error) {
    console.error('❌ Error while fetching raffles:', error);
    process.exit(1);
  }
}

async function updateContractRaffleIds() {
  console.log('🔄 Updating contract raffle IDs in sequential order...\n');

  try {
    // Get raffles in creation order
    const raffles = await db
      .select({
        id: raffleTable.id,
        title: raffleTable.title,
        contractRaffleId: raffleTable.contractRaffleId,
        createdAt: raffleTable.createdAt,
      })
      .from(raffleTable)
      .orderBy(raffleTable.createdAt);

    if (raffles.length === 0) {
      console.log('❌ No raffles found to update.\n');
      return;
    }

    console.log(`📊 Found ${raffles.length} raffles to update\n`);

    // Update each raffle with sequential contract ID
    const updatePromises = raffles.map(async (raffle, index) => {
      const newContractId = index + 1;
      const currentContractId = raffle.contractRaffleId;

      console.log(`🔄 Updating raffle "${raffle.title}" (DB: ${raffle.id})`);
      console.log(`   Current Contract ID: ${currentContractId || 'NULL'} -> New Contract ID: ${newContractId}`);

      return db.update(raffleTable).set({ contractRaffleId: newContractId }).where(eq(raffleTable.id, raffle.id));
    });

    // Execute all updates
    await Promise.all(updatePromises);

    console.log('\n✅ Successfully updated all contract raffle IDs!');
    console.log('\n🔍 Verifying updates...\n');

    // Verify the updates
    const updatedRaffles = await db
      .select({
        id: raffleTable.id,
        title: raffleTable.title,
        contractRaffleId: raffleTable.contractRaffleId,
        createdAt: raffleTable.createdAt,
      })
      .from(raffleTable)
      .orderBy(raffleTable.createdAt);

    console.log('📋 Updated Contract Raffle IDs:');
    console.log('='.repeat(80));
    updatedRaffles.forEach((raffle, index) => {
      console.log(
        `${(index + 1).toString().padStart(3, ' ')}. Contract ID: ${raffle.contractRaffleId} | "${raffle.title}"`,
      );
    });
    console.log('='.repeat(80));

    console.log('\n🎉 Contract raffle IDs update completed successfully!');
  } catch (error) {
    console.error('❌ Error while updating contract raffle IDs:', error);
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const shouldUpdateIds = args.includes('--update-ids') || args.includes('-u');

  if (shouldUpdateIds) {
    console.log('🎯 Running with --update-ids flag');
    console.log('⚠️  This will update contract_raffle_id for all raffles in sequential order!\n');

    updateContractRaffleIds()
      .then(() => {
        console.log('\n📊 Fetching updated raffles list...\n');
        return getRafflesOrdered();
      })
      .then(() => {
        console.log('\n🎉 All operations completed successfully!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n💥 Fatal error:', error);
        process.exit(1);
      });
  } else {
    console.log('ℹ️  To update contract raffle IDs, run with --update-ids or -u flag');
    console.log('   Example: tsx scripts/src/get-raffles-ordered.ts --update-ids\n');

    getRafflesOrdered()
      .then(() => {
        console.log('\n🎉 Done!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n💥 Fatal error:', error);
        process.exit(1);
      });
  }
}

export { getRafflesOrdered, updateContractRaffleIds };
