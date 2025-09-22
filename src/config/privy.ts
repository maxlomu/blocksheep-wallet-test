import { createConfig, http } from 'wagmi';
import { baseSepolia } from 'viem/chains';

// Configure wagmi
export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(import.meta.env.VITE_RPC_PROVIDER || 'https://api.privy.io/v1/rpc/base-sepolia'),
  },
});

export const privyConfig = {
  appId: import.meta.env.VITE_PRIVY_APP_ID,
  config: {
    // Configure Base Sepolia
    defaultChain: baseSepolia,
    supportedChains: [baseSepolia],
    // Enable sponsored transactions
    sponsoredTransactions: true,
    // Embedded wallet configuration
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
    },
  },
};
