# 🎟️ Raliz – Web3 Raffles on Chiliz Blockchain

## 🎯 Project Objective

**Raliz** allows sponsors (sports teams) to launch **raffles** (contests) on the **Chiliz blockchain**. Users participate with their wallet to try to **win exclusive prizes** (jerseys, VIP tickets, NFTs, etc.).

> A raffle can have multiple winners defined by the organizer. The process is transparent, auditable, and immutable thanks to the blockchain.
> 

---

## 🧩 Key Features

- ✅ Raffle creation by sponsors
- 💰 **Paid participation in CHZ** with **fan token holding condition**
- 🎫 **Eligibility system**: hold minimum 50 fan tokens from the sponsor
- 🎲 Random selection of multiple winners on-chain
- 🏆 **Inter-team competition system**: Fan Points + CHZ Leaderboard
- 🎁 **Seasonal rewards**: Airdrops for fans of the best teams
- 🔗 Easy integration on mobile and desktop

---

## 🏆 New: Inter-Team Competition System

### 🎯 Concept

**Raliz** introduces a competitive dimension that transforms each participation into an act of engagement for your favorite team:

- **👥 Fan Points**: Each participation = price in CHZ * 10 points for the fan
- **🏆 Team Leaderboard**: Ranking based on total CHZ engaged on their completed raffles
- **🎁 Seasonal Rewards**: Airdrops for fans of TOP 3 teams at the end of season according to the following distribution: 1st = 50% of the pool, 2nd = 25% of the pool, 3rd = 10% of the pool (15% for Raliz).

### 📊 Competition Mechanics

**🔄 Points System:**
- **Participation** → price in CHZ * 10 individual fan points
- **CHZ Engaged** → Cumulative for team leaderboard

**🏆 Rankings:**
- **Individual Fan Leaderboard**: Total personal points (future)
- **Team CHZ Leaderboard**: Total CHZ engaged on all completed raffles of the team
- **Most Active Fans**: Fans with the most participations per team (future)

**🎁 End of Season Rewards:**
- **🥇 TOP 1 Team**: Airdrop 50% of the pool distributed among all team fans
- **🥈 TOP 2 Team**: Airdrop 25% of the pool distributed among all team fans  
- **🥉 TOP 3 Team**: Airdrop 10% of the pool distributed among all team fans
- **🌟 MVP Fans**: Top 10 individual fans receive an exclusive NFT (future)

### 📈 Impact on Engagement

**Advantages:**
- ✅ **Loyalty**: Fans engage for their team long-term
- ✅ **Network effect**: The more active fans a team has, the higher it climbs in ranking
- ✅ **Healthy competition**: Rivalry between teams drives more participation
- ✅ **Tangible rewards**: Real incentives for engagement
- ✅ **Virality**: Fans will recruit other fans to boost their team

**Key metrics:**
- **Team Engagement Score**: (Participations × Average fan points) + CHZ engaged
- **Fan Loyalty Index**: Number of consecutive raffles participated for the same team
- **Cross-team Competition**: Delta between TOP 3 teams in the leaderboard

---

## 🛠️ Technical Stack

| Element | Tech |
| --- | --- |
| **Architecture** | Monorepo (Turborepo) |
| **Frontend** | Next.js 15 + TypeScript |
| **UI Components** | Shadcn/ui + Tailwind CSS |
| **Auth** | Email authentication + WalletConnect |
| **Database** | PostgreSQL + Drizzle ORM |
| **Blockchain** | Chiliz Chain Testnet (EVM compatible) |
| **Smart Contracts** | Solidity + Hardhat |
| **Payments** | **CHZ (native token)** + Fan token condition |
| **RNG** | On-chain calculations |
| **Competition** | **Off-chain calculations** + Season snapshots |

### 🏗️ Monorepo Architecture
```
raliz/
├── apps/
│   ├── app/              # User app (Next.js)
│   └── backoffice/       # Organizer backoffice (Next.js)
├── packages/
│   ├── ui/               # Shared Shadcn components
│   ├── db/               # Drizzle schema + migrations
│   ├── contracts/        # Solidity smart contracts + Hardhat
│   ├── auth/             # Authentication configuration
│   └── config/           # ESLint, TS, Tailwind config
└── packages.json         # Turborepo setup
```

---

## 🔄 User Flow

### 👤 User Side

1. **Registration**: Create account with email + wallet connect
2. **Discovery**: Browse raffles + **discover team leaderboard**
3. **Team choice**: **Select favorite team** (optional but encouraged)
4. **Eligibility verification**: Hold ≥ 50 fan tokens from the sponsor
5. **Participation**: Pay in CHZ → **1 automatic point** (price in CHZ * 10 points)
6. **Tracking**: **Personal dashboard with points + team ranking**
7. **Competition**: **Real-time leaderboard tracking + team progression**
8. **Seasonal rewards**: **Team airdrop notification + individual NFTs** (future)

