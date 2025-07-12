import type { Metadata } from 'next';
import ClientProfile from './client-profile';

export const generateMetadata = (): Metadata => {
  return {
    title: 'Profile',
    description: 'Profile page',
  };
};

export default function ProfilePage() {
  return <ClientProfile />;
}
