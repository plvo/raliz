import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import {
    Users,
    Search,
    Filter,
    Trophy,
    Calendar,
    DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Participants - Raliz Backoffice',
    description: 'Manage all participants across your raffles',
};

export default function ParticipantsPage() {
    // This would normally fetch real data from the database
    const mockParticipants = [
        {
            id: '1',
            user: {
                username: 'john_doe',
                email: 'john@example.com',
                walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
            },
            participation: {
                raffleTitle: 'PSG vs Barcelona VIP Tickets',
                amountPaid: '10',
                participatedAt: new Date('2024-01-15T10:30:00'),
                isWinner: true,
            },
        },
        {
            id: '2',
            user: {
                username: 'alice_smith',
                email: 'alice@example.com',
                walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
            },
            participation: {
                raffleTitle: 'Manchester City Training Session',
                amountPaid: '5',
                participatedAt: new Date('2024-01-14T14:20:00'),
                isWinner: false,
            },
        },
        {
            id: '3',
            user: {
                username: 'bob_wilson',
                email: 'bob@example.com',
                walletAddress: '0x9876543210fedcba9876543210fedcba98765432',
            },
            participation: {
                raffleTitle: 'Juventus Stadium Tour',
                amountPaid: '0',
                participatedAt: new Date('2024-01-13T09:15:00'),
                isWinner: false,
            },
        },
    ];

    return (
        <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Participants</h1>
                    <p className="text-muted-foreground">
                        View and manage all participants across your raffles.
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,234</div>
                        <p className="text-xs text-muted-foreground">
                            +20% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">892</div>
                        <p className="text-xs text-muted-foreground">
                            +15% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Winners</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">156</div>
                        <p className="text-xs text-muted-foreground">
                            12.6% win rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Team Collection</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45,678 CHZ</div>
                        <p className="text-xs text-muted-foreground">
                            +12.5% from last month
                        </p>
                        <p className="text-xs text-amber-600 mt-2">
                            ⚠️ Goes to common pool - TOP 3 teams qualify
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter */}
            <Card>
                <CardHeader>
                    <CardTitle>Search & Filter</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by username, email, or wallet address..."
                                className="pl-10"
                            />
                        </div>
                        <Button variant="outline">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Participants List */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Participants</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {mockParticipants.map((participant) => (
                            <div key={participant.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Users className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{participant.user.username}</p>
                                            {participant.participation.isWinner && (
                                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                                    <Trophy className="w-3 h-3 mr-1" />
                                                    Winner
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{participant.user.email}</p>
                                        <p className="text-xs text-muted-foreground font-mono">
                                            {participant.user.walletAddress.slice(0, 8)}...{participant.user.walletAddress.slice(-8)}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="font-medium">{participant.participation.raffleTitle}</p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="w-3 h-3" />
                                            <span>{participant.participation.amountPaid === '0' ? 'Free' : `${participant.participation.amountPaid} CHZ`}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>{format(participant.participation.participatedAt, 'MMM dd, yyyy')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 