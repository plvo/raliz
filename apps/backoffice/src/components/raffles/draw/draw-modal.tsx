'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
import { useState } from "react";
import type { Raffle } from "@repo/db";
import { useUser } from "@/lib/providers/user-provider";
import { useWeb3Auth } from "@web3auth/modal/react";
import { toast } from "sonner";
import { RPC_CONFIG } from "@repo/contracts";
import { ethers } from 'ethers';
import { BlockchainService } from '@repo/contracts/src/service/blockchain.service';
import { updateRaffleAfterDraw } from "@/actions/raffle/update";
import { Loader2 } from "lucide-react";
import { getUsersByAddresses } from "@/actions/user/get";

export function DrawModal({ raffle, successCallback }: { raffle: Raffle, successCallback: (raffle: Raffle) => void }) {
    const [open, setOpen] = useState(false);
    const [winners, setWinners] = useState<string[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const { user } = useUser();
    const { web3Auth } = useWeb3Auth();

    const onDraw = async () => {
        if (!user) {
            toast.error('User not connected');
            return;
        }

        if (!web3Auth?.provider) {
            toast.error('Wallet not connected');
            return;
        }

        try {
            setIsDrawing(true);
            const ethersProvider = new ethers.BrowserProvider(web3Auth.provider);
            const signer = await ethersProvider.getSigner();
            
            const provider = new ethers.JsonRpcProvider(RPC_CONFIG.url);
            const blockchainService = new BlockchainService(provider, signer, process.env.NEXT_PUBLIC_RALIZ_CONTRACT_ADDRESS || null);

            toast.info('Drawing winners... Please wait for blockchain confirmation.');
            const transaction = await blockchainService.drawWinnersAutomatically(Number.parseInt(raffle.id), signer);
            
            await transaction.wait();
            
            const winners = await blockchainService.getWinners(Number.parseInt(raffle.id));
            
            toast.success(`Winners drawn successfully! 🎉 Winners: ${winners.length}`);
            console.log('Winners addresses:', winners);

            const updatedRaffle = await updateRaffleAfterDraw(raffle.id, winners);
            if (!updatedRaffle.ok) {
                toast.error('Error updating raffle');
                return;
            }

            const winnersEmails = await getUsersByAddresses(winners);
            if (!winnersEmails.ok || winnersEmails.data.some(winner => winner.email === null || winner.email === undefined)) {
                toast.error('Error getting winners emails');
                return;
            }
            
            setWinners(winnersEmails.data.map(winner => winner.email).filter(email => email !== null && email !== undefined));
            successCallback(updatedRaffle.data);
        } catch (error) {
            console.error('Error drawing winners:', error);
            toast.error(`Error drawing winners: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsDrawing(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button>Draw</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Draw Winners for "{raffle.title}"</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        This will automatically draw winners using the blockchain's random algorithm.
                        Winners will be selected from all eligible participants.
                    </p>
                    {isDrawing && (
                        <div className="flex items-center justify-center">
                            <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                    )}
                    {winners.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-muted-foreground">Winners:</p>
                            <ul className="list-disc list-inside">
                                {winners.map((winner, index) => (
                                    <li key={index}>{winner}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Button onClick={onDraw} className="flex-1" disabled={isDrawing}>
                            {isDrawing ? '🎲 Drawing...' : '🎲 Draw Winners Automatically'}
                        </Button>
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={isDrawing}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}