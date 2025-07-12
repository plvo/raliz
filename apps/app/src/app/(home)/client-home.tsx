'use client';

import { useUser } from '@/lib/providers/user-provider';

export default function ClientHome() {
  const { user, walletAddress } = useUser();

  return <div>ClientHome</div>;
}
