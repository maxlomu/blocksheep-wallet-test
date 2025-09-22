import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import { PrivyClient } from '@privy-io/server-auth';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Contract configuration
const TEST_CONTRACT_ADDRESS = '0xDc89dA1e7Ca49b7CcDC8fDB897A32d564Abb8E42';
const TEST_CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "increment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Initialize Privy Client
const privyClient = new PrivyClient(
  process.env.VITE_PRIVY_APP_ID,
  process.env.VITE_PRIVY_APP_SECRET
);

// Create Viem client for reading contract data using Privy RPC
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.RPC_PROVIDER || 'https://api.privy.io/v1/rpc/base-sepolia')
});

// Note: We now use Privy's wallet RPC API directly for transactions instead of walletClient

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Privy Sponsored Transaction Backend',
    timestamp: new Date().toISOString()
  });
});

// Get contract count
app.get('/api/contract-count', async (req, res) => {
  try {
    const count = await publicClient.readContract({
      address: TEST_CONTRACT_ADDRESS,
      abi: TEST_CONTRACT_ABI,
      functionName: 'getCount'
    });
    
    res.json({ 
      success: true, 
      count: count.toString() 
    });
  } catch (error) {
    console.error('Error reading contract:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Sponsor transaction endpoint
app.post('/api/sponsor-transaction', async (req, res) => {
  console.log('🔥 ENDPOINT HIT: /api/sponsor-transaction');
  console.log('📥 Request body:', req.body);
  
  try {
      const { userAddress, userAccessToken, functionName = 'increment' } = req.body;
    
    console.log('🚀 Received sponsored transaction request');
    console.log('👤 User address:', userAddress || 'Missing');
    console.log('🔑 User access token:', userAccessToken ? 'Present' : 'Missing');
    console.log('📝 Function:', functionName);
    
    // Validate user address
    if (!userAddress) {
      return res.status(400).json({
        success: false,
        error: 'User address is required'
      });
    }
    
    // Validate user with Privy
    console.log('🔍 Validating user with Privy...');
    
    // For now, we'll create a server wallet to sponsor the transaction
    // In production, you'd validate the user's access token
    console.log('💰 Creating server wallet for sponsoring...');
    
    try {
      // Create a server wallet to sponsor the transaction
      const serverWallet = await privyClient.walletApi.createWallet({
        chainType: 'ethereum'
      });
      
      console.log('🏦 Server wallet created:', serverWallet.address);
      
      // Create transaction data for the increment function
      const transactionData = {
        to: TEST_CONTRACT_ADDRESS,
        data: '0xd09de08a', // increment() function selector
        value: '0x0',
        gasLimit: '0x5208'
      };
      
      console.log('📤 Sending sponsored transaction...');
      
      // Send REAL transaction using Privy TEE
      console.log('🚀 Sending REAL transaction via Privy TEE...');
      
      try {
        // The correct approach for Privy TEE is to use delegated actions
        // We need to create a delegated action for the user's wallet
        console.log('📤 Creating delegated action for user wallet...');
        
        // Get the user's wallet from the request
        const userWallet = await privyClient.getUserByWalletAddress(userAddress);
        
        if (!userWallet) {
          throw new Error('User wallet not found');
        }
        
        console.log('👤 Found user wallet:', userWallet.id);
        console.log('🔍 User wallet structure:', JSON.stringify(userWallet, null, 2));
        
        // The user wallet structure has 'wallet' object and 'linkedAccounts' array
        // We need to find the wallet that matches the userAddress
        const targetWallet = userWallet.linkedAccounts.find(account => 
          account.type === 'wallet' && account.address.toLowerCase() === userAddress.toLowerCase()
        );
        
        if (!targetWallet) {
          throw new Error('Target wallet not found in linked accounts');
        }
        
        console.log('💼 Target wallet found:', targetWallet);
        
        // Create a delegated action for the increment transaction
        const delegatedAction = {
          walletId: targetWallet.id, // Use the target wallet's ID
          action: {
            type: 'contract_interaction',
            contractAddress: TEST_CONTRACT_ADDRESS,
            functionName: 'increment',
            args: []
          }
        };
        
        console.log('🎯 Delegated action created:', delegatedAction);
        
        // Execute REAL transaction using Privy's wallet RPC API
        console.log('🚀 Executing REAL transaction via Privy wallet RPC API...');
        
        try {
          // Get user authorization keys for signing
          console.log('🔑 Getting user authorization keys...');
          
          if (!userAccessToken) {
            throw new Error('User access token is required for authorization');
          }
          
          // Authenticate with Privy to get encrypted authorization key
          console.log('🔐 Authenticating with Privy to get session key...');
          
          const authResponse = await fetch('https://api.privy.io/v1/wallets/authenticate', {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${Buffer.from(`${process.env.VITE_PRIVY_APP_ID}:${process.env.VITE_PRIVY_APP_SECRET}`).toString('base64')}`,
              'privy-app-id': process.env.VITE_PRIVY_APP_ID,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              user_jwt: userAccessToken
            })
          });
          
          const authResult = await authResponse.json();
          
          if (!authResponse.ok) {
            throw new Error(`Failed to authenticate with Privy: ${authResult.error || 'Unknown error'}`);
          }
          
          console.log('✅ Privy authentication successful');
          console.log('🔑 Full auth result:', JSON.stringify(authResult, null, 2));
          console.log('⏰ Session expires at:', new Date(authResult.expires_at));
          console.log('💼 Available wallets:', authResult.wallets.length);
          
          // Find the target wallet in the authenticated wallets
          const authenticatedWallet = authResult.wallets.find(wallet => 
            wallet.id === targetWallet.id
          );
          
          if (!authenticatedWallet) {
            throw new Error(`Wallet ${targetWallet.id} not found in authenticated wallets`);
          }
          
          console.log('✅ Target wallet authenticated:', authenticatedWallet.id);
          
          // Sign the request using the authorization key
          console.log('🔐 Signing request with authorization key...');
          
          const requestBody = {
            method: 'eth_sendTransaction',
            caip2: 'eip155:84532', // Base Sepolia
            chain_type: 'ethereum',
            sponsor: true,
            params: {
              transaction: {
                to: TEST_CONTRACT_ADDRESS,
                data: '0xd09de08a', // increment() function selector
                value: '0x0'
              }
            }
          };
          
          // Create the request to sign
          const requestToSign = {
            version: 1,
            url: `https://api.privy.io/v1/wallets/${targetWallet.id}/rpc`,
            method: 'POST',
            headers: {
              'privy-app-id': process.env.VITE_PRIVY_APP_ID,
            },
            body: requestBody
          };
          
          // Use the authorization key directly (it should be decrypted from authenticate response)
          console.log('🔑 Using authorization key for signing...');
          const authorizationKey = authResult.authorization_key;
          
          // Use Privy SDK's updateAuthorizationKey and walletApi.rpc
          console.log('🔑 Updating authorization key in Privy SDK...');
          await privyClient.walletApi.updateAuthorizationKey(authResult.authorization_key);
          
          console.log('✅ Authorization key updated successfully');
          
          // Use the typed helper walletApi.ethereum.sendTransaction
          console.log('🚀 Sending sponsored transaction via Privy SDK walletApi.ethereum.sendTransaction...');
          console.log('🔍 Wallet ID:', targetWallet.id);
          
          const { hash, transactionId } = await privyClient.walletApi.ethereum.sendTransaction({
            walletId: targetWallet.id,
            caip2: 'eip155:84532',            // Base Sepolia
            sponsor: true,                    // sponsoring gas
            transaction: {
              to: TEST_CONTRACT_ADDRESS,
              data: '0xd09de08a',            // increment()
              value: '0x0',
              chainId: 84532                  // numeric chainId inside transaction
            }
          });
          
          console.log('✅ REAL transaction sent successfully via Privy SDK!');
          console.log('🔗 Transaction hash:', hash);
          console.log('🆔 Transaction ID:', transactionId);
          
          res.json({
            success: true,
            txHash: hash,
            message: 'REAL transaction sponsored successfully via Privy SDK',
            sponsored: true,
            serverWallet: serverWallet.address,
            userWallet: targetWallet.address,
            delegatedAction: delegatedAction,
            realTransaction: true,
            privyTransactionId: transactionId
          });
          
        } catch (txError) {
          console.error('❌ Real transaction execution failed:', txError);
          throw txError;
        }
        
      } catch (txError) {
        console.error('❌ Real transaction failed:', txError);
        throw txError; // This will trigger the fallback
      }
      
    } catch (sponsorError) {
      console.error('❌ Error sponsoring transaction:', sponsorError);
      
      // Return actual error instead of simulation
      res.status(500).json({
        success: false,
        error: sponsorError.message,
        details: sponsorError.toString(),
        sponsored: false
      });
    }
    
  } catch (error) {
    console.error('❌ Error sponsoring transaction:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  res.status(500).json({ 
    success: false, 
    error: error.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Privy Sponsored Transaction Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Contract count: http://localhost:${PORT}/api/contract-count`);
});