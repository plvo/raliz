# 🎟️ Raliz Backoffice

## 🔐 Authentication System

The Raliz backoffice uses **Web3Auth** for wallet-based authentication. Only authorized organizers can access the dashboard.

### Authentication Flow

1. **Wallet Connection**: Users connect their wallet via Web3Auth
2. **Organizer Verification**: System checks if the wallet address is registered as an organizer
3. **Access Control**: Only authorized organizers can access the dashboard

### Security Features

- ✅ **Wallet-based authentication** - No passwords needed
- ✅ **Organizer authorization** - Only registered organizers can access
- ✅ **Session management** - Automatic session handling
- ✅ **Error handling** - Clear feedback for unauthorized access
- ✅ **Network validation** - Chiliz Chain integration

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Environment Setup

Ensure these environment variables are set:

```env
# Web3Auth Configuration
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id

# Blockchain Configuration
NEXT_PUBLIC_RALIZ_CONTRACT_ADDRESS=your_contract_address
RPC_URL=https://spicy-rpc.chiliz.com

# Database
DATABASE_URL=your_database_url
```

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser.

## 🏗️ Architecture

### Authentication Components

- **`AuthWrapper`** - Protects the entire application
- **`UserProvider`** - Manages user state and wallet connection
- **`AppSidebar`** - Shows user info and disconnect option
- **`/auth` page** - Dedicated authentication page

### Key Features

- **Protected Routes** - All pages require wallet connection
- **Real-time User State** - Reactive authentication state
- **Error Boundaries** - Graceful error handling
- **Loading States** - Smooth loading experiences

### Page Structure

```
apps/backoffice/src/
├── app/
│   ├── layout.tsx          # Root layout with AuthWrapper
│   ├── page.tsx            # Dashboard (protected)
│   ├── auth/page.tsx       # Authentication page
│   ├── raffles/            # Raffle management
│   ├── participants/       # Participant management
│   ├── winners/           # Winner management
│   ├── analytics/         # Analytics dashboard
│   └── settings/          # Settings page
├── components/
│   ├── shared/            # Shared components
│   └── raffles/           # Raffle-specific components
└── lib/
    ├── providers/         # Authentication providers
    └── wrappers/          # HOCs and wrappers
```

## 🔧 Hooks & Utilities

### Authentication Hooks

```typescript
import { useUser } from '@/lib/providers/user-provider';

function MyComponent() {
  const { user, isConnected, walletAddress } = useUser();
  
  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }
  
  return <div>Welcome, {user?.name}!</div>;
}
```

### Data Fetching

```typescript
import { useActionQuery } from '@/hooks/use-action';
import { getRaffleStats } from '@/actions/raffle/get';

function Dashboard() {
  const { user } = useUser();
  
  const { data: stats } = useActionQuery({
    actionFn: () => user ? getRaffleStats(user) : Promise.resolve({ ok: false, message: 'No user' }),
    queryKey: user ? ['raffle-stats', user.id] : [''],
    initialData: { totalRaffles: 0, activeRaffles: 0, ... },
  });
  
  return <div>Total Raffles: {stats?.totalRaffles}</div>;
}
```

### Mutations

```typescript
import { useActionMutation } from '@/hooks/use-action';
import { createRaffle } from '@/actions/raffle/create';

function CreateRaffleForm() {
  const { mutate, isPending } = useActionMutation({
    actionFn: createRaffle,
    successEvent: {
      toast: { title: 'Success!', description: 'Raffle created' }
    },
    errorEvent: {
      toast: { title: 'Error', description: 'Failed to create raffle' }
    },
    invalidateQueries: [['raffles']]
  });
  
  return (
    <button onClick={() => mutate(data)} disabled={isPending}>
      {isPending ? 'Creating...' : 'Create Raffle'}
    </button>
  );
}
```

## 🛡️ Security Considerations

### Organizer Authorization

Only wallets registered in the `organizer` table can access the backoffice:

```sql
-- Organizer must exist with matching wallet address
SELECT * FROM organizer WHERE walletAddress = '0x...';
```

### Network Security

- All transactions happen on Chiliz Chain
- Smart contract interactions are validated
- Private keys never exposed to frontend

## 🚨 Troubleshooting

### Common Issues

1. **"Organizer Not Found"**
   - Ensure your wallet is registered as an organizer
   - Contact admin to authorize your wallet

