'use client';

import { RaffleCard } from '@/components/raffles/raffle-card';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Badge } from '@repo/ui/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import {
    Plus,
    Search,
    Filter,
    Ticket
} from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/lib/providers/user-provider';
import { useActionQuery } from '@/hooks/use-action';
import { getOrganizerRaffles } from '@/actions/raffle/get';
import CreateRaffleModal from '@/components/raffles/create-raffle-modal';

export default function RafflesPage() {
    const { user } = useUser();

    if (!user) {
        return <div>No user</div>;
    }

    // Get all raffles
    const { data: allRaffles = [], isLoading: isLoadingAllRaffles, isError: isErrorAllRaffles, refetch: refetchAllRaffles} = useActionQuery({
        actionFn: () => user ? getOrganizerRaffles(user) : Promise.resolve({ ok: false, message: 'No user' }),
        queryKey: user ? ['organizer-raffles', user.id] : [''],
    });


    // const allRafflesList = Array.isArray(allRaffles) ? allRaffles : [];
    // const activeRafflesList = Array.isArray(activeRaffles) ? activeRaffles : [];
    // const draftRafflesList = Array.isArray(draftRaffles) ? draftRaffles : [];
    // const endedRafflesList = Array.isArray(endedRaffles) ? endedRaffles : [];

    const activeRaffles = allRaffles.filter((raffle) => raffle.status === 'ACTIVE');
    const draftRaffles = allRaffles.filter((raffle) => raffle.status === 'DRAFT');
    const endedRaffles = allRaffles.filter((raffle) => raffle.status === 'ENDED');

    if (isLoadingAllRaffles) {
        return <div>Loading...</div>;
    }

    if (isErrorAllRaffles) {
        return <div>Error fetching raffles</div>;
    }

    if (allRaffles.length === 0) {
        return <div>No raffles found</div>;
    }

    return (
        <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Raffles</h1>
                    <p className="text-muted-foreground">
                        Manage all your raffles, from drafts to completed draws.
                    </p>
                </div>
                {/* <Button asChild>
                    <Link href="/raffles/create">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Raffle
                    </Link>
                </Button> */}
                <CreateRaffleModal onSuccess={() => {
                    // Refresh the raffles list
                    refetchAllRaffles();
                }}/>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Raffles</CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allRaffles.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                            {activeRaffles.length}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{activeRaffles.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Draft</CardTitle>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                            {draftRaffles.length}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{draftRaffles.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ended</CardTitle>
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                            {endedRaffles.length}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-600">{endedRaffles.length}</div>
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
                                placeholder="Search raffles..."
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

            {/* Raffles Tabs */}
            <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="all">All Raffles ({allRaffles.length})</TabsTrigger>
                    <TabsTrigger value="active">Active ({activeRaffles.length})</TabsTrigger>
                    <TabsTrigger value="draft">Draft ({draftRaffles.length})</TabsTrigger>
                    <TabsTrigger value="ended">Ended ({endedRaffles.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    <RaffleGrid raffles={allRaffles} />
                </TabsContent>

                <TabsContent value="active" className="space-y-4">
                    <RaffleGrid raffles={activeRaffles} />
                </TabsContent>

                <TabsContent value="draft" className="space-y-4">
                    <RaffleGrid raffles={draftRaffles} />
                </TabsContent>

                <TabsContent value="ended" className="space-y-4">
                    <RaffleGrid raffles={endedRaffles} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function RaffleGrid({ raffles }: { raffles: any[] }) {
    if (raffles.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Ticket className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No raffles found</h3>
                    <p className="text-muted-foreground text-center mb-4">
                        There are no raffles matching your current filter.
                    </p>
                    <CreateRaffleModal />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {raffles.map((raffle) => (
                <RaffleCard
                    key={raffle.id}
                    raffle={raffle}
                    participationsCount={0} // This would need to be fetched separately
                    winnersCount={0} // This would need to be fetched separately
                />
            ))}
        </div>
    );
}