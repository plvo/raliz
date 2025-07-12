import { getOrgByFanTokenAddress } from '@/actions/org/get';
import { getRaffles } from '@/actions/raffles/get';
import { ProjectHero } from '@/components/home/project-hero';
import { RaffleList } from '@/components/home/raffle-list';
import { type NextPageProps, withParams } from '@/lib/wrappers/with-params';
import type { OrgWithoutWallet } from '@/types/database';
import type { Raffle } from '@repo/db';
import { QueryBoundary } from '@repo/ui/components/shuip/query-boundary';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const generateMetadata = (): Metadata => ({
  title: 'Home',
  description: 'Welcome to Raliz',
});

async function HomePage({ searchParams }: NextPageProps) {
  const projectParam = (await searchParams)?.p;
  const projectAddress = Array.isArray(projectParam) ? projectParam[0] : projectParam;

  return (
    <QueryBoundary>
      <Content projectAddress={projectAddress} />
    </QueryBoundary>
  );
}

async function Content({ projectAddress }: { projectAddress: string | undefined }) {
  let org: OrgWithoutWallet | null = null;
  let raffles: Raffle[] | null = null;

  if (projectAddress) {
    const res = await getOrgByFanTokenAddress(projectAddress);
    if (res.ok) {
      org = res.data;
      const resRaffles = await getRaffles({ orgId: org?.id ?? undefined });
      if (resRaffles.ok) {
        raffles = resRaffles.data;
      } else {
        throw new Error(resRaffles.message);
      }
    } else {
      throw new Error(res.message);
    }
  }

  return (
    <>
      <ProjectHero org={org} />
      <section className='my-8'>
        <div className='flex flex-col items-center justify-between gap-2'>
          <h1 className='text-3xl font-bold mb-2'>Raffles Available</h1>
          <p className='text-muted-foreground'>
            {org
              ? `Discover exclusive raffles from ${org.name}`
              : 'Join raffles from your favorite teams and win amazing prizes'}
          </p>
        </div>
        <RaffleList raffles={raffles || []} />
      </section>
    </>
  );
}

export default withParams(HomePage);
