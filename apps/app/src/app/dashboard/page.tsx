import type { Metadata } from 'next';
import DashboardClient from './client-dashboard';

export const generateMetadata = (): Metadata => {
  return {
    title: 'Dashboard',
    description: 'Dashboard',
  };
};

export default function DashboardPage() {
  return <DashboardClient />;
}
