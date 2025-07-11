type LoadingIndicatorProps = {
  message?: string;
};

export function LoadingIndicator({ message = 'Chargement...' }: LoadingIndicatorProps) {
  return (
    <div className='flex flex-col items-center justify-center gap-3 h-64'>
      <div className='animate-spin h-6 w-6 border-3 border-primary border-t-transparent rounded-full' />
      <p className='text-muted-foreground'>{message}</p>
    </div>
  );
}
