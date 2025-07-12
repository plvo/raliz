'use client';

import { cn } from '@repo/ui/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletButton } from './wallet-button';

export default function NavApp() {
  const pathname = usePathname();

  return (
    <nav className='backdrop-blur-2xl border-b border-border p-4 fixed top-0 left-0 right-0 z-50'>
      <div className='w-full lg:max-w-7xl mx-auto flex items-center justify-between'>
        <div className='text-2xl font-bold'>Raliz</div>

        <div className='flex items-center gap-4'>
          <NavLink pathname={pathname} href='/' label='Home' />
          <NavLink pathname={pathname} href='/about' label='About' />
          <NavLink pathname={pathname} href='/dashboard' label='Dashboard' />
        </div>

        <div className='flex items-center gap-4'>
          <WalletButton />
        </div>
      </div>
    </nav>
  );
}

function NavLink({ pathname, href, label }: { pathname: string; href: string; label: string }) {
  return (
    <Link href={href} className={cn(pathname === href && 'bg-muted rounded-md px-2 py-1')}>
      {label}
    </Link>
  );
}
