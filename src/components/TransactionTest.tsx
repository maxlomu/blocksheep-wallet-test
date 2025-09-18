import { useState } from 'react'
import { useReadContract } from 'wagmi'
import { usePrivy } from '@privy-io/react-auth'
import { usePrivyWagmi } from '@privy-io/wagmi'
import { TEST_CONTRACT_ADDRESS, TEST_CONTRACT_ABI } from '../contracts/testContract'

interface TimingResult {
  startTime: number
  endTime: number
  duration: number
  txHash?: string
  status: 'pending' | 'success' | 'error'
  error?: string
}

export default function TransactionTest() {
  const [timingResults, setTimingResults] = useState<TimingResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const { user, getAccessToken } = usePrivy()
  const privyWagmi = usePrivyWagmi()
  
  // Debug what usePrivyWagmi provides
  console.log('🔍 usePrivyWagmi provides:', privyWagmi)
  const { data: currentCount, error: readError } = useReadContract({
    address: TEST_CONTRACT_ADDRESS,
    abi: TEST_CONTRACT_ABI,
    functionName: 'getCount',
  })

  // Debug contract read
  console.log('📖 Contract read debug:')
  console.log('- Current count:', currentCount)
  console.log('- Read error:', readError)

  // Check if user has sponsored transactions enabled
  // For now, let's assume sponsoring is available if user has a Privy wallet
  const hasSponsoredTransactions = user?.wallet?.walletClientType === 'privy'
  
  // Debug wallet connection
  console.log('🔍 Wallet debug info:')
  console.log('- User wallet:', user?.wallet)
  console.log('- Linked accounts:', user?.linkedAccounts)
  console.log('- Sponsored transactions flag:', 'Always enabled for Privy')
  console.log('- User ID:', user?.id)

  const runTransaction = async () => {
    if (isRunning) return

    console.log('🚀 Starting transaction test...')
    console.log('📊 Sponsored transactions enabled:', hasSponsoredTransactions)
    console.log('👤 User object:', user)
    console.log('🔗 Contract address:', TEST_CONTRACT_ADDRESS)
    console.log('📝 Function: increment()')

    setIsRunning(true)
    const startTime = Date.now()
    
    const newResult: TimingResult = {
      startTime,
      endTime: 0,
      duration: 0,
      status: 'pending'
    }

    setTimingResults(prev => [newResult, ...prev])

    try {
      console.log('📤 Calling backend API for sponsored transaction...')
      console.log('🔍 User wallet address:', user?.wallet?.address)
      console.log('🔍 User wallet type:', user?.wallet?.walletClientType)
      // Get access token and send to backend
      const accessToken = await getAccessToken()
      console.log('🔑 Access token:', accessToken ? 'Present' : 'Missing')
      
      const requestBody = {
        userAddress: user?.wallet?.address,
        userAccessToken: accessToken,
        functionName: 'increment'
      }
      
      console.log('📤 Request body:', requestBody)
      
      // Call backend API for sponsored transaction
      const response = await fetch('http://localhost:3001/api/sponsor-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      const result = await response.json();
      console.log('📥 Backend response:', result);
      
      if (result.success) {
        console.log('✅ Transaction sponsored successfully!')
        console.log('🔗 Transaction hash:', result.txHash)
        console.log('📊 Transaction details:', {
          hash: result.txHash,
          sponsored: result.sponsored,
          message: result.message,
          realTransaction: result.realTransaction || false
        })
        console.log('⏱️ Duration:', Date.now() - startTime, 'ms')
        
        const endTime = Date.now()
        const duration = endTime - startTime
        
        setTimingResults(prev => 
          prev.map((timingResult, index) => 
            index === 0 ? {
              ...timingResult,
              endTime,
              duration,
              txHash: result.txHash,
              status: 'success'
            } : timingResult
          )
        )
        setIsRunning(false)
      } else {
        throw new Error(result.error || 'Backend transaction failed');
      }
    } catch (err) {
      console.log('💥 Exception caught!')
      console.log('🚨 Exception details:', err)
      console.log('📋 Exception message:', err instanceof Error ? err.message : 'Unknown error')
      console.log('⏱️ Duration:', Date.now() - startTime, 'ms')
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      setTimingResults(prev => 
        prev.map((result, index) => 
          index === 0 ? {
            ...result,
            endTime,
            duration,
            status: 'error',
            error: err instanceof Error ? err.message : 'Unknown error'
          } : result
        )
      )
      setIsRunning(false)
    }
  }

  const clearResults = () => {
    setTimingResults([])
  }

  const averageDuration = timingResults.length > 0 
    ? timingResults.reduce((sum, result) => sum + result.duration, 0) / timingResults.length
    : 0

  return (
    <div>
      {/* Sponsored Transaction Status */}
      <div className="card" style={{ background: 'linear-gradient(to right, #f0fdf4, #eff6ff)', border: '1px solid #bbf7d0' }}>
        <h2 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '8px' }}>🚀</span>
          Sponsored Transaction Status
        </h2>
        <div className="grid">
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Sponsoring Status</label>
            <div>
              <span className={`status-badge ${hasSponsoredTransactions ? 'status-success' : 'status-pending'}`}>
                {hasSponsoredTransactions ? '✅ Enabled' : '⚠️ Checking...'}
              </span>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Transaction Type</label>
            <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: '500' }}>
              {hasSponsoredTransactions ? 'Sponsored (No Gas Fees)' : 'Standard'}
            </p>
          </div>
        </div>
        {hasSponsoredTransactions && (
          <div style={{ marginTop: '16px', padding: '12px', background: '#dcfce7', borderRadius: '6px' }}>
            <p style={{ margin: '0', fontSize: '14px', color: '#166534' }}>
              🎉 Your transactions will be sponsored by Privy! No gas fees required.
            </p>
          </div>
        )}
      </div>

      {/* Contract Info */}
      <div className="card">
        <h2>Contract Information</h2>
        <div className="grid">
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Contract Address</label>
            <p className="address">
              {TEST_CONTRACT_ADDRESS}
            </p>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Current Count</label>
            <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: '500' }}>
              {currentCount?.toString() || 'Loading...'}
            </p>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="card">
        <h2>Transaction Test</h2>
        <div>
          <button
            onClick={runTransaction}
            disabled={isRunning}
            className="button"
            style={{ fontSize: '16px', padding: '12px 24px' }}
          >
            {isRunning ? 'Running...' : 'Run Increment Transaction'}
          </button>
          <button
            onClick={clearResults}
            disabled={timingResults.length === 0}
            className="button"
            style={{ background: '#6b7280' }}
          >
            Clear Results
          </button>
        </div>
        <p style={{ marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
          This will call the increment() function on the contract and measure end-to-end timing.
          {hasSponsoredTransactions && (
            <span style={{ display: 'block', marginTop: '8px', color: '#166534', fontWeight: '500' }}>
              💡 This transaction will be sponsored - no gas fees required!
            </span>
          )}
        </p>
      </div>

      {/* Results Summary */}
      {timingResults.length > 0 && (
        <div className="card">
          <h2>Performance Summary</h2>
          <div className="grid">
            <div className="text-center">
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>{timingResults.length}</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Tests</div>
            </div>
            <div className="text-center">
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                {Math.round(averageDuration)}ms
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Average Duration</div>
            </div>
            <div className="text-center">
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
                {timingResults.filter(r => r.status === 'success').length}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Successful</div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Results */}
      {timingResults.length > 0 && (
        <div className="card">
          <h2>Transaction Results</h2>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Transaction Hash</th>
                <th>Sponsored</th>
                <th>Timestamp</th>
                </tr>
              </thead>
            <tbody>
                {timingResults.map((result, index) => (
                  <tr key={index}>
                  <td>{timingResults.length - index}</td>
                  <td>
                    <span className={`status-badge ${
                        result.status === 'success' 
                        ? 'status-success'
                          : result.status === 'error'
                        ? 'status-error'
                        : 'status-pending'
                      }`}>
                        {result.status}
                      </span>
                    </td>
                  <td>{result.duration}ms</td>
                  <td className="address">
                      {result.txHash ? (
                        <a 
                          href={`https://sepolia.basescan.org/tx/${result.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        className="link"
                        >
                          {result.txHash.slice(0, 10)}...
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                  <td>
                    <span className={`status-badge ${hasSponsoredTransactions ? 'status-sponsored' : 'status-pending'}`}>
                      {hasSponsoredTransactions ? '✅ Yes' : '❌ No'}
                    </span>
                    </td>
                  <td>{new Date(result.startTime).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}
    </div>
  )
}