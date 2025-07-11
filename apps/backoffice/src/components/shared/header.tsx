import { SidebarTrigger } from '@repo/ui/components/sidebar';

export function Header({ title, description }: { title: string; description: string }) {
  return (
    <header className='flex flex-col gap-2'>
      <SidebarTrigger className='z-50' />
      <h1 className='font-["Rochester"]'>{title}</h1>
      <p className='text-sm text-muted-foreground'>{description}</p>
    </header>
  );
}
