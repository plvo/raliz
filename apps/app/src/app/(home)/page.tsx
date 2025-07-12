import { getOrgs } from '@/actions/org/get';
import { HomeHero } from '@/components/home/home-hero';
import { HomePageClient } from '@/components/home/home-page-client';
import { QueryBoundary } from '@repo/ui/components/shuip/query-boundary';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const generateMetadata = (): Metadata => ({
  title: 'Home',
  description: 'Welcome to Raliz',
});

export default async function HomePage() {
  return (
    <QueryBoundary>
      <Content />
    </QueryBoundary>
  );
}

async function Content() {
  const orgsRes = await getOrgs();

  if (!orgsRes.ok) {
    throw new Error(orgsRes.message);
  }

  return (
    <>
      <HomeHero />
      <HomePageClient organizers={orgsRes.data} />
    </>
  );
}
