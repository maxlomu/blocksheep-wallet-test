import { usePrivy } from '@privy-io/react-auth'
import TransactionTest from './components/TransactionTest'

function App() {
  const { ready, authenticated, login, logout, user } = usePrivy()

  if (!ready) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Privy Sponsored Transaction Test</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div></div>
          <div>
            {authenticated ? (
              <>
                <span style={{ marginRight: '10px', fontSize: '14px', color: '#6b7280' }}>
                  {user?.wallet?.address ? 
                    `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 
                    'Connected'
                  }
                </span>
                <button onClick={logout} className="button danger">
                  Disconnect
                </button>
              </>
            ) : (
              <button onClick={login} className="button">
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>

      {authenticated ? (
        <TransactionTest />
      ) : (
        <div className="card text-center">
          <h2 className="mb-4">Connect your wallet to start testing</h2>
          <p className="mb-4">This app tests the performance of Privy sponsored transactions on Base Sepolia</p>
          <button onClick={login} className="button" style={{ fontSize: '16px', padding: '12px 24px' }}>
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  )
}

export default App