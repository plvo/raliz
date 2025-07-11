import LoginForm from '@/components/auth/form.login';
import type { Metadata } from 'next';

export const generateMetadata = (): Metadata => {
  return {
    title: 'Connexion',
  };
};

export default function LoginPage() {
  return (
    <section className='flex items-center justify-center h-[90vh]'>
      <LoginForm />
    </section>
  );
}