### 🛠️ Organizer Side

1. **Admin Auth**: Backoffice login with credentials + wallet connect
2. **Profile Setup**: Registration with their specific fan token address (ex: PSG Token) (future)
3. **Wallet Connection**: Personal wallet to pay gas fees and transactions
4. **Competition Dashboard**: **View position vs other teams + engagement metrics**
5. **Raffle Creation**: Title, prize, price in CHZ, duration (fan token automatically that of the organizer)
6. **Monitoring**: **Track participations + impact on team leaderboard** (future)
7. **Draw**: Manually launch after `endDate` (uses their wallet for the transaction)
8. **Contact**: Retrieve winner emails for distribution
9. **Competition Analysis**: **Review performance vs other teams + prepare next season** (future)

⚠️ **IMPORTANT**: Organizers CANNOT withdraw CHZ funds from raffles. Only the super admin can do this at the end of the season to redistribute the collected CHZ funds.

### 🏆 Season Management

**🔧 Super Admin (Raliz):**
1. **Season Creation**: Define start/end dates 
2. **Monitoring**: Track real-time leaderboard + global engagement (future)
3. **End of Season**: **Automatic ranking calculation + airdrop preparation** (future)
4. **Reward Distribution**: **CHZ airdrops + Mint NFT for MVP fans** (future)
5. **Reset & New Season**: Archive stats + initialize new competition (future)
6. **🔐 Financial Management**: **Only the super admin can withdraw and redistribute collected CHZ funds** (future)

---

## 📊 New Pages & Components

### 🏆 Leaderboard Page (`/leaderboard`)

**Sections:**
- **🥇 Team Rankings**: TOP 10 teams by CHZ engaged
- **⭐ MVP Fans**: TOP 100 individual fans by points (future)
- **📈 Most Active Teams**: Teams with most participations (future)
- **🔥 Rising Stars**: Fans with strongest progression (future)

**Displayed metrics:**
- Current position vs previous position (future)
- Total CHZ engaged (teams)
- Total points (individual fans)  
- Number of participations (fans + teams)
- 7-day trend (future)

---

## 🧱 Data Model (MCD)

### Main Entities

**USER**
```
├── id (PK)
├── email
├── username
├── wallet_address (UK)
├── auth_provider (email|github|google)
├── is_verified
├── total_points                    # Cumulative points (cache)
├── total_participations           # Number of participations (cache)
├── favorite_organizer_id (FK)     # Favorite team (optional)
├── created_at
├── updated_at
```

**ORGANIZER**
```
├── id (PK)
├── name
├── email
├── description
├── logo_url
├── wallet_address (UK)             # Wallet to pay gas fees and transactions
├── fan_token_address (UK)          # Specific address of their own fan token
├── is_verified
├── total_chz_engaged              # Total CHZ engaged (cache)
├── total_completed_raffles        # Number of completed raffles (cache)
├── leaderboard_rank               # Current ranking position (cache)
├── created_at
├── updated_at
```

**SEASON**
```
├── id (PK)
├── name                           # "Season 2024-2025"
├── description
├── start_date
├── end_date
├── is_active
├── rewards_distributed
├── created_at
├── updated_at
```

**USER_SEASON_STATS**
```
├── id (PK)
├── user_id (FK)
├── season_id (FK)
├── organizer_id (FK)              # Team supported this season
├── total_points                   # Points this season
├── total_participations           # Participations this season
├── total_chz_spent               # CHZ spent this season
├── rank_in_team                  # Ranking within the team
├── last_participation_date
├── created_at
├── updated_at
```

**ORGANIZER_SEASON_STATS**
```
├── id (PK)
├── organizer_id (FK)
├── season_id (FK)
├── total_chz_engaged             # Total CHZ engaged this season
├── total_raffles_completed       # Completed raffles this season
├── total_participants_unique     # Unique fans this season
├── average_participation_rate    # Average participation rate
├── leaderboard_position          # Position in season ranking
├── created_at
├── updated_at
```

**SEASON_REWARD**
```
├── id (PK)
├── season_id (FK)
├── reward_type (TEAM_TOP3|INDIVIDUAL_MVP|SPECIAL)
├── organizer_id (FK)             # For team rewards
├── user_id (FK)                  # For individual rewards
├── position                      # 1, 2, 3 for TOP 3
├── reward_amount_chz            # CHZ amount
├── reward_description           # Reward description
├── distributed                  # Boolean
├── transaction_hash             # Airdrop transaction hash
├── distributed_at
├── created_at
```

