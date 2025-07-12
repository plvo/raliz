'use client';

import { CONTRACT_ADDRESSES, MockFanTokenABI } from '@repo/contracts';
import { useReadContract } from 'wagmi';

export interface FanTokenBalance {
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  tokenAddress: string;
  organizerName?: string;
  organizerId?: string;
  isEligible: boolean;
  minimumRequired: string;
}

const FAN_TOKENS = [
  {
    symbol: 'PSG',
    name: 'Paris Saint-Germain Fan Token',
    address: CONTRACT_ADDRESSES.PSG_TOKEN,
    organizerName: 'Paris Saint-Germain',
  },
  {
    symbol: 'BAR',
    name: 'FC Barcelona Fan Token',
    address: CONTRACT_ADDRESSES.BAR_TOKEN,
    organizerName: 'FC Barcelona',
  },
  {
    symbol: 'CITY',
    name: 'Manchester City Fan Token',
    address: CONTRACT_ADDRESSES.CITY_TOKEN,
    organizerName: 'Manchester City',
  },
] as const;

export function useFanTokenBalances(walletAddress: string | undefined) {
  // Récupérer les balances pour chaque token
  const psgBalance = useReadContract({
    address: CONTRACT_ADDRESSES.PSG_TOKEN as `0x${string}`,
    abi: MockFanTokenABI,
    functionName: 'balanceOf',
    args: [walletAddress as `0x${string}`],
    query: {
      enabled: !!walletAddress && !!CONTRACT_ADDRESSES.PSG_TOKEN,
    },
  });

  const barBalance = useReadContract({
    address: CONTRACT_ADDRESSES.BAR_TOKEN as `0x${string}`,
    abi: MockFanTokenABI,
    functionName: 'balanceOf',
    args: [walletAddress as `0x${string}`],
    query: {
      enabled: !!walletAddress && !!CONTRACT_ADDRESSES.BAR_TOKEN,
    },
  });

  const cityBalance = useReadContract({
    address: CONTRACT_ADDRESSES.CITY_TOKEN as `0x${string}`,
    abi: MockFanTokenABI,
    functionName: 'balanceOf',
    args: [walletAddress as `0x${string}`],
    query: {
      enabled: !!walletAddress && !!CONTRACT_ADDRESSES.CITY_TOKEN,
    },
  });

  // Récupérer les decimals pour chaque token
  const psgDecimals = useReadContract({
    address: CONTRACT_ADDRESSES.PSG_TOKEN as `0x${string}`,
    abi: MockFanTokenABI,
    functionName: 'decimals',
    query: {
      enabled: !!CONTRACT_ADDRESSES.PSG_TOKEN,
    },
  });

  const barDecimals = useReadContract({
    address: CONTRACT_ADDRESSES.BAR_TOKEN as `0x${string}`,
    abi: MockFanTokenABI,
    functionName: 'decimals',
    query: {
      enabled: !!CONTRACT_ADDRESSES.BAR_TOKEN,
    },
  });

  const cityDecimals = useReadContract({
    address: CONTRACT_ADDRESSES.CITY_TOKEN as `0x${string}`,
    abi: MockFanTokenABI,
    functionName: 'decimals',
    query: {
      enabled: !!CONTRACT_ADDRESSES.CITY_TOKEN,
    },
  });

  // Combiner les résultats
  const balances: FanTokenBalance[] = [];
  const minimumRequired = 50; // Standard minimum

  // PSG Token
  if (psgBalance.data !== undefined && psgDecimals.data !== undefined) {
    const balance = Number(psgBalance.data) / 10 ** Number(psgDecimals.data);
    balances.push({
      symbol: 'PSG',
      name: 'Paris Saint-Germain Fan Token',
      balance: balance.toString(),
      decimals: Number(psgDecimals.data),
      tokenAddress: CONTRACT_ADDRESSES.PSG_TOKEN,
      organizerName: 'Paris Saint-Germain',
      isEligible: balance >= minimumRequired,
      minimumRequired: minimumRequired.toString(),
    });
  }

  // BAR Token
  if (barBalance.data !== undefined && barDecimals.data !== undefined) {
    const balance = Number(barBalance.data) / 10 ** Number(barDecimals.data);
    balances.push({
      symbol: 'BAR',
      name: 'FC Barcelona Fan Token',
      balance: balance.toString(),
      decimals: Number(barDecimals.data),
      tokenAddress: CONTRACT_ADDRESSES.BAR_TOKEN,
      organizerName: 'FC Barcelona',
      isEligible: balance >= minimumRequired,
      minimumRequired: minimumRequired.toString(),
    });
  }

  // CITY Token
  if (cityBalance.data !== undefined && cityDecimals.data !== undefined) {
    const balance = Number(cityBalance.data) / 10 ** Number(cityDecimals.data);
    balances.push({
      symbol: 'CITY',
      name: 'Manchester City Fan Token',
      balance: balance.toString(),
      decimals: Number(cityDecimals.data),
      tokenAddress: CONTRACT_ADDRESSES.CITY_TOKEN,
      organizerName: 'Manchester City',
      isEligible: balance >= minimumRequired,
      minimumRequired: minimumRequired.toString(),
    });
  }

  // Déterminer l'état de loading et d'erreur
  const isLoading =
    psgBalance.isLoading ||
    barBalance.isLoading ||
    cityBalance.isLoading ||
    psgDecimals.isLoading ||
    barDecimals.isLoading ||
    cityDecimals.isLoading;

  const error =
    psgBalance.error ||
    barBalance.error ||
    cityBalance.error ||
    psgDecimals.error ||
    barDecimals.error ||
    cityDecimals.error;

  return {
    data: balances,
    isLoading,
    error,
    refetch: () => {
      psgBalance.refetch();
      barBalance.refetch();
      cityBalance.refetch();
      psgDecimals.refetch();
      barDecimals.refetch();
      cityDecimals.refetch();
    },
  };
}
