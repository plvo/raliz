import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { Badge } from '@repo/ui/components/badge';
import { Separator } from '@repo/ui/components/separator';
import {
    ArrowLeft,
    Calendar,
    Users,
    Trophy,
    DollarSign,
    Edit,
    Play,
    Pause,
    Settings,
    Eye,
    Award
} from 'lucide-react';
import Link from 'next/link';
import { getRaffleById, getRaffleParticipants } from '@/actions/raffle/get';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import type { Metadata } from 'next';

interface RaffleDetailPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: RaffleDetailPageProps): Promise<Metadata> {
    const { id } = await params;

    const result = await getRaffleById(id);

    if (!result.ok) {
        return {
            title: 'Raffle Not Found - Raliz Backoffice',
        };
    }

    return {
        title: `${result.data.raffle.title} - Raliz Backoffice`,
        description: result.data.raffle.description,
    };
}

export default async function RaffleDetailPage({ params }: RaffleDetailPageProps) {
    const { id } = await params;

    const result = await getRaffleById(id);

    if (!result.ok) {
        notFound();
    }

    const { raffle, organizer, participationsCount, winnersCount } = result.data;

    // Get participants
    const participantsResult = await getRaffleParticipants(id);
    const participants = participantsResult.ok ? participantsResult.data : [];

    const isActive = raffle.status === 'ACTIVE';
    const isEnded = raffle.status === 'ENDED';
    const isDraft = raffle.status === 'DRAFT';

    function getStatusColor(status: string) {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'ENDED':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'DRAFT':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    }

    return (
        <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/raffles">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Raffles
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">{raffle.title}</h1>
                            <Badge variant="outline" className={getStatusColor(raffle.status)}>
                                {raffle.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            Created on {format(new Date(raffle.createdAt), 'MMMM dd, yyyy')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {!isEnded && (
                        <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    )}
                    <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                    </Button>
                    {isActive && (
                        <Button variant="outline" size="sm">
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                        </Button>
                    )}
                    {isDraft && (
                        <Button size="sm">
                            <Play className="w-4 h-4 mr-2" />
                            Activate
                        </Button>
                    )}
                    {isEnded && winnersCount === 0 && (
                        <Button size="sm">
                            <Award className="w-4 h-4 mr-2" />
                            Draw Winners
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Participants</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{participationsCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {raffle.maxParticipants ? `of ${raffle.maxParticipants} max` : 'No limit'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Winners</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{winnersCount}</div>
                        <p className="text-xs text-muted-foreground">
                            of {raffle.maxWinners} max
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Entry Price</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {raffle.participationPrice === '0' ? 'Free' : `${raffle.participationPrice} CHZ`}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Duration</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Math.ceil((new Date(raffle.endDate).getTime() - new Date(raffle.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Raffle Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Raffle Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {raffle.imageUrl && (
                            <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                                <img
                                    src={raffle.imageUrl}
                                    alt={raffle.title}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        )}

                        <div>
                            <h4 className="font-semibold mb-2">Description</h4>
                            <p className="text-sm text-muted-foreground">{raffle.description}</p>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-2">Prize</h4>
                            <p className="text-sm text-muted-foreground">{raffle.prizeDescription}</p>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold mb-1">Start Date</h4>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(raffle.startDate), 'MMM dd, yyyy HH:mm')}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">End Date</h4>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(raffle.endDate), 'MMM dd, yyyy HH:mm')}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Organizer Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Organizer</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            {organizer.logoUrl && (
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
                                    <img
                                        src={organizer.logoUrl}
                                        alt={organizer.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div>
                                <h4 className="font-semibold">{organizer.name}</h4>
                                {organizer.email && (
                                    <p className="text-sm text-muted-foreground">{organizer.email}</p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-2">Wallet Address</h4>
                            <p className="text-sm text-muted-foreground font-mono break-all">
                                {organizer.walletAddress}
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Fan Token</h4>
                            <p className="text-sm text-muted-foreground font-mono break-all">
                                {organizer.fanTokenAddress}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Participants */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Participants ({participationsCount})</CardTitle>
                    <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View All
                    </Button>
                </CardHeader>
                <CardContent>
                    {participants.length > 0 ? (
                        <div className="space-y-4">
                            {participants.slice(0, 10).map((participant) => (
                                <div key={participant.participation.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Users className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {participant.user.username || 'Anonymous'}
                                            </p>
                                            <p className="text-sm text-muted-foreground font-mono">
                                                {participant.participation.walletAddress.slice(0, 8)}...{participant.participation.walletAddress.slice(-8)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{participant.participation.amountPaid} CHZ</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(participant.participation.participatedAt), 'MMM dd, HH:mm')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {participants.length > 10 && (
                                <div className="text-center">
                                    <Button variant="outline" size="sm">
                                        View {participants.length - 10} more participants
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No participants yet</h3>
                            <p className="text-muted-foreground">
                                Participants will appear here once they join the raffle.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 