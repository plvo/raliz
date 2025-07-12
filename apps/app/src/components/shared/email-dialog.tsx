'use client';

import { addEmail } from '@/actions/auth/email';
import { useActionMutation } from '@/hooks/use-action';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/components/dialog';
import { Form } from '@repo/ui/components/form';
import { InputField } from '@repo/ui/components/shuip/input-field';
import { SubmitButton } from '@repo/ui/components/shuip/submit-button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface EmailDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  walletAddress: `0x${string}` | undefined;
}

const addEmailSchema = z.object({
  email: z.string().email(),
});

export function AddEmailDialog({ open, setOpen, walletAddress }: EmailDialogProps) {
  const form = useForm<z.infer<typeof addEmailSchema>>({
    resolver: zodResolver(addEmailSchema),
    defaultValues: {
      email: '',
    },
  });

  const { mutate: addEmailMutation, isPending } = useActionMutation({
    actionFn: async (data: z.infer<typeof addEmailSchema>) => {
      if (!walletAddress) throw new Error('Wallet address is required');
      await addEmail(data.email, walletAddress);
      return { ok: true, data: data.email };
    },
    successEvent: {
      toast: {
        title: 'Success',
        description: 'Email added successfully',
      },
      fn: () => setOpen(false),
    },
    errorEvent: {
      toast: {
        title: 'Error',
        description: 'Failed to add email',
      },
    },
  });

  const onSubmit = (data: z.infer<typeof addEmailSchema>) => {
    addEmailMutation(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <DialogHeader>
              <DialogTitle>Add Email</DialogTitle>
            </DialogHeader>

            <div className='flex flex-col gap-2 items-center justify-center py-4'>
              <h2 className='text-lg font-semibold'>Welcome to Raliz! 🧨</h2>
              <p className='text-sm text-muted-foreground'>
                We're excited to have you on board. Please add your email to continue.
              </p>
            </div>

            <InputField type='email' register={form.register('email')} label='Email' placeholder='Email' />

            <DialogFooter>
              <SubmitButton loading={isPending}>Submit</SubmitButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
