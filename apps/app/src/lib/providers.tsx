'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  EVM_CONNECTORS,
  type IWeb3AuthState,
  WALLET_CONNECTORS,
  WEB3AUTH_NETWORK,
  type Web3AuthOptions,
} from '@web3auth/modal';
import { Web3AuthProvider } from '@web3auth/modal/react';
import type { Web3AuthContextConfig } from '@web3auth/modal/react';
import { WagmiProvider } from '@web3auth/modal/react/wagmi';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

const web3AuthOptions: Web3AuthOptions = {
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  clientId: 'BDfGekwXLJUrFw-WIxiDBLuqaZ7J9nDFSgZEug-KMBaSYgY4nfX_xTJRSr7_kGEz-MDVBhaa_M_RAJIITVuPlV0',
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  modalConfig: {
    connectors: {
      // Connecteur AUTH pour les logins sociaux - ACTIVÉ pour email seulement
      [WALLET_CONNECTORS.AUTH]: {
        label: 'Email Login',
        showOnModal: true,
        loginMethods: {
          // Activer seulement l'email passwordless
          email_passwordless: {
            showOnModal: true,
          },
        },
      },
      // Connecteur MetaMask - ACTIVÉ
      [EVM_CONNECTORS.METAMASK]: {
        label: 'MetaMask',
        showOnModal: true,
      },
      // Désactiver les autres connecteurs
      [EVM_CONNECTORS.WALLET_CONNECT_V2]: {
        label: 'WalletConnect',
        showOnModal: false,
      },
      [EVM_CONNECTORS.COINBASE]: {
        label: 'Coinbase',
        showOnModal: false,
      },
    },
  },
};

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions,
};

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

interface ProvidersProps {
  children: React.ReactNode;
  web3authInitialState: IWeb3AuthState | undefined;
}

export function Providers({ children, web3authInitialState, ...props }: ProvidersProps) {
  return (
    <Web3AuthProvider config={web3AuthContextConfig} initialState={web3authInitialState}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider>
          <NextThemesProvider {...props}>{children}</NextThemesProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </Web3AuthProvider>
  );
}
