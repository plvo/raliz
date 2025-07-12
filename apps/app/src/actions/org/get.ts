'use server';

import { withAction } from '@/lib/wrappers/with-action';
import type { OrgWithoutWallet } from '@/types/database';
import { eq, organizerTable } from '@repo/db';

export async function getOrgs() {
  return withAction<OrgWithoutWallet[]>(async (db) => {
    const orgs = await db.query.organizerTable.findMany({
      columns: {
        walletAddress: false,
      },
    });
    return orgs;
  });
}

export async function getOrgByFanTokenAddress(fanTokenAddress: string) {
  return withAction<OrgWithoutWallet | null>(async (db) => {
    const org = await db.query.organizerTable.findFirst({
      where: eq(organizerTable.fanTokenAddress, fanTokenAddress),
      columns: {
        walletAddress: false,
      },
    });

    return org ?? null;
  });
}
