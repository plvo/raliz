import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    Trophy,
    DollarSign,
    Calendar,
    Target,
    Activity
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Analytics - Raliz Backoffice',
    description: 'View analytics and insights for your raffles',
};

export default function AnalyticsPage() {
    return (
        <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                    <p className="text-muted-foreground">
                        Insights and performance metrics for your raffles.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Last 30 days
                    </Button>
                    <Button variant="outline" size="sm">
                        Export Data
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2,345</div>
                        <div className="flex items-center pt-1">
                            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                            <span className="text-xs text-green-600 font-medium">+8.2%</span>
                            <span className="text-xs text-muted-foreground ml-1">from last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12.6%</div>
                        <div className="flex items-center pt-1">
                            <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                            <span className="text-xs text-red-600 font-medium">-2.1%</span>
                            <span className="text-xs text-muted-foreground ml-1">from last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Raffles</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">15</div>
                        <div className="flex items-center pt-1">
                            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                            <span className="text-xs text-green-600 font-medium">+3</span>
                            <span className="text-xs text-muted-foreground ml-1">from last month</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Analytics Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                    <TabsTrigger value="participants">Participants</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Chart Placeholder */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] flex items-center justify-center bg-muted rounded-lg">
                                    <div className="text-center">
                                        <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-sm text-muted-foreground">Revenue chart would go here</p>
                                        <p className="text-xs text-muted-foreground">Integration with charting library needed</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Participation Chart Placeholder */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Participation Growth</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] flex items-center justify-center bg-muted rounded-lg">
                                    <div className="text-center">
                                        <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-sm text-muted-foreground">Participation chart would go here</p>
                                        <p className="text-xs text-muted-foreground">Integration with charting library needed</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Top Performing Raffles */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Performing Raffles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                            <Trophy className="w-4 h-4 text-yellow-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">PSG vs Barcelona VIP Tickets</p>
                                            <p className="text-sm text-muted-foreground">453 participants</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">4,530 CHZ</p>
                                        <Badge variant="outline" className="bg-green-100 text-green-800">
                                            +15.2%
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                            <Trophy className="w-4 h-4 text-yellow-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Manchester City Training Session</p>
                                            <p className="text-sm text-muted-foreground">298 participants</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">1,490 CHZ</p>
                                        <Badge variant="outline" className="bg-green-100 text-green-800">
                                            +8.7%
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                            <Trophy className="w-4 h-4 text-yellow-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Juventus Stadium Tour</p>
                                            <p className="text-sm text-muted-foreground">187 participants</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">Free</p>
                                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                            High Engagement
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="revenue" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Analytics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
                                <div className="text-center">
                                    <DollarSign className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-lg font-medium text-muted-foreground mb-2">Revenue Analytics</p>
                                    <p className="text-sm text-muted-foreground">Detailed revenue charts and breakdowns</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="participants" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Participant Analytics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
                                <div className="text-center">
                                    <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-lg font-medium text-muted-foreground mb-2">Participant Analytics</p>
                                    <p className="text-sm text-muted-foreground">User engagement and participation metrics</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
                                <div className="text-center">
                                    <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-lg font-medium text-muted-foreground mb-2">Performance Metrics</p>
                                    <p className="text-sm text-muted-foreground">Conversion rates and optimization insights</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 