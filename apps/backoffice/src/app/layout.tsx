import { Providers } from '@/lib/providers';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Toaster } from 'sonner';
import '@/styles/globals.css';
import { cookieToWeb3AuthState } from '@web3auth/modal';
import { headers } from 'next/headers';

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
    template: '%s | Classyc',
    default: 'Accueil | Classyc',
  },
  description:
    "Classyc est une application dédiée aux enseignants du premier cycle, permettant de gérer efficacement les classes, suivre les progrès des élèves, planifier les leçons et communiquer avec les parents. Un outil complet pour simplifier le quotidien des professionnels de l'éducation primaire.",
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
          <main>{children}</main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
