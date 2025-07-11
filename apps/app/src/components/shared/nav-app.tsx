'use client';

import { ThemeButton } from '@repo/ui/components/shuip/theme-button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletButton } from './wallet-button';

export default function NavApp() {
  const pathname = usePathname();

  return (
    <nav className='flex items-center justify-between backdrop-blur-2xl border-b border-border p-4 fixed top-0 left-0 right-0 z-50'>
      <div className='text-2xl font-bold'>Raliz</div>

      <div className='flex items-center gap-4'>
        <Link href='/'>Home</Link>
        <Link href='/about'>About</Link>
        <Link href='/dashboard'>Dashboard</Link>
      </div>

      <div className='flex items-center gap-4'>
        <ThemeButton />
        <WalletButton />
      </div>
    </nav>
  );
}
