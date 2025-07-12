'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@repo/ui/components/button';
import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import BlockchainService from '@/services/blockchain.service';
import { CONTRACT_ADDRESSES, RPC_CONFIG } from '@/lib/web3-config';
import { ethers } from 'ethers';

interface TokenBalance {
    address: string;
    name: string;
    symbol: string;
    balance: bigint;
    decimals: number;
    formatted: string;
}

export function FanTokenTest() {
    const { address, isConnected } = useAccount();
    const [loading, setLoading] = useState(false);
    const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);

    const fanTokens = [
        { name: 'Paris Saint-Germain', symbol: 'PSG', address: CONTRACT_ADDRESSES.PSG_TOKEN },
        { name: 'FC Barcelona', symbol: 'BAR', address: CONTRACT_ADDRESSES.BAR_TOKEN },
        { name: 'Manchester City', symbol: 'CITY', address: CONTRACT_ADDRESSES.CITY_TOKEN },
    ];

    // ✅ Création correcte d'une instance du service
    const createBlockchainService = () => {
        const provider = new ethers.JsonRpcProvider(RPC_CONFIG.url);
        // Pour les opérations de lecture seule, on peut utiliser le provider sans signer
        const dummySigner = ethers.Wallet.createRandom().connect(provider);
        return new BlockchainService(provider, dummySigner);
    };

    const checkTokenBalances = async () => {
        if (!isConnected || !address) return;

        setLoading(true);
        try {
            // ✅ Instanciation du service
            const blockchainService = createBlockchainService();
            const balances: TokenBalance[] = [];

            for (const token of fanTokens) {
                try {
                    if (token.address) {
                        const tokenData = await blockchainService.getFanTokenBalance(address, token.address);
                        balances.push({
                            address: token.address,
                            name: token.name,
                            symbol: tokenData.symbol,
                            balance: tokenData.balance,
                            decimals: tokenData.decimals,
                            formatted: blockchainService.formatTokens(tokenData.balance, tokenData.decimals, 2)
                        });
                    } else {
                        console.warn(`No address configured for ${token.symbol}`);
                    }
                } catch (error) {
                    console.error(`Error checking balance for ${token.symbol}:`, error);
                    balances.push({
                        address: token.address || '',
                        name: token.name,
                        symbol: token.symbol,
                        balance: 0n,
                        decimals: 18,
                        formatted: 'Error'
                    });
                }
            }

            setTokenBalances(balances);
        } catch (error) {
            console.error('Error checking token balances:', error);
        }
        setLoading(false);
    };

    if (!isConnected) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Test des Fan Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Veuillez connecter votre wallet pour vérifier vos balances de fan tokens.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Test des Fan Tokens</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Connecté avec: {address}
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button onClick={checkTokenBalances} disabled={loading}>
                    {loading ? 'Vérification...' : 'Vérifier les Balances'}
                </Button>

                {tokenBalances.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="font-medium">Vos balances de Fan Tokens:</h3>
                        <div className="grid gap-3">
                            {tokenBalances.map((token) => (
                                <div key={token.address} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-bold">{token.symbol}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium">{token.name}</p>
                                            <p className="text-sm text-muted-foreground">{token.symbol}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono">{token.formatted}</p>
                                        <Badge variant={Number(token.balance) >= 50 ? "default" : "secondary"}>
                                            {Number(token.balance) >= 50 ? "✅ Éligible" : "❌ Insuffisant"}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                <strong>Note:</strong> Vous devez posséder au minimum 50 tokens du fan token requis pour participer à une raffle.
                            </p>
                        </div>
                    </div>
                )}

                {tokenBalances.length === 0 && !loading && (
                    <p className="text-muted-foreground text-center">
                        Cliquez sur "Vérifier les Balances" pour voir vos fan tokens.
                    </p>
                )}

                <div className="mt-6 space-y-2">
                    <h4 className="font-medium">Adresses des contrats (Chiliz Spicy Testnet):</h4>
                    <div className="text-xs text-muted-foreground space-y-1">
                        {fanTokens.map((token) => (
                            <div key={token.symbol} className="flex justify-between">
                                <span>{token.symbol}:</span>
                                <code className="bg-muted px-1 rounded">
                                    {token.address || 'Non configuré'}
                                </code>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 