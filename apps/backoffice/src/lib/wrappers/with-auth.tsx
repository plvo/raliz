'use client';

import { useUser } from '@/lib/providers/user-provider';
import { Button } from '@repo/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Wallet, AlertCircle } from 'lucide-react';
import { useWeb3Auth } from '@web3auth/modal/react';

interface AuthWrapperProps {
    children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
    const { user, isConnected, walletAddress } = useUser();
    const { web3Auth } = useWeb3Auth();

    // If wallet is not connected, show connection prompt
    if (!isConnected || !walletAddress) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wallet className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
                        <p className="text-muted-foreground">
                            Please connect your wallet to access the Raliz backoffice.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={() => web3Auth?.connect()}
                            className="w-full"
                            size="lg"
                        >
                            <Wallet className="w-5 h-5 mr-2" />
                            Connect Wallet
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                            You need to connect your wallet to manage raffles and access organizer features.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // If wallet is connected but user/organizer not found
    if (isConnected && walletAddress && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl">Organizer Not Found</CardTitle>
                        <p className="text-muted-foreground">
                            Your wallet is not registered as an organizer in our system.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium mb-1">Connected Wallet:</p>
                            <p className="text-xs font-mono text-muted-foreground break-all">
                                {walletAddress}
                            </p>
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                            Please contact an administrator to register your wallet as an organizer.
                        </p>
                        <Button
                            onClick={() => web3Auth?.logout()}
                            variant="outline"
                            className="w-full"
                        >
                            Disconnect Wallet
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // If everything is good, render the protected content
    return <>{children}</>;
} 