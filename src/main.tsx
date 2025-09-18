import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config, privyConfig } from './config/privy'

const queryClient = new QueryClient()

// Add error boundary
try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <PrivyProvider appId={privyConfig.appId} config={privyConfig.config}>
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={config}>
            <App />
          </WagmiProvider>
        </QueryClientProvider>
      </PrivyProvider>
    </StrictMode>,
  )
} catch (error) {
  console.error('React initialization error:', error)
  document.getElementById('root')!.innerHTML = `
    <div style="padding: 20px; color: red;">
      <h1>Error Loading App</h1>
      <p>Error: ${error}</p>
      <p>Check console for details</p>
    </div>
  `
}