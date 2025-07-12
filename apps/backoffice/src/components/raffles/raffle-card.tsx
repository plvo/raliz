import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Calendar, Users, Trophy, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Raffle } from '@repo/db';
import Link from 'next/link';

interface RaffleCardProps {
    raffle: Raffle;
    participationsCount?: number;
    winnersCount?: number;
    onEdit?: (raffle: Raffle) => void;
    onDelete?: (raffle: Raffle) => void;
}

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

export function RaffleCard({
    raffle,
    participationsCount = 0,
    winnersCount = 0,
    onEdit,
    onDelete,
}: RaffleCardProps) {
    const isActive = raffle.status === 'ACTIVE';
    const isEnded = raffle.status === 'ENDED';
    const isDraft = raffle.status === 'DRAFT';

    return (
        <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg font-semibold line-clamp-1">
                            {raffle.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {raffle.description}
                        </p>
                    </div>
                    <Badge
                        variant="outline"
                        className={getStatusColor(raffle.status)}
                    >
                        {raffle.status}
                    </Badge>
                </div>
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

                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                            {format(new Date(raffle.startDate), 'MMM dd, yyyy')} - {format(new Date(raffle.endDate), 'MMM dd, yyyy')}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{participationsCount} participants</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <Trophy className="w-4 h-4 text-muted-foreground" />
                            <span>{winnersCount}/{raffle.maxWinners} winners</span>
                        </div>
                    </div>

                    <div className="text-sm">
                        <span className="font-medium">Prize: </span>
                        <span className="text-muted-foreground line-clamp-1">
                            {raffle.prizeDescription}
                        </span>
                    </div>

                    {raffle.participationPrice !== '0' && (
                        <div className="text-sm">
                            <span className="font-medium">Price: </span>
                            <span className="text-muted-foreground">
                                {raffle.participationPrice} CHZ
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link href={`/raffles/${raffle.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                        </Link>
                    </Button>

                    {onEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(raffle)}
                            disabled={isEnded}
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                    )}

                    {onDelete && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(raffle)}
                            disabled={isActive || isEnded}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 