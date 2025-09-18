# Privy Sponsored Transaction Test App

This React app tests **real sponsored transactions** using Privy's server-side TEE (Trusted Execution Environment) on Base Sepolia. Users can interact with smart contracts **without paying gas fees**.

## 🎯 What We Built & Tested

### **Architecture Overview**
- **Wallet Type**: EOA (Externally Owned Account) - standard Ethereum address
- **Execution**: 100% Server-Side via Privy TEE
- **User Experience**: No wallet signing required - server executes on behalf of user
- **Gas Sponsoring**: All gas fees paid by Privy (not user)

### **Transaction Flow**
1. **User authenticates** with Privy (gets JWT access token)
2. **Frontend sends** user address + access token to backend
3. **Backend authenticates** with Privy using `/v1/wallets/authenticate`
4. **Backend gets authorization key** (session key for 1 hour)
5. **Backend updates SDK** with authorization key
6. **Backend executes** `walletApi.ethereum.sendTransaction()` with `sponsor: true`
7. **Privy TEE sponsors gas** and executes transaction on user's behalf
8. **Transaction hash returned** to frontend

### **Key Features**
- ✅ **Real transactions** sent to Base Sepolia testnet
- ✅ **Gas sponsored** by Privy (no user gas fees)
- ✅ **Server-side execution** with proper authorization
- ✅ **Frontend integration** working perfectly
- ✅ **Transaction hashes** returned successfully
- ✅ **Contract state updated** (counter incremented)

## Features

- **Privy Integration**: Uses Privy for wallet connection with server mode enabled
- **Sponsored Transactions**: Tests gasless transactions on Base Sepolia
- **Performance Testing**: Measures end-to-end transaction timing
- **Contract Interaction**: Calls the `increment()` function on a test contract
- **Real-time Results**: Shows transaction status, timing, and links to BaseScan
- **Sponsored Transaction Indicators**: Visual indicators showing when transactions are sponsored
- **Gas Fee Status**: Clear indication when transactions are gasless

## Contract Details

- **Address**: `0xDc89dA1e7Ca49b7CcDC8fDB897A32d564Abb8E42`
- **Network**: Base Sepolia Testnet
- **Function**: `increment()` - Simple counter increment (write function)

## Setup

### **Frontend Setup**
1. **Environment Variables**: Create a `.env` file with:
   ```
   VITE_PRIVY_APP_ID=your_privy_app_id_here
   VITE_RPC_PROVIDER=https://api.privy.io/v1/rpc/base-sepolia
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Frontend**:
   ```bash
   npm run dev
   ```

### **Backend Setup**
1. **Navigate to Backend Directory**:
   ```bash
   cd backend
   ```

2. **Install Backend Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**: Create `backend/.env` with:
   ```
   VITE_PRIVY_APP_ID=your_privy_app_id_here
   VITE_PRIVY_APP_SECRET=your_privy_app_secret_here
   RPC_PROVIDER=https://api.privy.io/v1/rpc/base-sepolia
   ```

4. **Run the Backend**:
   ```bash
   npm start
   ```

### **Privy Dashboard Configuration**
- Enable Server Mode (TEE)
- Configure Base Sepolia network
- Enable Sponsored Transactions
- Add your domain to allowed origins

## Usage

1. **Connect Wallet**: Click "Connect Wallet" to authenticate with Privy
2. **Run Tests**: Click "Run Increment Transaction" to test sponsored transactions
3. **View Results**: See timing results, transaction hashes, and performance metrics
4. **Monitor Performance**: Track average duration and success rates

## What Gets Measured

- **End-to-End Timing**: From button click to transaction confirmation
- **Transaction Status**: Success/failure with error messages
- **Performance Metrics**: Average duration, success rate, total tests
- **Blockchain Links**: Direct links to BaseScan for transaction verification
- **Sponsored Status**: Visual indicators showing if transactions are sponsored
- **Gas Fee Status**: Clear indication when transactions are gasless

## Technical Stack

### **Frontend**
- React 18.2.0 with TypeScript
- Vite for build tooling
- Privy React SDK for wallet authentication
- Wagmi for blockchain interactions
- Custom CSS (Tailwind removed for simplicity)

### **Backend**
- Node.js with Express
- Privy Server SDK (`@privy-io/server-auth`)
- Viem for blockchain interactions
- HPKE for authorization key handling
- Base Sepolia testnet

### **Key Dependencies**
- `@privy-io/react-auth` - Frontend Privy integration
- `@privy-io/server-auth` - Backend Privy SDK
- `viem` - Ethereum library
- `@hpke/core` - HPKE encryption
- `express` - Backend server
- `cors` - Cross-origin requests

The app demonstrates **real sponsored transactions** using Privy's TEE with proper server-side authorization and gas sponsoring.

