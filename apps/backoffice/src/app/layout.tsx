import { Providers } from '@/lib/providers';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Toaster } from 'sonner';
import '@/styles/globals.css';
import { cookieToWeb3AuthState } from '@web3auth/modal';
import { headers } from 'next/headers';
import { SidebarProvider } from '@repo/ui/components/sidebar';
import { AppSidebar } from '@/components/shared/backoffice-sidebar';
import { AuthWrapper } from '@/lib/wrappers/with-auth';

const geistSans = localFont({
  src: '../styles/fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: '../styles/fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Raliz Backoffice',
    default: 'Dashboard | Raliz Backoffice',
  },
  description: 'Raliz Backoffice - Manage your raffles, participants, and winners on the blockchain.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const web3authInitialState = cookieToWeb3AuthState(headersList.get('cookie'));

  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <Providers web3authInitialState={web3authInitialState}>
          <AuthWrapper>
            <SidebarProvider>
              <div className="flex h-screen">
                <AppSidebar />
                <main className="flex-1 bg-background">
                  {children}
                </main>
              </div>
            </SidebarProvider>
          </AuthWrapper>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
