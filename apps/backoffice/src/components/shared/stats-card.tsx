import { type LucideIcon } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card';

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string;
    };
    className?: string;
}

export function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className
}: StatsCardProps) {
    return (
        <Card className={cn('', className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
                {trend && (
                    <div className="flex items-center pt-1">
                        <span
                            className={cn(
                                "text-xs font-medium",
                                trend.value > 0 ? "text-green-600" : "text-red-600"
                            )}
                        >
                            {trend.value > 0 ? '+' : ''}{trend.value}%
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                            {trend.label}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 