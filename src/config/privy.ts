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
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
      noPromptOnSignature: true,
    },
    // Configure login methods
    loginMethods: ['wallet', 'email', 'sms', 'google', 'twitter', 'discord'],
    // Appearance
    appearance: {
      theme: 'light',
      accentColor: '#676FFF',
      logo: 'https://your-logo-url.com/logo.png',
    },
  },
};
