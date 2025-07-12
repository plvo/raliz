'use client';

import { useUser } from '@/lib/providers/user-provider';
import { useWallet } from '@/hooks/use-wallet';
import { CHILIZ_SPICY_TESTNET } from '@repo/contracts';
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/alert';
import { Button } from '@repo/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import { AlertTriangle, ExternalLink, Zap, Shield } from 'lucide-react';
import type React from 'react';

interface NetworkGuardProps {
    children: React.ReactNode;
}

export function NetworkGuard({ children }: NetworkGuardProps) {
    const { chainId } = useUser();
    const { isConnected, switchToChilizSpicyNetwork } = useWallet();

    const isOnCorrectNetwork = chainId === CHILIZ_SPICY_TESTNET.id;

    const handleSwitchNetwork = async () => {
        await switchToChilizSpicyNetwork();
    };

    // Si pas connecté, afficher les enfants normalement
    if (!isConnected) {
        return <>{children}</>;
    }

    // Si sur le bon réseau, afficher les enfants
    if (isOnCorrectNetwork) {
        return <>{children}</>;
    }

    // Si sur le mauvais réseau, afficher le message d'aide
    return (
        <div className="container mx-auto py-8 space-y-6">
            <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">⚠️ Réseau incorrect - Accès Backoffice bloqué</AlertTitle>
                <AlertDescription className="text-red-700">
                    Vous êtes connecté au réseau <strong>Chain ID: {chainId}</strong>.<br />
                    Le backoffice Raliz requiert le <strong>Chiliz Spicy Testnet (Chain ID: 88882)</strong> pour gérer les raffles.
                </AlertDescription>
            </Alert>

            <Card className="max-w-2xl mx-auto border-orange-200">
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center gap-2 justify-center">
                        <Shield className="h-6 w-6 text-orange-600" />
                        <span className="text-2xl">🌶️</span>
                        Backoffice Raliz - Configuration requise
                    </CardTitle>
                    <CardDescription>
                        En tant qu'organisateur, vous devez être connecté au réseau Chiliz Spicy Testnet pour créer et gérer vos raffles
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <h3 className="font-semibold text-orange-800 mb-2">🎯 Pourquoi ce réseau est requis :</h3>
                        <ul className="text-sm text-orange-700 space-y-1">
                            <li>• Déploiement des smart contracts de raffles</li>
                            <li>• Gestion des paiements en CHZ</li>
                            <li>• Vérification des fan tokens (PSG, BAR, CITY)</li>
                            <li>• Transparence blockchain pour vos participants</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Button onClick={handleSwitchNetwork} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700">
                                <Zap className="h-4 w-4" />
                                Switcher automatiquement
                            </Button>
                            <span className="text-sm text-muted-foreground">Méthode recommandée</span>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Ou configurez manuellement</span>
                            </div>
                        </div>

                        <div className="bg-muted p-4 rounded-lg space-y-3">
                            <h3 className="font-semibold">Paramètres du réseau Chiliz Spicy Testnet :</h3>
                            <div className="grid grid-cols-1 gap-2 text-sm font-mono">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Nom du réseau:</span>
                                    <span>Chiliz Spicy Testnet</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">RPC URL:</span>
                                    <span>https://spicy-rpc.chiliz.com</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Chain ID:</span>
                                    <span>88882</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Symbole:</span>
                                    <span>CHZ</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Explorateur:</span>
                                    <span>https://testnet.chiliscan.com</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outline"
                                onClick={() => window.open('https://docs.chiliz.com/developers/network-details', '_blank')}
                                className="flex items-center gap-2 border-orange-200 hover:bg-orange-50"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Documentation officielle Chiliz
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.open('https://spicy-faucet.chiliz.com/', '_blank')}
                                className="flex items-center gap-2 border-orange-200 hover:bg-orange-50"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Faucet CHZ (pour les frais de gas)
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 