'use client';

import { Button } from '@repo/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Wallet, Zap, Shield, CheckCircle } from 'lucide-react';
import { useWeb3Auth } from '@web3auth/modal/react';
import { useUser } from '@/lib/providers/user-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthPage() {
    const { web3Auth } = useWeb3Auth();
    const { isConnected, user, walletAddress } = useUser();
    const router = useRouter();

    // Redirect if already connected and authorized
    useEffect(() => {
        if (isConnected && user) {
            router.push('/');
        }
    }, [isConnected, user, router]);

    const handleConnect = () => {
        web3Auth?.connect();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
            <div className="max-w-md w-full space-y-6">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2">
                        <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-xl">
                            <Zap className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <h1 className="text-3xl font-bold">Raliz</h1>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-muted-foreground">Backoffice</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage your raffles on the blockchain
                        </p>
                    </div>
                </div>

                {/* Connection Status */}
                {isConnected && walletAddress && !user && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Wallet className="w-8 h-8 text-red-600" />
                                <div>
                                    <p className="font-medium text-red-800">Wallet Connected</p>
                                    <p className="text-sm text-red-600">
                                        But you're not registered as an organizer
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 p-3 bg-red-100 rounded-lg">
                                <p className="text-xs font-mono text-red-700 break-all">
                                    {walletAddress}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Auth Card */}
                <Card>
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wallet className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
                        <p className="text-muted-foreground">
                            Access the Raliz organizer dashboard by connecting your authorized wallet
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Features */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-sm">Create and manage raffles</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-sm">Blockchain integration</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-sm">Fan token rewards</span>
                            </div>
                        </div>

                        {/* Connect Button */}
                        <Button
                            onClick={handleConnect}
                            className="w-full"
                            size="lg"
                            disabled={isConnected && !user}
                        >
                            <Wallet className="w-5 h-5 mr-2" />
                            {isConnected && !user ? 'Not Authorized' : 'Connect Wallet'}
                        </Button>

                        {/* Network Info */}
                        <div className="text-center">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                <Shield className="w-3 h-3 mr-1" />
                                Chiliz Network
                            </Badge>
                        </div>

                        {/* Help Text */}
                        <div className="text-center space-y-2">
                            <p className="text-xs text-muted-foreground">
                                Only authorized organizers can access this dashboard
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Need access? Contact your administrator
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                        Powered by Web3Auth & Chiliz Chain
                    </p>
                </div>
            </div>
        </div>
    );
} 