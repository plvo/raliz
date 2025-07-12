'use client';

import { CHILIZ_SPICY_TESTNET } from '@repo/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { IWeb3AuthState } from '@web3auth/modal';
import { Web3AuthProvider } from '@web3auth/modal/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { http, WagmiProvider, createConfig } from 'wagmi';
import { UserProvider } from './user-provider';
import { web3AuthContextConfig } from './web3auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

// Configuration Wagmi pour Chiliz Spicy Testnet uniquement
const wagmiConfig = createConfig({
  chains: [CHILIZ_SPICY_TESTNET], // Uniquement le testnet Chiliz Spicy
  transports: {
    [CHILIZ_SPICY_TESTNET.id]: http(CHILIZ_SPICY_TESTNET.rpcUrls.default.http[0]),
  },
  syncConnectedChain: true, // Synchronise automatiquement avec la chaîne connectée
});

interface ProvidersProps {
  children: React.ReactNode;
  web3authInitialState: IWeb3AuthState | undefined;
}

export function Providers({ children, web3authInitialState, ...props }: ProvidersProps) {
  return (
    <Web3AuthProvider config={web3AuthContextConfig} initialState={web3authInitialState}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <UserProvider>
            <NextThemesProvider {...props}>{children}</NextThemesProvider>
          </UserProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </Web3AuthProvider>
  );
}