2. **"Wallet Not Connected"**
   - Click "Connect Wallet" and approve the connection
   - Ensure you're on the correct network (Chiliz)

3. **"Transaction Failed"**
   - Check you have sufficient CHZ for gas fees
   - Verify contract permissions

### Debug Mode

Enable debug logs in development:

```typescript
// In your component
console.log('User state:', { user, isConnected, walletAddress });
```

## 📖 API Reference

### Authentication State

```typescript
interface UserContextType {
  user: Organizer | null;
  walletAddress: `0x${string}` | undefined;
  chainId: number | undefined;
  balance: { formatted: string; symbol: string; value: bigint } | undefined;
  isConnected: boolean;
  refetchUser: () => void;
}
```

### Server Actions

All database interactions use server actions with proper authentication:

- `getOrganizerProfile(walletAddress)` - Get organizer by wallet
- `getRaffleStats(organizer)` - Get stats for organizer
- `getOrganizerRaffles(organizer)` - Get raffles for organizer
- `getRafflesByStatus(status, organizer)` - Filter raffles by status

---

**🎯 The authentication system is now secure and ready for production use!** 

## 🔐 Financial Management & Security

### 💰 Fund Management Structure - Competitive Pool System

**🚨 IMPORTANT: Organizers CANNOT withdraw funds directly**

**Role Separation:**
- **Organizers** (clubs/teams): Create raffles, manage participants, compete for TOP 3 ranking
- **Super Admin** (Raliz platform): Manages all financial operations and pool redistribution

**Fund Flow - Competitive Pool:**
1. **Collection**: All participants pay CHZ → **Common pool** in smart contract
2. **Team Ranking**: Organizers ranked by **total CHZ collected** across all their raffles
3. **Security**: Only super admin can withdraw from the common pool
4. **Distribution**: Super admin redistributes to **participants who joined raffles of TOP 3 teams** (minus 2.5% platform fee)

### 🏆 Competitive Dynamics

**Team Competition:**
- All teams compete to collect the most CHZ across their raffles
- Only **TOP 3 teams** by collection amount qualify for redistribution
- Creates incentive for teams to create attractive raffles

**Participant Rewards:**
- Participants who supported TOP 3 teams receive redistribution
- Encourages strategic participation in high-performing team raffles
- Rewards loyalty to successful teams

### 🛡️ Security Features

**Smart Contract Protection:**
- All funds stored in single pool within Raliz smart contract
- Only contract owner (super admin) can withdraw from pool
- Automatic platform fee deduction (2.5%)
- Transparent on-chain tracking of all contributions

**Interface Safeguards:**
- Revenue metrics show team collection performance
- Clear warnings about fund management
- No withdrawal buttons for organizers
- Explicit role definitions in settings

### 📊 What Organizers Can See

**✅ Available Functions:**
- Create and manage raffles
- View participation statistics
- Draw winners and contact participants
- Monitor team collection performance vs other teams
- Access CHZ collection metrics (display only)

**❌ Restricted Functions:**
- Withdraw CHZ funds from pool
- Access smart contract funds
- Modify platform fees
- Direct fund redistribution

### 🔄 Super Admin Functions

**Financial Operations:**
- `withdrawCHZ()`: Withdraw all funds from common pool
- `withdrawRaffleFunds(raffleId)`: Withdraw specific raffle funds
- Calculate TOP 3 teams by collection amount
- Redistribute funds to qualifying participants
- Platform fee collection

**Administrative:**
- Authorize/revoke organizers
- Season management
- Competition ranking calculations
- Emergency pause/unpause

---

## 🎯 Key Architecture Decisions

### Why Pool-Based Competition System?

**Team Incentives:** Teams compete to create the most attractive raffles
**Participant Strategy:** Participants choose which teams to support
**Fair Distribution:** Only supporters of successful teams are rewarded
**Transparent Competition:** All collection amounts visible on-chain

### Benefits for Organizers

**Competitive Edge:** Performance directly impacts participant rewards
**Focus on Quality:** Incentive to create engaging raffles
**Transparent Metrics:** Clear visibility of collection performance
**Professional Setup:** Enterprise-grade financial security

### Benefits for Participants

**Strategic Participation:** Choose which teams to support
**Performance Rewards:** Backing successful teams pays off
**Transparent Process:** All payments and rankings visible on-chain
**Secure Distribution:** Funds protected until redistribution

---

This architecture creates a competitive ecosystem where team performance determines participant rewards, encouraging both quality raffles and strategic participation. 