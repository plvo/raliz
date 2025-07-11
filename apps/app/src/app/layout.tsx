import { Providers } from '@/lib/providers';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import '@/styles/globals.css';
import NavApp from '@/components/shared/nav-app';
import { cookieToWeb3AuthState } from '@web3auth/modal';
import { headers } from 'next/headers';
import { Toaster } from 'sonner';

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
    template: '%s | Raliz',
    default: 'Home | Raliz',
  },
  description: 'Raliz, a project using Chiliz Blockchain',
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
          <NavApp />
          <main>{children}</main>
          <Toaster richColors position='bottom-right' />
        </Providers>
      </body>
    </html>
  );
}
