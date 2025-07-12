import { getOverallRanking, getSeasons } from '@/actions/ranking/get';
import { QueryBoundary } from '@repo/ui/components/shuip/query-boundary';
import type { Metadata } from 'next';
import { RankingPageClient } from './ranking-client';

export const dynamic = 'force-dynamic';

export const generateMetadata = (): Metadata => ({
  title: 'Rankings - Raliz',
  description: 'Discover the top organizations and their performance in raffles',
});

export default function RankingPage() {
  return (
    <section className='mx-auto py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Organization Rankings</h1>
        <p className='text-muted-foreground'>
          Discover the top organizations and their performance based on CHZ tokens engaged in raffles
        </p>
      </div>

      <QueryBoundary>
        <Content />
      </QueryBoundary>
    </section>
  );
}

async function Content() {
  const [overallRankingResult, seasonsResult] = await Promise.all([getOverallRanking(), getSeasons()]);

  if (!overallRankingResult.ok) {
    throw new Error(overallRankingResult.message);
  }

  if (!seasonsResult.ok) {
    throw new Error(seasonsResult.message);
  }

  return <RankingPageClient initialOverallRanking={overallRankingResult.data} seasons={seasonsResult.data} />;
}
