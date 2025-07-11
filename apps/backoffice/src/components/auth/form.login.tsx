'use client';

import { authClient } from '@/lib/auth-client';
import { type Login, loginSchema } from '@/schemas/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Form } from '@repo/ui/components/form';
import { ButtonSubmit } from '@repo/ui/components/shuip/button.submit';
import InputField from '@repo/ui/components/shuip/input.form-field';
import { useRouter } from 'next/navigation';
import { useShextForm } from 'shext';
import { toast } from 'sonner';

export default function LoginForm() {
  const router = useRouter();
  const { form, control, handleSubmit, formState } = useShextForm({ zodSchema: loginSchema });

  const onSubmit = async (values: Login) => {
    try {
      const { data, error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      console.log({data, error});

      if (error) {
        toast.error("Erreur lors de la connexion", {
          description: error.message ||  "L'authentification a échoué",
        });
        return;
      }

      toast.success('Connexion réussie', {
        description: "Redirection vers l'espace de travail...",
      });

      form.reset();
      router.push('/cycles-subjects');
    } catch (err) {
      toast.error('Erreur lors de la connexion', {
        description: err instanceof Error ? err.message : 'Une erreur est survenue',
      });
    }
  };

  return (
    <Form {...form}>
      <Card className='w-full md:w-[600px]'>
        <form onSubmit={handleSubmit(onSubmit as any)}>
          <CardHeader>
            <CardTitle className='text-2xl md:text-3xl'>Connexion</CardTitle>
            <CardDescription className='text-left'>Connectez-vous à votre compte pour continuer</CardDescription>
          </CardHeader>

          <CardContent className='space-y-6'>
            <InputField
              control={control}
              name='email'
              label='Email'
              placeholder='Votre email'
              type='email'
              autoComplete='email'
            />
            <InputField
              control={control}
              name='password'
              label='Mot de passe'
              placeholder='Votre mot de passe'
              type='password'
              autoComplete='current-password'
            />
          </CardContent>

          <CardFooter className='flex flex-col space-y-4'>
            <ButtonSubmit label='Se connecter' disabled={!formState.isDirty} loading={formState.isSubmitting} />
          </CardFooter>
        </form>
      </Card>
    </Form>
  );
}
