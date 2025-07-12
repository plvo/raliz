'use client';

import * as React from 'react';

export function HomeHero() {
  return (
    <div className='-mt-20 relative w-full h-screen overflow-hidden bg-background'>
      <HomeHeroBackground />
      <div className='absolute inset-0'>
        {[...Array(35)].map((_, i) => (
          <div
            key={i}
            className='absolute rounded-full animate-pulse'
            style={{
              width: `${Math.random() * 6 + 3}px`,
              height: `${Math.random() * 6 + 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: [
                'rgb(16, 185, 129)', // emerald-500
                'rgb(59, 130, 246)', // blue-500
                'rgb(168, 85, 247)', // purple-500
                'rgb(249, 115, 22)', // orange-500
                'rgb(236, 72, 153)', // pink-500
                'rgb(34, 197, 94)', // green-500
                'rgb(245, 101, 101)', // red-400
              ][Math.floor(Math.random() * 7)],
              opacity: Math.random() * 0.8 + 0.4,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1.5 + Math.random() * 2.5}s`,
            }}
          />
        ))}
      </div>

      <div className='relative z-10 flex items-center justify-center h-full px-4'>
        <div className='text-center'>
          <div className='mb-8'>
            <h1 className='text-6xl sm:text-7xl font-black text-foreground drop-shadow-lg mb-6'>Raliz</h1>
            <p className='text-2xl sm:text-3xl text-muted-foreground font-medium mb-8 drop-shadow-md'>
              The ultimate platform for sports fan engagement
            </p>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
              Join exclusive raffles, win amazing prizes, and connect with your favorite teams on the Chiliz blockchain
            </p>
          </div>
          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <button
              type='button'
              className='px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors shadow-lg'
            >
              Explore Raffles
            </button>
            <button
              type='button'
              className='px-8 py-4 border-2 border-foreground/20 text-foreground hover:bg-foreground/5 font-bold rounded-lg transition-colors'
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      <div
        className='absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/60 to-transparent transition-opacity duration-500'
        style={{
          opacity: Math.min(scrollY / 150, 1),
        }}
      />

      <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 text-foreground animate-bounce'>
        <div className='flex flex-col items-center gap-3'>
          <span className='text-sm font-medium text-muted-foreground'>Discover all active raffles</span>
          <div className='w-8 h-8 border-2 border-emerald-400 rounded-full flex items-center justify-center bg-emerald-400/20 backdrop-blur-sm'>
            <div className='w-2 h-2 bg-emerald-400 rounded-full animate-ping' />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeHeroBackground() {
  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <div
      className='absolute inset-0 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 dark:from-emerald-600 dark:via-blue-600 dark:to-purple-700'
      style={{
        backgroundImage: `
        radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.4) 0%, transparent 40%),
        radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.4) 0%, transparent 40%),
        radial-gradient(circle at 40% 60%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
        linear-gradient(135deg, transparent 30%, rgba(255, 255, 255, 0.05) 45%, transparent 60%)
      `,
        transform: `translateY(${scrollY * 0.5}px)`,
      }}
    />
  );
}
