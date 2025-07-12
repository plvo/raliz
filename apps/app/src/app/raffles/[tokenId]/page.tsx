import { getOrgByFanTokenAddress } from '@/actions/org/get';
import { getRaffles } from '@/actions/raffles/get';
import { RaffleList } from '@/components/raffles/raffle-list';
import { type NextPageProps, withParams } from '@/lib/wrappers/with-params';
import { QueryBoundary } from '@repo/ui/components/shuip/query-boundary';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const generateMetadata = (): Metadata => ({
  title: 'Raffles',
  description: 'Raffles page',
});

async function HomePage({ params }: NextPageProps) {
  const paramsData = await params;
  const tokenId = Array.isArray(paramsData?.tokenId) ? paramsData.tokenId[0] : paramsData?.tokenId;

  if (tokenId) {
    return (
      <QueryBoundary>
        <Content tokenId={tokenId} />
      </QueryBoundary>
    );
  }

  redirect('/');
}

async function Content({ tokenId }: { tokenId: string }) {
  const res = await getOrgByFanTokenAddress(tokenId);

  if (!res.ok) {
    throw new Error(res.message);
  }

  if (!res.data) {
    return <div>No org found</div>;
    // redirect('/');
  }

  const org = res.data;

  const resRaffles = await getRaffles({ orgId: res.data.id });

  if (!resRaffles.ok) {
    throw new Error(resRaffles.message);
  }

  const raffles = resRaffles.data;

  return (
    <>
      <section>
        <div className='flex flex-col items-center justify-center gap-2 py-8'>
          <div className='flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-8'>
            <div className='text-4xl sm:text-5xl font-black drop-shadow-lg text-foreground'>Raliz</div>
            <h2 className='text-5xl sm:text-6xl font-black text-foreground drop-shadow-lg'>×</h2>
            {org.logoUrl && (
              <div className='w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-foreground/40 bg-background/90 backdrop-blur-sm shadow-2xl'>
                <img src={org.logoUrl} alt={org.name} className='w-full h-full object-cover' />
              </div>
            )}
            <div className='text-4xl sm:text-5xl font-black text-foreground drop-shadow-lg'>{org.name}</div>
          </div>
          <p className='text-muted-foreground'>{`Discover exclusive raffles from ${org.name}`}</p>
        </div>

        <RaffleList raffles={raffles || []} />
      </section>
    </>
  );
}

export default withParams(HomePage);
