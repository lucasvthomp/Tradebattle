import { useState } from 'react';
import { BrowserProvider } from 'ethers';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wallet } from 'lucide-react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletConnectProps {
  onSuccess?: () => void;
  onNewUser?: (data: { address: string; signature: string }) => void;
}

export function WalletConnect({ onSuccess, onNewUser }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  async function connectWallet() {
    if (!window.ethereum) {
      toast({
        title: 'MetaMask not found',
        description: 'Please install MetaMask to use wallet authentication',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);

    try {
      // 1. Request wallet connection
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const address = accounts[0];

      // 2. Request nonce from backend
      const nonceResponse = await fetch('/api/auth/wallet/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ walletAddress: address }),
      });

      if (!nonceResponse.ok) {
        throw new Error('Failed to get authentication challenge');
      }

      const { message, isNewUser } = await nonceResponse.json();

      // 3. Sign message
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);

      // 4. Handle new vs existing user
      if (isNewUser) {
        onNewUser?.({ address, signature });
      } else {
        // Existing user - complete login
        const verifyResponse = await fetch('/api/auth/wallet/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ walletAddress: address, signature }),
        });

        if (!verifyResponse.ok) {
          throw new Error('Authentication failed');
        }

        const { user } = await verifyResponse.json();

        toast({
          title: 'Authenticated',
          description: `Welcome back, ${user.username}!`,
        });

        onSuccess?.();
        window.location.href = '/hub';
      }

    } catch (error: any) {
      console.error('Wallet connection error:', error);

      if (error.code === 4001) {
        toast({
          title: 'Connection cancelled',
          description: 'You rejected the connection request',
        });
      } else {
        toast({
          title: 'Connection failed',
          description: error.message || 'Failed to connect wallet',
          variant: 'destructive',
        });
      }
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      className="w-full"
      variant="outline"
      style={{
        background: 'rgba(227, 179, 65, 0.1)',
        borderColor: '#E3B341',
        color: '#E3B341',
      }}
    >
      <Wallet className="w-4 h-4 mr-2" />
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
}
