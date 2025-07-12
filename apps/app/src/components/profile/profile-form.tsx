'use client';

import { type UpdateProfileInput, updateUserProfile } from '@/actions/user/update';
import { useActionMutation } from '@/hooks/use-action';
import { useUser } from '@/lib/providers/user-provider';
import type { OrgWithoutWallet } from '@/types/database';
import { zodResolver } from '@hookform/resolvers/zod';
import type { User } from '@repo/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Form } from '@repo/ui/components/form';
import { InputField } from '@repo/ui/components/shuip/input-field';
import { SubmitButton } from '@repo/ui/components/shuip/submit-button';
import { Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const profileFormSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  firstName: z.string().max(100, 'First name must be less than 100 characters').optional().or(z.literal('')),
  lastName: z.string().max(100, 'Last name must be less than 100 characters').optional().or(z.literal('')),
  phone: z.string().max(20, 'Phone must be less than 20 characters').optional().or(z.literal('')),
  favoriteOrganizerId: z.string().optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  user: User;
  organizers: OrgWithoutWallet[];
}

export function ProfileForm({ user, organizers }: ProfileFormProps) {
  const { walletAddress } = useUser();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user.username || '',
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      favoriteOrganizerId: user.favoriteOrganizerId || '',
    },
  });

  const { mutate: updateProfile, isPending } = useActionMutation({
    actionFn: (data: UpdateProfileInput) => updateUserProfile(user.id, data),
    invalidateQueries: [['user', walletAddress || '']],
    successEvent: {
      toast: {
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated',
      },
    },
    errorEvent: {
      toast: {
        title: 'Update Failed',
        description: 'Failed to update your profile. Please try again.',
      },
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfile(data);
  };

  return (
    <Card className='h-fit'>
      <CardHeader className='space-y-1'>
        <CardTitle className='flex items-center gap-2'>
          <Edit className='h-5 w-5' />
          Edit Profile
        </CardTitle>
        <CardDescription>Update your personal information and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <InputField register={form.register('username')} label='Username' placeholder='Enter your username' />

            <InputField
              register={form.register('email')}
              label='Email'
              type='email'
              placeholder='Enter your email address'
            />

            <div className='grid grid-cols-2 gap-4'>
              <InputField
                register={form.register('firstName')}
                label='First Name'
                placeholder='Enter your first name'
              />

              <InputField register={form.register('lastName')} label='Last Name' placeholder='Enter your last name' />
            </div>

            <InputField register={form.register('phone')} label='Phone Number' placeholder='Enter your phone number' />

            <div className='pt-4'>
              <SubmitButton loading={isPending}>Update Profile</SubmitButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
