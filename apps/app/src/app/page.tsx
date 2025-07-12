import { type NextPageProps, withParams } from '@/lib/wrappers/with-params';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const generateMetadata = (): Metadata => ({
  title: 'Home',
  description: 'Welcome to Raliz',
});

async function HomePage({ searchParams }: NextPageProps) {
  const p = (await searchParams)?.p;

  return (
    <section>
      <div>
        {p
          ? `Search param "p" value: ${p}`
          : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus id eaque maxime nihil harum eligendi nisi nostrum perferendis neque quasi obcaecati temporibus ullam, quod nemo ad fuga molestias voluptatem voluptate.'}
      </div>
    </section>
  );
}

export default withParams(HomePage);
