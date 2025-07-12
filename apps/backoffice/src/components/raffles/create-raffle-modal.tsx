'use client';

import { createRaffleSchema, type CreateRaffleInput } from '@/schemas/raffle';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import { Form, FormField, FormItem, FormLabel } from '@repo/ui/components/form';
import { FormControl } from '@repo/ui/components/form';
import { Textarea } from '@repo/ui/components/textarea';
import { FormDescription } from '@repo/ui/components/form';
import { FormMessage } from '@repo/ui/components/form';
import { InputField } from '@repo/ui/components/shuip/input-field';
import { SubmitButton } from '@repo/ui/components/shuip/submit-button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Raffle } from '@repo/db';
import { useUser } from '@/lib/providers/user-provider';
import { useWeb3Auth } from '@web3auth/modal/react';
import { ethers } from 'ethers';
import { 
    BlockchainService, 
    type CreateRaffleParams 
} from '@repo/contracts/src/service/blockchain.service';
import { RPC_CONFIG } from '@repo/contracts';
import { createRaffleInDB, confirmRaffleCreation, deleteRaffleOnBlockchainFailure } from '@/actions/raffle/create';
import { toast } from 'sonner';
import { z } from 'zod';

interface CreateRaffleModalProps {
    onSuccess?: (raffle: Raffle) => void;
}

