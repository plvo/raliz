import { RaffleTest } from '@/components/blockchain/raffle-test';
import { FanTokenTest } from '@/components/blockchain/fan-token-test';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Test Blockchain - Raliz',
    description: 'Tests d\'interaction avec le smart contract Raliz sur Chiliz Spicy Testnet'
};

export default function TestBlockchainPage() {
    return (
        <section className="container mx-auto py-8 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Test Blockchain - Raliz</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Interface de test pour interagir avec le smart contract Raliz déployé sur le testnet Chiliz Spicy.
                    Connectez votre wallet MetaMask configuré sur le réseau Chiliz Spicy Testnet.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    🌶️ Chiliz Spicy Testnet (Chain ID: 88882)
                </div>
            </div>

            <div className="grid gap-8">
                <FanTokenTest />
                <RaffleTest />
            </div>

            <div className="bg-muted p-6 rounded-lg space-y-4">
                <h2 className="text-lg font-semibold">Instructions de test:</h2>
                <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                        <span className="font-bold text-primary">1.</span>
                        <div>
                            <strong>Configuration MetaMask:</strong>
                            <ul className="mt-1 ml-4 space-y-1 list-disc">
                                <li>Réseau: Chiliz Spicy Testnet</li>
                                <li>RPC URL: https://spicy-rpc.chiliz.com</li>
                                <li>Chain ID: 88882</li>
                                <li>Symbole: CHZ</li>
                                <li>Explorer: https://testnet.chiliscan.com</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <span className="font-bold text-primary">2.</span>
                        <div>
                            <strong>Obtenez des CHZ de test:</strong>
                            <p className="mt-1">Utilisez un faucet Chiliz pour obtenir des CHZ de test pour payer les frais de gas.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <span className="font-bold text-primary">3.</span>
                        <div>
                            <strong>Vérifiez vos fan tokens:</strong>
                            <p className="mt-1">Utilisez le composant "Test des Fan Tokens" pour vérifier vos balances PSG, BAR, et CITY.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <span className="font-bold text-primary">4.</span>
                        <div>
                            <strong>Explorez les raffles:</strong>
                            <p className="mt-1">Le composant "Test des Raffles Blockchain" vous permet de voir les raffles existantes et de vérifier votre éligibilité.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
} 