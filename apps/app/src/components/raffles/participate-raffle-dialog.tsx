'use client';

import { createParticipation } from '@/actions/participation/create';
import { useActionMutation } from '@/hooks/use-action';
import { useUser } from '@/lib/providers/user-provider';
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
import { useEffect, useState } from 'react';

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

  // Vérifier l'éligibilité quand le dialog s'ouvre
  useEffect(() => {
    if (open && walletAddress) {
      checkEligibility();
    }
  }, [open, walletAddress]);

  const checkEligibility = async () => {
    if (!walletAddress) return;

    setCheckingEligibility(true);
    try {
      // Pour l'instant, on utilise un ID temporaire basé sur un hash de l'ID raffle
      // Dans une vraie implémentation, il faudrait un mapping database->blockchain
      const tempRaffleId = 0; // Temporaire - en attendant l'intégration complète

      // Créer un provider et utiliser directement le contrat pour récupérer toutes les infos
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || 'https://spicy-rpc.chiliz.com');
      const { createRalizContract } = await import('@repo/contracts');
      const contractAddress = process.env.NEXT_PUBLIC_RALIZ_CONTRACT_ADDRESS || '';

      if (!contractAddress) {
        throw new Error('Contract address not configured');
      }

      const contract = createRalizContract(contractAddress, provider);
      const result = await contract.isEligibleToParticipate(tempRaffleId, walletAddress);

      console.log('result', result);

      setEligibility({
        eligible: result[0],
        userBalance: result[1],
        required: result[2],
        reason: result[3],
      });
    } catch (error) {
      console.error('Error checking eligibility:', error);
      setEligibility({
        eligible: false,
        userBalance: 0n,
        required: 0n,
        reason: 'Error checking eligibility',
      });
    }
    setCheckingEligibility(false);
  };

  // Mutation pour participer à la raffle
  const { mutate: participate, isPending: isParticipating } = useActionMutation({
    actionFn: async () => {
      if (!web3Auth?.provider || !walletAddress || !user) {
        throw new Error('Wallet not connected or user not found');
      }

      // Créer un provider Web3Auth
      const ethersProvider = new ethers.BrowserProvider(web3Auth.provider);
      const signer = await ethersProvider.getSigner();

      // Pour l'instant, on utilise un ID temporaire
      const tempRaffleId = 0;

      // Utiliser directement le contrat
      const { createRalizContract } = await import('@repo/contracts');
      const contractAddress = process.env.NEXT_PUBLIC_RALIZ_CONTRACT_ADDRESS || '';

      if (!contractAddress) {
        throw new Error('Contract address not configured');
      }

      const contract = createRalizContract(contractAddress, signer);

      // Participer à la raffle
      const feeWei = ethers.parseEther(raffle.participationPrice);
      const tx = await contract.participate(tempRaffleId, { value: feeWei });

      // Attendre la confirmation de la transaction
      const receipt = await tx.wait();

      if (!receipt || receipt.status !== 1) {
        throw new Error('Transaction failed');
      }

      // Sauvegarder la participation en base de données
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
        data: { transactionHash: receipt.hash, participationId: participationResult.data.participationId },
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
          {eligibility.reason.includes('Insufficient fan token') && (
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

        <pre>
          {JSON.stringify(
            {
              eligibility: eligibility?.eligible,
              userBalance: eligibility?.userBalance.toString(),
              required: eligibility?.required.toString(),
              reason: eligibility?.reason,
            },
            null,
            2,
          )}
        </pre>

        <div className='space-y-4'>
          {/* Raffle Details */}
          <Card>
            <CardContent className='p-4'>
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

          {/* Eligibility Status */}
          {getEligibilityStatus()}

          {/* Prize Preview */}
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