**RAFFLE**
```
├── id (PK)
├── organizer_id (FK)                    # Required fan token is that of the organizer
├── season_id (FK)                       # Associated season
├── title
├── description
├── prize_description
├── image_url
├── participation_price_chz (decimal)     # Price in CHZ
├── minimum_fan_tokens (decimal)         # Minimum fan tokens required (default: 50)
├── start_date
├── end_date
├── max_winners
├── max_participants
├── status (DRAFT|ACTIVE|ENDED)
├── smart_contract_address
├── total_chz_collected              # Total CHZ collected (cache)
├── created_at
├── updated_at
```

**PARTICIPATION**
```
├── id (PK)
├── raffle_id (FK)
├── user_id (FK)
├── wallet_address
├── transaction_hash
├── chz_paid                            # CHZ amount paid
├── fan_token_balance_at_participation  # Balance of organizer's fan token at participation time
├── points_earned                       # Points earned
├── participated_at
├── is_winner
├── notified_at
```

**WINNER**
```
├── id (PK)
├── participation_id (FK)
├── raffle_id (FK)
├── user_id (FK)
├── winner_rank
├── has_been_contacted
├── drawn_at
├── contacted_at
├── contact_notes
```

**NOTIFICATION**
```
├── id (PK)
├── user_id (FK)
├── raffle_id (FK)
├── type (RAFFLE_CREATED|PARTICIPATION_CONFIRMED|WINNER_SELECTED|RAFFLE_ENDED|ELIGIBILITY_REQUIRED|SEASON_REWARD|LEADERBOARD_UPDATE)
├── title
├── message
├── is_read
├── created_at
```

### Extended Relations
- USER 1→N PARTICIPATION
- USER 1→N USER_SEASON_STATS
- ORGANIZER 1→N RAFFLE
- ORGANIZER 1→N ORGANIZER_SEASON_STATS
- SEASON 1→N RAFFLE
- SEASON 1→N USER_SEASON_STATS
- SEASON 1→N ORGANIZER_SEASON_STATS
- SEASON 1→N SEASON_REWARD
- RAFFLE 1→N PARTICIPATION
- PARTICIPATION 1→1 WINNER (optional)
- USER 1→N NOTIFICATION
- RAFFLE 1→N NOTIFICATION

---

## 🔮 Future Improvements - Advanced Competition

- ✅ **On-chain leaderboards** with immutable snapshots
- ✅ **Automatic rewards** via smart contracts + timelock
- 🏆 **Cross-season competitions** + performance history
- 🎮 **Achievements system** + unlockable badges
- 📊 **Advanced analytics**: engagement prediction modeling
- 🤝 **Team battles**: Direct challenges between teams
- 💎 **Staking competitions**: Stake fan tokens to boost team
- 🎁 **Dynamic rewards**: Adaptive rewards based on season performance
- 🌍 **Cross-chain expansion**: Multi-blockchain competitions

---

## 🔐 Financial Management - Secure Architecture

### 🔐 CHZ Fund Flow - Competitive Pool System

**📥 Collection:**
- Participants pay in CHZ when participating in all raffles
- All funds are automatically collected in a **common pool** in the Raliz smart contract
- No organizer can directly access the funds

**🏆 Team Rankings:**
- Organizers (teams) are ranked by **total CHZ amount collected** via their raffles
- Only teams in the **TOP 3** are eligible for redistribution (future)
- Ranking is based on fund collection performance

**🔒 Security:**
- **Only the super admin** (contract owner) can withdraw funds from the pool
- Organizers can only create raffles and manage participants
- Total transparency: all payments are tracked on-chain
- The draw is done by the super admin (contract owner) on-chain

**💸 Targeted Redistribution:**
- Super admin withdraws funds via `withdrawCHZ()` from the common pool
- Platform fees (2.5%) are automatically deducted
- Remaining funds are redistributed to **participants who participated in raffles of TOP 3 teams** (future)
- Only participants who supported the best teams receive rewards (future)

### 🏆 Advantages of this Competitive Architecture

**✅ Maximum Security:**
- No risk of misappropriation by organizers
- Centralized control of financial flows
- Complete audit trail of transactions

**✅ Transparency:**
- All payments visible on-chain
- Immutable participation history
- Transparent commission calculations

**✅ Inter-Team Competition:**
- Incentivizes teams to create attractive raffles
- Rewards participants who support the best teams
- Creates healthy competition dynamics between organizers

**✅ Fairness for Participants:**
- Supporters of the best teams are rewarded
- Redistribution based on collective performance
- Encouragement to participate in raffles of the most performing teams

> 🏆 Hackathon powered by Chiliz ⚡️ #BuiltOnChiliz