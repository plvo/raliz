'use client';

import { createParticipation } from '@/actions/participation/create';
import { getRaffleContractId } from '@/actions/raffle/get';
import { useActionMutation } from '@/hooks/use-action';
import { useUser } from '@/lib/providers/user-provider';
import { BlockchainService } from '@repo/contracts';
import type { Raffle } from '@repo/db';
import { Button } from '@repo/ui/components/button';
import { Card, CardContent } from '@repo/ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Separator } from '@repo/ui/components/separator';
import { useWeb3Auth } from '@web3auth/modal/react';
import { ethers } from 'ethers';
import { AlertCircle, CheckCircle, Clock, CreditCard, Loader2, Target, Trophy, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface ParticipateRaffleDialogProps {
  raffle: Raffle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface EligibilityCheck {
  eligible: boolean;
  userBalance: bigint;
  required: bigint;
  reason: string;
}

export function ParticipateRaffleDialog({ raffle, open, onOpenChange, onSuccess }: ParticipateRaffleDialogProps) {
  const { user, walletAddress, isConnected } = useUser();
  const { web3Auth } = useWeb3Auth();
  const [eligibility, setEligibility] = useState<EligibilityCheck | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  // Créer le service blockchain avec un provider en lecture seule
  const createBlockchainService = useCallback(async () => {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || 'https://spicy-rpc.chiliz.com');

    // Pour les opérations de lecture, on utilise un wallet factice
    const dummySigner = ethers.Wallet.createRandom().connect(provider);

    return new BlockchainService(provider, dummySigner);
  }, []);

  const contractRaffleId = raffle.contractRaffleId;

  // Vérifier l'éligibilité quand le dialog s'ouvre
  const checkEligibility = useCallback(async () => {
    if (!walletAddress || !contractRaffleId) return;

    setCheckingEligibility(true);
    try {
      const blockchainService = await createBlockchainService();

      const result = await blockchainService.isEligibleToParticipate(contractRaffleId, walletAddress);

      setEligibility({
        eligible: result,
        userBalance: 0n, // TODO: Récupérer la vraie balance
        required: BigInt(raffle.minimumFanTokens || 0),
        reason: result ? 'Eligible' : 'Not eligible to participate',
      });
    } catch (error) {
      console.error('Error checking eligibility:', error);
      setEligibility({
        eligible: false,
        userBalance: 0n,
        required: BigInt(raffle.minimumFanTokens || 0),
        reason: 'Error checking eligibility',
      });
    }
    setCheckingEligibility(false);
  }, [walletAddress, createBlockchainService, raffle.minimumFanTokens, contractRaffleId]);

  useEffect(() => {
    if (open && walletAddress) {
      checkEligibility();
    }
  }, [open, walletAddress, checkEligibility]);

  // Mutation pour participer à la raffle
  const { mutate: participate, isPending: isParticipating } = useActionMutation({
    actionFn: async () => {
      if (!web3Auth?.provider || !walletAddress || !user) {
        throw new Error('Wallet not connected or user not found');
      }

      // Récupérer l'ID du smart contract depuis la base de données
      const contractIdResult = await getRaffleContractId(raffle.id);
      if (!contractIdResult.ok) {
        throw new Error('Failed to get contract raffle ID');
      }

      const contractRaffleId = contractIdResult.data.contractRaffleId;
      if (contractRaffleId === null) {
        throw new Error('This raffle has not been deployed to the blockchain yet');
      }

      // Créer un provider avec signer pour les transactions
      const ethersProvider = new ethers.BrowserProvider(web3Auth.provider);
      const signer = await ethersProvider.getSigner();

      const blockchainService = new BlockchainService(
        new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || 'https://spicy-rpc.chiliz.com'),
        signer,
      );

      // Participer via le service blockchain
      const tx = await blockchainService.participateInRaffle(contractRaffleId, raffle.participationPrice, signer);

      // Attendre la confirmation
      const receipt = await tx.wait();

      if (!receipt || receipt.status !== 1) {
        throw new Error('Transaction failed');
      }

      // Sauvegarder en base de données
      const participationResult = await createParticipation({
        raffleId: raffle.id,
        userId: user.id,
        walletAddress,
        transactionHash: receipt.hash,
        amountPaid: raffle.participationPrice,
        tokenUsed: raffle.tokenSymbol,
      });

      if (!participationResult.ok) {
        throw new Error(participationResult.message || 'Failed to save participation');
      }

      return {
        ok: true,
        data: {
          transactionHash: receipt.hash,
          participationId: participationResult.data.participationId,
        },
      };
    },
    successEvent: {
      toast: {
        title: 'Participation successful!',
        description: 'You have successfully joined the raffle. Good luck!',
      },
      fn: () => {
        onOpenChange(false);
        onSuccess?.();
      },
    },
    errorEvent: {
      toast: {
        title: 'Participation failed',
        description: 'Failed to join the raffle. Please try again.',
      },
    },
    invalidateQueries: [['raffles'], ['user-participations', user?.id || ''], ['user', walletAddress || '']],
  });

  const formatPrice = (price: string) => {
    return `${price} CHZ`;
  };

  const formatTokenAmount = (amount: bigint, decimals = 18) => {
    return ethers.formatUnits(amount, decimals);
  };

  const getEligibilityStatus = () => {
    if (checkingEligibility) {
      return (
        <div className='flex items-center gap-2 p-3 bg-muted/50 rounded-lg'>
          <Loader2 className='w-4 h-4 animate-spin' />
          <span className='text-sm'>Checking eligibility...</span>
        </div>
      );
    }

    if (!eligibility) return null;

    if (eligibility.eligible) {
      return (
        <div className='flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg'>
          <CheckCircle className='w-4 h-4 text-green-600' />
          <span className='text-sm text-green-800 dark:text-green-400'>You are eligible to participate!</span>
        </div>
      );
    }

    return (
      <div className='flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg'>
        <AlertCircle className='w-4 h-4 text-red-600' />
        <div className='flex-1'>
          <span className='text-sm text-red-800 dark:text-red-400 block'>Not eligible: {eligibility.reason}</span>
          {eligibility.userBalance > 0n && eligibility.required > 0n && (
            <span className='text-xs text-red-600 dark:text-red-500'>
              You have {formatTokenAmount(eligibility.userBalance)} {raffle.tokenSymbol}, but need{' '}
              {formatTokenAmount(eligibility.required)}
            </span>
          )}
        </div>
      </div>
    );
  };

  const canParticipate = isConnected && eligibility?.eligible && !isParticipating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Trophy className='w-5 h-5 text-primary' />
            Join Raffle
          </DialogTitle>
          <DialogDescription>Review the details and confirm your participation</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <Card>
            <CardContent className='p-4'>
              <pre>{JSON.stringify({ eligibility: eligibility?.eligible, contractRaffleId }, null, 2)}</pre>

              <h3 className='font-semibold text-sm mb-2'>{raffle.title}</h3>
              <p className='text-sm text-muted-foreground mb-3 line-clamp-2'>{raffle.description}</p>

              <div className='space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='flex items-center gap-1'>
                    <CreditCard className='w-3 h-3' />
                    Entry Fee
                  </span>
                  <span className='font-medium'>{formatPrice(raffle.participationPrice)}</span>
                </div>

                <div className='flex items-center justify-between text-sm'>
                  <span className='flex items-center gap-1'>
                    <Target className='w-3 h-3' />
                    Max Winners
                  </span>
                  <span className='font-medium'>{raffle.maxWinners}</span>
                </div>

                <div className='flex items-center justify-between text-sm'>
                  <span className='flex items-center gap-1'>
                    <Users className='w-3 h-3' />
                    Required Tokens
                  </span>
                  <span className='font-medium'>
                    {raffle.minimumFanTokens} {raffle.tokenSymbol}
                  </span>
                </div>

                <div className='flex items-center justify-between text-sm'>
                  <span className='flex items-center gap-1'>
                    <Clock className='w-3 h-3' />
                    Ends
                  </span>
                  <span className='font-medium'>{new Date(raffle.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {getEligibilityStatus()}

          <div className='p-3 bg-primary/5 rounded-lg border border-primary/10'>
            <div className='flex items-center gap-2 mb-1'>
              <Trophy className='w-4 h-4 text-primary' />
              <span className='text-sm font-medium text-primary'>Prize</span>
            </div>
            <p className='text-sm text-foreground'>{raffle.prizeDescription}</p>
          </div>
        </div>

        <DialogFooter className='flex gap-2'>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isParticipating}>
            Cancel
          </Button>
          <Button onClick={() => participate()} disabled={!canParticipate} className='flex items-center gap-2'>
            {isParticipating ? (
              <>
                <Loader2 className='w-4 h-4 animate-spin' />
                Joining...
              </>
            ) : (
              <>
                <Trophy className='w-4 h-4' />
                Join Raffle
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
