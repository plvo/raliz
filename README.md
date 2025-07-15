# 🎟️ Raliz – Web3 Raffles on Chiliz Blockchain

> ### 💡 Context
> 
> This project was developed by me and [@neysixx](https://github.com/neysixx) in 48 hours during the [**Hacking Paris Hackathon**](https://www.chiliz.com/hacking-paris/) organized by **Chiliz Blockchain**.
> 
> **This is an MVP, not production-ready, and it does not reflect best development practices.**

## 🎯 Project Objective

**Raliz** allows sponsors (sports teams) to launch **raffles** (contests) on the **Chiliz blockchain**. Users participate with their wallet to try to **win exclusive prizes** (jerseys, VIP tickets, NFTs, etc.).

> A raffle can have multiple winners defined by the organizer. The process is transparent, auditable, and immutable thanks to the blockchain.
> 


## 🧩 Key Features

- ✅ Raffle creation by sponsors
- 💰 **Paid participation in CHZ** with **fan token holding condition**
- 🎫 **Eligibility system**: hold minimum 50 fan tokens from the sponsor
- 🎲 Random selection of multiple winners on-chain
- 🏆 **Inter-team competition system**: Fan Points + CHZ Leaderboard
- 🎁 **Seasonal rewards**: Airdrops for fans of the best teams
- 🔗 Easy integration on mobile and desktop

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


## 🛠️ Technical Stack

| Element | Tech |
| --- | --- |
| **Architecture** | Monorepo (Turborepo) |
| **Frontend** | Next.js 15 + TypeScript |
| **UI Components** | Shadcn/ui + Tailwind CSS |
| **Auth** | Email authentication + Web3Auth |
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
│   └── config/           # TS config
│   ├── contracts/        # Solidity smart contracts + Hardhat
│   ├── db/               # Drizzle schema + migrations
│   ├── ui/               # Shared Shadcn components
└── packages.json         # Turborepo setup
```

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

## 🔐 Financial Management - Secure Architecture

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