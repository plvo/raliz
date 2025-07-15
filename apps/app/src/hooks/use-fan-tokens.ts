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

export function useFanTokenBalances(walletAddress: string | undefined) {
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

  const galBalance = useReadContract({
    address: process.env.NEXT_PUBLIC_GALA_TOKEN_ADDRESS as `0x${string}`,
    abi: MockFanTokenABI,
    functionName: 'balanceOf',
    args: [walletAddress as `0x${string}`],
    query: {
      enabled: !!walletAddress && !!process.env.NEXT_PUBLIC_GALA_TOKEN_ADDRESS,
    },
  });

  console.log({ galBalance, cityBalance });

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

  const galDecimals = useReadContract({
    address: process.env.NEXT_PUBLIC_GALA_TOKEN_ADDRESS as `0x${string}`,
    abi: MockFanTokenABI,
    functionName: 'decimals',
    query: {
      enabled: !!process.env.NEXT_PUBLIC_GALA_TOKEN_ADDRESS,
    },
  });

  const balances: FanTokenBalance[] = [];
  const minimumRequired = 50;

  if (psgBalance.data !== undefined && psgDecimals.data !== undefined) {
    const balance = Number(psgBalance.data) / 10 ** Number(psgDecimals.data);
    balances.push({
      symbol: 'PSG',
      name: 'Paris Saint-Germain Fan Token',
      balance: balance.toString(),
      decimals: Number(psgDecimals.data),
      tokenAddress: CONTRACT_ADDRESSES.PSG_TOKEN as `0x${string}`,
      organizerName: 'Paris Saint-Germain',
      isEligible: balance >= minimumRequired,
      minimumRequired: minimumRequired.toString(),
    });
  }

  if (barBalance.data !== undefined && barDecimals.data !== undefined) {
    const balance = Number(barBalance.data) / 10 ** Number(barDecimals.data);
    balances.push({
      symbol: 'BAR',
      name: 'FC Barcelona Fan Token',
      balance: balance.toString(),
      decimals: Number(barDecimals.data),
      tokenAddress: CONTRACT_ADDRESSES.BAR_TOKEN as `0x${string}`,
      organizerName: 'FC Barcelona',
      isEligible: balance >= minimumRequired,
      minimumRequired: minimumRequired.toString(),
    });
  }

  if (cityBalance.data !== undefined && cityDecimals.data !== undefined) {
    const balance = Number(cityBalance.data) / 10 ** Number(cityDecimals.data);
    balances.push({
      symbol: 'CITY',
      name: 'Manchester City Fan Token',
      balance: balance.toString(),
      decimals: Number(cityDecimals.data),
      tokenAddress: CONTRACT_ADDRESSES.CITY_TOKEN as `0x${string}`,
      organizerName: 'Manchester City',
      isEligible: balance >= minimumRequired,
      minimumRequired: minimumRequired.toString(),
    });
  }

  if (galBalance.data !== undefined && galDecimals.data !== undefined) {
    const balance = Number(galBalance.data) / 10 ** Number(galDecimals.data);
    balances.push({
      symbol: 'GAL',
      name: 'Galatasaray Fan Token',
      balance: balance.toString(),
      decimals: Number(galDecimals.data),
      tokenAddress: process.env.NEXT_PUBLIC_GALA_TOKEN_ADDRESS as `0x${string}`,
      organizerName: 'Galatasaray',
      isEligible: balance >= minimumRequired,
      minimumRequired: minimumRequired.toString(),
    });
  }

  const isLoading =
    psgBalance.isLoading ||
    barBalance.isLoading ||
    cityBalance.isLoading ||
    galBalance.isLoading ||
    psgDecimals.isLoading ||
    barDecimals.isLoading ||
    cityDecimals.isLoading ||
    galDecimals.isLoading;

  const error =
    psgBalance.error ||
    barBalance.error ||
    cityBalance.error ||
    galBalance.error ||
    psgDecimals.error ||
    barDecimals.error ||
    cityDecimals.error ||
    galDecimals.error;

  return {
    data: balances,
    isLoading,
    error,
    refetch: () => {
      psgBalance.refetch();
      barBalance.refetch();
      cityBalance.refetch();
      galBalance.refetch();
      psgDecimals.refetch();
      barDecimals.refetch();
      cityDecimals.refetch();
      galDecimals.refetch();
    },
  };
}
