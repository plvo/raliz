export const CHILIZ_SPICY_TESTNET = {
    id: 88882,
    name: 'Chiliz Spicy Testnet',
    network: 'chiliz-spicy-testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'CHZ',
        symbol: 'CHZ',
    },
    rpcUrls: {
        default: {
            http: ['https://spicy-rpc.chiliz.com'],
            webSocket: ['wss://spicy-rpc.chiliz.com/ws'],
        },
        public: {
            http: ['https://spicy-rpc.chiliz.com'],
            webSocket: ['wss://spicy-rpc.chiliz.com/ws'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Chiliz Explorer',
            url: 'https://testnet.chiliscan.com',
        },
    },
    testnet: true,
} as const;

// Adresses des contrats déployés sur Spicy Testnet
export const CONTRACT_ADDRESSES = {
    RALIZ: process.env.NEXT_PUBLIC_RALIZ_CONTRACT_ADDRESS || '',
    PSG_TOKEN: process.env.NEXT_PUBLIC_PSG_TOKEN_ADDRESS || '',
    BAR_TOKEN: process.env.NEXT_PUBLIC_BAR_TOKEN_ADDRESS || '',
    CITY_TOKEN: process.env.NEXT_PUBLIC_CITY_TOKEN_ADDRESS || '',
} as const;

// Configuration RPC pour ethers.js
export const RPC_CONFIG = {
    url: 'https://spicy-rpc.chiliz.com',
    chainId: 88882,
} as const; 