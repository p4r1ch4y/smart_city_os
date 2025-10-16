import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

/**
 * Wallet Context Provider for Solana dApp Integration
 * Provides wallet connectivity for civic transparency features
 */

const WalletContextProvider = ({ children }) => {
  // Configure network (devnet for development, mainnet-beta for production)
  const network = process.env.REACT_APP_SOLANA_NETWORK === 'mainnet-beta' 
    ? WalletAdapterNetwork.MainnetBeta 
    : WalletAdapterNetwork.Devnet;

  // Configure RPC endpoint
  const endpoint = useMemo(() => {
    if (process.env.REACT_APP_SOLANA_RPC_URL) {
      return process.env.REACT_APP_SOLANA_RPC_URL;
    }
    return clusterApiUrl(network);
  }, [network]);

  // Configure supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Custom hook for accessing wallet context
export const useWalletContext = () => {
  // Note: Use the standard wallet adapter hooks instead
  // This is kept for compatibility but users should use useWallet() and useConnection()
  return null;
};

export default WalletContextProvider;