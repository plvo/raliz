import { getOrCreateUserFromWeb3Auth } from '@/actions/user/create';
import type { User } from '@repo/db';
import { redirect } from 'next/navigation';
import type * as React from 'react';

export interface NextPageProps {
  params?: Promise<{ [key: string]: string | string[] | undefined }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export interface WithUserProps extends NextPageProps {
  user: User;
}

export function withUser<P extends NextPageProps>(Page: React.ComponentType<P & WithUserProps>) {
  return async function WithUserWrapper(props: P) {
    const userResult = await getOrCreateUserFromWeb3Auth();

    console.log('userResult', userResult);

    if (!userResult.ok || !userResult.data) {
      redirect('/auth/login');
    }

    return <Page {...(props as P)} user={userResult.data} />;
  };
}
