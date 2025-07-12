'use client';

import { cn } from '@repo/ui/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletButton } from './wallet-button';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/profile', label: 'Profile' },
];

export default function NavApp() {
  const pathname = usePathname();

  return (
    <nav className='backdrop-blur-2xl border-b border-border p-4 fixed top-0 left-0 right-0 z-50 bg-background/80'>
      <div className='w-full lg:max-w-7xl mx-auto flex items-center justify-between'>
        <div className='text-2xl font-bold text-foreground'>Raliz</div>

        <div className='flex items-center gap-4'>
          {navLinks.map((link) => (
            <NavLink key={link.href} pathname={pathname} href={link.href} label={link.label} />
          ))}
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
    <Link
      href={href}
      className={cn(
        'text-foreground hover:text-primary transition-colors px-2 py-1 rounded-md',
        pathname === href && 'bg-foreground/10 text-primary font-medium',
      )}
    >
      {label}
    </Link>
  );
}
