import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import {
    Trophy,
    Search,
    Filter,
    Calendar,
    DollarSign,
    Gift,
    Users,
    Award
} from 'lucide-react';
import { format } from 'date-fns';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Winners - Raliz Backoffice',
    description: 'Manage all winners across your raffles',
};

export default function WinnersPage() {
    // This would normally fetch real data from the database
    const mockWinners = [
        {
            id: '1',
            user: {
                username: 'john_doe',
                email: 'john@example.com',
                walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
            },
            raffle: {
                title: 'PSG vs Barcelona VIP Tickets',
                prizeDescription: '2 VIP tickets for PSG vs Barcelona match',
                winnerPosition: 1,
                wonAt: new Date('2024-01-15T18:00:00'),
                prizeDelivered: true,
            },
        },
        {
            id: '2',
            user: {
                username: 'alice_smith',
                email: 'alice@example.com',
                walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
            },
            raffle: {
                title: 'Manchester City Training Session',
                prizeDescription: 'Exclusive training session with Manchester City players',
                winnerPosition: 1,
                wonAt: new Date('2024-01-14T20:30:00'),
                prizeDelivered: false,
            },
        },
        {
            id: '3',
            user: {
                username: 'bob_wilson',
                email: 'bob@example.com',
                walletAddress: '0x9876543210fedcba9876543210fedcba98765432',
            },
            raffle: {
                title: 'Juventus Stadium Tour',
                prizeDescription: 'Private stadium tour and meet & greet',
                winnerPosition: 2,
                wonAt: new Date('2024-01-13T16:45:00'),
                prizeDelivered: true,
            },
        },
    ];

    return (
        <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Winners</h1>
                    <p className="text-muted-foreground">
                        View and manage all winners across your raffles.
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Winners</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">156</div>
                        <p className="text-xs text-muted-foreground">
                            Across all raffles
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Prizes Delivered</CardTitle>
                        <Gift className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">142</div>
                        <p className="text-xs text-muted-foreground">
                            91% delivery rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Delivery</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">14</div>
                        <p className="text-xs text-muted-foreground">
                            Need attention
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12.6%</div>
                        <p className="text-xs text-muted-foreground">
                            Average across raffles
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
                                placeholder="Search by username, email, or raffle title..."
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

            {/* Winners List */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Winners</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {mockWinners.map((winner) => (
                            <div key={winner.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                                        <Trophy className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{winner.user.username}</p>
                                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                                {winner.raffle.winnerPosition === 1 ? '1st Place' : `${winner.raffle.winnerPosition}${winner.raffle.winnerPosition === 2 ? 'nd' : winner.raffle.winnerPosition === 3 ? 'rd' : 'th'} Place`}
                                            </Badge>
                                            {winner.raffle.prizeDelivered ? (
                                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                                    <Gift className="w-3 h-3 mr-1" />
                                                    Delivered
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-red-100 text-red-800">
                                                    <Award className="w-3 h-3 mr-1" />
                                                    Pending
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{winner.user.email}</p>
                                        <p className="text-xs text-muted-foreground font-mono">
                                            {winner.user.walletAddress.slice(0, 8)}...{winner.user.walletAddress.slice(-8)}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right max-w-md">
                                    <p className="font-medium">{winner.raffle.title}</p>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {winner.raffle.prizeDescription}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>{format(winner.raffle.wonAt, 'MMM dd, yyyy')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Prize Delivery Management */}
            <Card>
                <CardHeader>
                    <CardTitle>Prize Delivery Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center gap-3">
                                <Award className="w-8 h-8 text-red-600" />
                                <div>
                                    <p className="font-medium text-red-800">Pending Prize Deliveries</p>
                                    <p className="text-sm text-red-600">14 winners are waiting for their prizes</p>
                                </div>
                            </div>
                            <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-100">
                                Manage Deliveries
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-3">
                                <Gift className="w-8 h-8 text-green-600" />
                                <div>
                                    <p className="font-medium text-green-800">Delivered This Week</p>
                                    <p className="text-sm text-green-600">8 prizes successfully delivered</p>
                                </div>
                            </div>
                            <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-100">
                                View Details
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 