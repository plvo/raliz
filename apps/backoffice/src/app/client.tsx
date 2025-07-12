'use client';

import { WalletButton } from '@/components/shared/wallet-button';
import { useUser } from '@/lib/providers/user-provider';

export default function ClientIndex() {
  const useUserData = useUser();

  return (
    <div className='flex flex-col gap-4'>
      <h1>Client Index</h1>
      <WalletButton />
      <pre>{JSON.stringify({ useUserData: { ...useUserData, balance: useUserData.balance?.formatted } }, null, 2)}</pre>
    </div>
  );
}
