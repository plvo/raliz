import { CHILIZ_SPICY_TESTNET } from '@/lib/web3-config';
import { Button } from '@repo/ui/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@repo/ui/components/dialog';
import { useSwitchChain } from '@web3auth/modal/react';
import { toast } from 'sonner';

interface SwitchChainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SwitchChainDialog({ open, onOpenChange }: SwitchChainDialogProps) {
  const { switchChain, error: switchChainError } = useSwitchChain();

  const handleSwitchChain = () => {
    try {
      switchChain(CHILIZ_SPICY_TESTNET.id.toString());
      onOpenChange(false);
      toast.success('Switched to the Chiliz Spicy Testnet chain');
    } catch (error) {
      if (switchChainError) {
        toast.error(switchChainError.message);
      } else {
        console.error(error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Please switch to the Chiliz Spicy Testnet chain</DialogTitle>

          <Button onClick={handleSwitchChain}>Switch Chain</Button>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
