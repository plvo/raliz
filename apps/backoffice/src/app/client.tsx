'use client';

import { useUser } from '@/lib/providers/user-provider';

export default function ClientIndex() {
  const useUserData = useUser();

  return (
    <div>
      <h1>Client Index</h1>
      <pre>{JSON.stringify(useUserData, null, 2)}</pre>
    </div>
  );
}
