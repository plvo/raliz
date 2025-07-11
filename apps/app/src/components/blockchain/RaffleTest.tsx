'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@repo/ui/components/button';
import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/components/card';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Badge } from '@repo/ui/components/badge';
import { Separator } from '@repo/ui/components/separator';
import {
    blockchainService,
    type RaffleInfo,
    type RaffleStatus
} from '@/services/blockchain.service';
import { CONTRACT_ADDRESSES } from '@/lib/web3-config';

interface RaffleWithStatus {
    id: number;
    info: RaffleInfo;
    status: RaffleStatus;
    isEligible: boolean;
    hasParticipated: boolean;
}

export function RaffleTest() {
    const { address, isConnected } = useAccount();
    const [loading, setLoading] = useState(false);
    const [raffles, setRaffles] = useState<RaffleWithStatus[]>([]);
    const [selectedRaffleId, setSelectedRaffleId] = useState<string>('');

    // Charger les raffles
    const loadRaffles = useCallback(async () => {
        if (!isConnected || !address) return;

        setLoading(true);
        try {
            const count = await blockchainService.getRaffleCount();
            console.log(`Total raffles: ${count}`);

            const raffleData: RaffleWithStatus[] = [];

            for (let i = 0; i < count; i++) {
                try {
                    const [info, status, isEligible, participated] = await Promise.all([
                        blockchainService.getRaffleInfo(i),
                        blockchainService.getRaffleStatus(i),
                        blockchainService.isEligibleToParticipate(i, address),
                        blockchainService.hasParticipated(i, address)
                    ]);

                    raffleData.push({
                        id: i,
                        info,
                        status,
                        isEligible,
                        hasParticipated: participated
                    });
                } catch (error) {
                    console.error(`Error loading raffle ${i}:`, error);
                }
            }

            setRaffles(raffleData);
        } catch (error) {
            console.error('Error loading raffles:', error);
        }
        setLoading(false);
    }, [isConnected, address]);

    // Charger les raffles au montage du composant
    useEffect(() => {
        if (isConnected && address) {
            loadRaffles();
        }
    }, [isConnected, address, loadRaffles]);

    const getStatusBadge = (status: number) => {
        switch (status) {
            case 0:
                return <Badge variant="default">Active</Badge>;
            case 1:
                return <Badge variant="secondary">Terminée</Badge>;
            case 2:
                return <Badge variant="destructive">Annulée</Badge>;
            default:
                return <Badge variant="outline">Inconnu</Badge>;
        }
    };

    const formatDate = (timestamp: bigint) => {
        const date = new Date(Number(timestamp) * 1000);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getFanTokenName = (address: string) => {
        switch (address.toLowerCase()) {
            case CONTRACT_ADDRESSES.PSG_TOKEN.toLowerCase():
                return 'PSG';
            case CONTRACT_ADDRESSES.BAR_TOKEN.toLowerCase():
                return 'BAR';
            case CONTRACT_ADDRESSES.CITY_TOKEN.toLowerCase():
                return 'CITY';
            default:
                return 'Unknown Token';
        }
    };

    if (!isConnected) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Test des Raffles Blockchain</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Veuillez connecter votre wallet pour tester les interactions avec le smart contract.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Test des Raffles Blockchain</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Connecté avec: {address}
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Button onClick={loadRaffles} disabled={loading}>
                            {loading ? 'Chargement...' : 'Recharger les Raffles'}
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="raffleId">ID de la Raffle à examiner</Label>
                        <div className="flex gap-2">
                            <Input
                                id="raffleId"
                                type="number"
                                placeholder="0, 1, 2..."
                                value={selectedRaffleId}
                                onChange={(e) => setSelectedRaffleId(e.target.value)}
                                className="w-32"
                            />
                            <Button
                                onClick={() => {
                                    const id = Number.parseInt(selectedRaffleId);
                                    if (!Number.isNaN(id)) {
                                        loadRaffles();
                                    }
                                }}
                                variant="outline"
                            >
                                Examiner
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {raffles.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Raffles trouvées ({raffles.length})</h3>

                    {raffles.map((raffle) => (
                        <Card key={raffle.id} className="w-full">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">
                                            Raffle #{raffle.id}: {raffle.info.title}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {raffle.info.description}
                                        </p>
                                    </div>
                                    {getStatusBadge(raffle.status.status)}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium">Informations générales</h4>
                                        <div className="text-sm space-y-1">
                                            <p><strong>Prix:</strong> {raffle.info.prizeDescription}</p>
                                            <p><strong>Frais de participation:</strong> {blockchainService.formatCHZ(raffle.info.participationFee)} CHZ</p>
                                            <p><strong>Gagnants max:</strong> {raffle.info.maxWinners.toString()}</p>
                                            <p><strong>Organisateur:</strong> {raffle.info.organizer}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-medium">Exigences & Statut</h4>
                                        <div className="text-sm space-y-1">
                                            <p><strong>Token requis:</strong> {getFanTokenName(raffle.info.requiredFanToken)}</p>
                                            <p><strong>Minimum requis:</strong> {blockchainService.formatCHZ(raffle.info.minimumFanTokens)} tokens</p>
                                            <p><strong>Participants:</strong> {raffle.status.participantCount.toString()}</p>
                                            <p><strong>Fonds collectés:</strong> {blockchainService.formatCHZ(raffle.status.totalFunds)} CHZ</p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium">Dates</h4>
                                        <div className="text-sm space-y-1">
                                            <p><strong>Début:</strong> {formatDate(raffle.status.startDate)}</p>
                                            <p><strong>Fin:</strong> {formatDate(raffle.status.endDate)}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-medium">Votre statut</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={raffle.isEligible ? "default" : "secondary"}>
                                                    {raffle.isEligible ? "✅ Éligible" : "❌ Non éligible"}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={raffle.hasParticipated ? "default" : "outline"}>
                                                    {raffle.hasParticipated ? "✅ Déjà participé" : "⏳ Pas encore participé"}
                                                </Badge>
                                            </div>
                                            {raffle.status.winnersDrawn && (
                                                <Badge variant="secondary">
                                                    🎉 Gagnants tirés au sort
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {raffles.length === 0 && !loading && (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                            Aucune raffle trouvée. Le contrat semble vide ou non déployé.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 