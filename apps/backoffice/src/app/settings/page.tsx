import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Textarea } from '@repo/ui/components/textarea';
import { Separator } from '@repo/ui/components/separator';
import { Switch } from '@repo/ui/components/switch';
import {
    Settings,
    User,
    Wallet,
    Bell,
    Shield,
    Palette,
    Globe,
    Save,
    Upload,
    AlertTriangle
} from 'lucide-react';
import type { Metadata } from 'next';
import { CardDescription } from '@repo/ui/components/card';

export const metadata: Metadata = {
    title: 'Settings - Raliz Backoffice',
    description: 'Manage your organizer profile and system settings',
};

export default function SettingsPage() {
    return (
        <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your organizer profile and system preferences.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Profile Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="organizerName">Organization Name</Label>
                            <Input
                                id="organizerName"
                                placeholder="Enter your organization name"
                                defaultValue="Paris Saint-Germain"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                defaultValue="admin@psg.fr"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Tell us about your organization"
                                defaultValue="Official Paris Saint-Germain Football Club - Creating exclusive experiences for our fans worldwide."
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                placeholder="https://your-website.com"
                                defaultValue="https://psg.fr"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Logo</Label>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                                    <User className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <Button variant="outline" size="sm">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Logo
                                </Button>
                            </div>
                        </div>

                        <Button className="w-full">
                            <Save className="w-4 h-4 mr-2" />
                            Save Profile Changes
                        </Button>
                    </CardContent>
                </Card>

                {/* Wallet Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="w-5 h-5" />
                            Wallet & Blockchain
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="walletAddress">Wallet Address</Label>
                            <Input
                                id="walletAddress"
                                placeholder="0x..."
                                defaultValue="0x1234567890abcdef1234567890abcdef12345678"
                                className="font-mono text-sm"
                                readOnly
                            />
                            <p className="text-xs text-muted-foreground">
                                This is your connected wallet address
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fanTokenAddress">Fan Token Address</Label>
                            <Input
                                id="fanTokenAddress"
                                placeholder="0x..."
                                defaultValue="0xabcdef1234567890abcdef1234567890abcdef12"
                                className="font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                                Your fan token contract address
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="minimumTokens">Minimum Fan Tokens Required</Label>
                            <Input
                                id="minimumTokens"
                                type="number"
                                placeholder="50"
                                defaultValue="50"
                            />
                            <p className="text-xs text-muted-foreground">
                                Minimum tokens users need to participate
                            </p>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h4 className="font-medium">Blockchain Settings</h4>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Auto-confirm transactions</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically confirm blockchain transactions
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Gas optimization</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Optimize gas fees for transactions
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Roles & Responsibilities */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                            Roles & Responsibilities
                        </CardTitle>
                        <CardDescription>
                            Understanding your role as an organizer
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 rounded-lg">
                                <h4 className="font-medium text-green-900 mb-2">✅ What you CAN do:</h4>
                                <ul className="text-sm text-green-800 space-y-1">
                                    <li>• Create and manage raffles</li>
                                    <li>• Set participation prices and requirements</li>
                                    <li>• Draw winners and contact them</li>
                                    <li>• View participants and statistics</li>
                                    <li>• Compete for TOP 3 ranking to benefit your participants</li>
                                </ul>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-lg">
                                <h4 className="font-medium text-amber-900 mb-2">⚠️ What you CANNOT do:</h4>
                                <ul className="text-sm text-amber-800 space-y-1">
                                    <li>• Withdraw CHZ funds from the common pool</li>
                                    <li>• Access the smart contract funds directly</li>
                                    <li>• Modify platform fees or financial settings</li>
                                </ul>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">💡 How the competitive pool works:</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• All CHZ payments go to a common pool in the smart contract</li>
                                    <li>• Teams are ranked by total CHZ collected across their raffles</li>
                                    <li>• Only participants of TOP 3 teams receive redistribution</li>
                                    <li>• The super admin manages pool withdrawal and redistribution</li>
                                    <li>• Platform fees (2.5%) are automatically deducted</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5" />
                            Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Email notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive notifications via email
                                </p>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>New participants</Label>
                                <p className="text-sm text-muted-foreground">
                                    Notify when someone joins a raffle
                                </p>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Raffle ended</Label>
                                <p className="text-sm text-muted-foreground">
                                    Notify when raffles end
                                </p>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Winner selection</Label>
                                <p className="text-sm text-muted-foreground">
                                    Notify when winners are selected
                                </p>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>System updates</Label>
                                <p className="text-sm text-muted-foreground">
                                    Important system notifications
                                </p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Security & Privacy
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Two-factor authentication</Label>
                                <p className="text-sm text-muted-foreground">
                                    Add an extra layer of security
                                </p>
                            </div>
                            <Switch />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Session timeout</Label>
                                <p className="text-sm text-muted-foreground">
                                    Auto-logout after inactivity
                                </p>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Privacy mode</Label>
                                <p className="text-sm text-muted-foreground">
                                    Hide sensitive information
                                </p>
                            </div>
                            <Switch />
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Button variant="outline" className="w-full">
                                Change Password
                            </Button>
                            <Button variant="outline" className="w-full">
                                Download Account Data
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* System Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        System Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Version</Label>
                            <p className="text-sm text-muted-foreground">v1.0.0</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Network</Label>
                            <p className="text-sm text-muted-foreground">Chiliz Chain</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Contract</Label>
                            <p className="text-sm text-muted-foreground font-mono">0xabc...def</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 