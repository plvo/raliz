import { EVM_CONNECTORS, WALLET_CONNECTORS, WEB3AUTH_NETWORK, type Web3AuthOptions } from '@web3auth/modal';
import type { Web3AuthContextConfig } from '@web3auth/modal/react';

const web3AuthOptions: Web3AuthOptions = {
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
            showOnModal: false,
          },
          sms_passwordless: {
            showOnModal: false,
          },
          apple: {
            showOnModal: false,
          },
          google: {
            showOnModal: false,
          },
          discord: {
            showOnModal: false,
          },
          github: {
            showOnModal: false,
          },
          // twitter: {
          //   showOnModal: false,
          // },
          facebook: {
            showOnModal: false,
          },
          twitch: {
            showOnModal: false,
          },
          reddit: {
            showOnModal: false,
          },
          farcaster: {
            showOnModal: false,
          },
          line: {
            showOnModal: false,
          },
          // telegram: {

          // },
          wechat: {
            showOnModal: false,
          },
          linkedin: {
            showOnModal: false,
          },
          kakao: {
            showOnModal: false,
          },
        },
      },
      // Connecteur MetaMask - ACTIVÉ
      [EVM_CONNECTORS.METAMASK]: {
        label: 'MetaMask',
        showOnModal: true,
      },

      // Connecteur WalletConnect - ACTIVÉ pour Rabby et autres wallets
      [EVM_CONNECTORS.WALLET_CONNECT_V2]: {
        label: 'WalletConnect',
        showOnModal: true,
      },
    },
  },
};

export const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions,
};