// Form schema that matches the input format but will be validated by the main schema
const createRaffleFormSchema = z.object({
    title: z.string().min(3, 'The title must contain at least 3 characters').max(255, 'The title cannot exceed 255 characters'),
    description: z.string().min(10, 'The description must contain at least 10 characters').max(1000, 'The description cannot exceed 1000 characters'),
    prizeDescription: z.string().min(5, 'The prize description must contain at least 5 characters').max(500, 'The prize description cannot exceed 500 characters'),
    imageUrl: z.string().url('Invalid image URL').max(500, 'The URL cannot exceed 500 characters').optional(),
    participationPrice: z.string().regex(/^\d+(\.\d{1,8})?$/, 'Invalid participation price (max 8 decimals)'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    maxWinners: z.number().min(1, 'The number of winners must be at least 1'),
    maxParticipants: z.number().min(10, 'The number of participants must be at least 10').optional(),
});

type CreateRaffleFormData = z.infer<typeof createRaffleFormSchema>;

export default function CreateRaffleModal({ onSuccess }: CreateRaffleModalProps) {
    const [open, setOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const { user } = useUser();
    const { web3Auth } = useWeb3Auth();
    
    const form = useForm<CreateRaffleFormData>({
        resolver: zodResolver(createRaffleFormSchema),
        defaultValues: {
            title: '',
            description: '',
            prizeDescription: '',
            imageUrl: '',
            participationPrice: '0',
            maxWinners: 1,
            maxParticipants: 100,
            startDate: new Date(Date.now() + 1000).toISOString().slice(0, 16),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        },
    });

    const onSubmit = async (formData: CreateRaffleFormData) => {
        if (!user) {
            toast.error('User not connected');
            return;
        }

        if (!web3Auth?.provider) {
            toast.error('Wallet not connected');
            return;
        }

        // Ensure user has fanTokenAddress
        if (!user.fanTokenAddress) {
            toast.error('Organizer fan token address not configured');
            return;
        }

        const ethersProvider = new ethers.BrowserProvider(web3Auth.provider);
        const signer = await ethersProvider.getSigner();
        
        const provider = new ethers.JsonRpcProvider(RPC_CONFIG.url);
        const blockchainService = new BlockchainService(provider, signer, process.env.NEXT_PUBLIC_RALIZ_CONTRACT_ADDRESS || null);

        // Transform form data to match the main schema
        const transformedData = {
            ...formData,
            maxWinners: formData.maxWinners.toString(),
            maxParticipants: formData.maxParticipants?.toString() || '1000',
            startDate: formData.startDate, // Keep as string for schema transformation
            endDate: formData.endDate,     // Keep as string for schema transformation
        };

        // Validate with the main schema
        const validationResult = createRaffleSchema.safeParse(transformedData);
        if (!validationResult.success) {
            toast.error('Validation error', {
                description: validationResult.error.errors[0]?.message || 'Invalid data'
            });
            return;
        }

        const data: CreateRaffleInput = validationResult.data;

        setIsCreating(true);
        let draftRaffle: Raffle | null = null;

        try {
            // Step 0: Verify organizer authorization
            toast.info('Verifying authorization...', {
                description: 'Checking organizer permissions'
            });

            const organizerAddress = await signer.getAddress();
            const isAuthorized = await blockchainService.isAuthorizedOrganizer(organizerAddress);
            
            if (!isAuthorized) {
                throw new Error('Organizer not authorized. Please contact an administrator to get authorized.');
            }

            // Step 1: Create the raffle in DB
            toast.info('Creating raffle...', {
                description: 'Step 1/3: Save in database'
            });

            const dbResponse = await createRaffleInDB(data, user);
            if (!dbResponse.ok) {
                throw new Error('Error creating raffle in database');
            }
            draftRaffle = dbResponse.data.raffle;

            // Step 2: Blockchain transaction
            toast.info('Blockchain transaction...', {
                description: 'Step 2/3: Create on-chain'
            });
            
            const blockchainParams: CreateRaffleParams = {
                title: data.title,
                description: data.description,
                participationFee: data.participationPrice,
                requiredFanToken: user.fanTokenAddress,
                minimumFanTokens: '50',
                maxWinners: Number.parseInt(data.maxWinners),
                endDate: data.endDate,
                maxParticipants: Number.parseInt(data.maxParticipants || '1000'),
            };

            const result = await blockchainService.createRaffle(blockchainParams, signer);
            const receipt = await result.transaction.wait();

            if (!receipt || receipt.status !== 1) {
                throw new Error('Blockchain transaction failed');
            }

            // Step 3: Confirm the creation
            toast.info('Finalization...', {
                description: 'Step 3/3: Confirmation of creation'
            });

            const confirmResponse = await confirmRaffleCreation(
                draftRaffle.id,
                receipt.hash,
                receipt.to || undefined
            );

            if (!confirmResponse.ok) {
                throw new Error('Error confirming the creation');
            }

            toast.success('Raffle created', {
                description: 'The raffle is now active on the blockchain'
            });

            onSuccess?.(confirmResponse.data.raffle);
            setOpen(false);
            form.reset();

        } catch (error) {
            // Clean up in case of error
            if (draftRaffle) {
                await deleteRaffleOnBlockchainFailure(draftRaffle.id);
            }

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.error('Error creating raffle', {
                description: errorMessage
            });

            console.error('Error creating raffle:', error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create a raffle
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create a new raffle</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <InputField
                                    register={form.register('title')}
                                    label="Title"
                                    placeholder="Title of the raffle"
                                    description="Title of the raffle (3-255 characters)"
                                    disabled={isCreating}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <InputField
                                    register={form.register('description')}
                                    label="Description"
                                    placeholder="Detailed description of the raffle"
                                    description="Complete description of the raffle (10-1000 characters)"
                                    disabled={isCreating}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <FormField
                                    control={form.control}
                                    name="prizeDescription"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Prize description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe the prize that the winners will receive (5-500 characters)"
                                                    className="resize-none"
                                                    disabled={isCreating}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Describe the prize that the winners will receive (5-500 characters)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <InputField
                                register={form.register('imageUrl')}
                                label="Image URL"
                                placeholder="https://example.com/image.jpg"
                                description="Image URL of the raffle"
                                disabled={isCreating}
                            />

                            <InputField
                                register={form.register('participationPrice')}
                                label="Participation price (CHZ)"
                                placeholder="0.00"
                                description="Participation price (max 8 decimals)"
                                disabled={isCreating}
                            />

                            <InputField
                                register={form.register('startDate')}
                                label="Opening date"
                                type="datetime-local"
                                description="Date and time of the start of the raffle"
                                disabled={isCreating}
                            />

                            <InputField
                                register={form.register('endDate')}
                                label="Closing date"
                                type="datetime-local"
                                description="Date and time of the end of the raffle"
                                disabled={isCreating}
                            />

                            <InputField
                                register={form.register('maxWinners')}
                                label="Number of winners"
                                type="number"
                                placeholder="1"
                                description="Number of winners (1-100)"
                                disabled={isCreating}
                            />

                            <InputField
                                register={form.register('maxParticipants')}
                                label="Maximum number of participants"
                                type="number"
                                placeholder="100"
                                description="Maximum number of participants (optional)"
                                disabled={isCreating}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isCreating}
                            >
                                Cancel
                            </Button>
                            <div className="flex-1">
                                <SubmitButton loading={isCreating} disabled={isCreating}>
                                    {isCreating ? 'Creating...' : 'Create raffle'}
                                </SubmitButton>
                            </div>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 