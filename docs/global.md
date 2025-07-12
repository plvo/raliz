# 🎟️ Raliz – Jeux concours Web3 sur la blockchain Chiliz

## 🎯 Objectif du projet

**Raliz** permet aux organisateurs (clubs de sport, marques, artistes) de lancer des **raffles** (jeux concours) sur la **blockchain Chiliz**. Les utilisateurs participent avec leur wallet pour tenter de **gagner des lots exclusifs** (maillots, tickets VIP, NFT, etc.).

> Un raffle peut avoir plusieurs gagnants définis par l'organisateur. Le processus est transparent, auditable et immuable grâce à la blockchain.
> 

---

## 🧩 Fonctionnalités clés

- ✅ Création de raffles par un admin
- 💰 **Participation payante en CHZ** avec **condition de détention de fan tokens**
- 🎫 **Système d'éligibilité** : détenir minimum 50 fan tokens du sponsor
- 🎲 Sélection aléatoire de plusieurs gagnants
- 🏆 **Système de compétition inter-équipes** : Points fans + Leaderboard CHZ
- 🎁 **Rewards saisonniers** : Airdrops pour les fans des meilleures équipes
- 🔗 Intégration facile sur mobile et desktop

---

## 🏆 Nouveau : Système de Compétition Inter-Équipes

### 🎯 Concept

**Raliz** introduit une dimension compétitive qui transforme chaque participation en un acte d'engagement pour son équipe favorite :

- **👥 Points Fans** : Chaque participation = +1 point pour le fan
- **🏆 Leaderboard Équipes** : Classement basé sur le total CHZ engagé sur leurs raffles terminées
- **🎁 Rewards Saisonniers** : Airdrops pour les fans du TOP 3 équipes à la fin de saison

### 📊 Mécaniques de Competition

**🔄 Système de Points :**
- **Participation** → +1 point fan individuel
- **Gain** → +5 points bonus fan individuel
- **CHZ Engagé** → Cumul pour le leaderboard équipe

**🏆 Classements :**
- **Individual Fan Leaderboard** : Total points personnels
- **Team CHZ Leaderboard** : Total CHZ engagé sur toutes raffles terminées de l'équipe
- **Most Active Fans** : Fans avec le plus de participations par équipe

**🎁 Rewards de Fin de Saison :**
- **🥇 TOP 1 Team** : Airdrop 100 CHZ répartis entre tous les fans de l'équipe
- **🥈 TOP 2 Team** : Airdrop 50 CHZ répartis entre tous les fans de l'équipe  
- **🥉 TOP 3 Team** : Airdrop 25 CHZ répartis entre tous les fans de l'équipe
- **🌟 MVP Fans** : Top 10 fans individuels reçoivent un NFT exclusif

### 📈 Impact sur l'Engagement

**Avantages :**
- ✅ **Fidélisation** : Les fans s'engagent pour leur équipe sur le long terme
- ✅ **Effet réseau** : Plus une équipe a de fans actifs, plus elle monte au classement
- ✅ **Compétition saine** : Rivalry between teams drives more participation
- ✅ **Rewards tangibles** : Incentives réels pour l'engagement
- ✅ **Viralité** : Les fans vont recruter d'autres fans pour booster leur équipe

**Métriques clés :**
- **Team Engagement Score** : (Participations × Points moyens fans) + CHZ engagé
- **Fan Loyalty Index** : Nombre de raffles consécutives participées pour la même équipe
- **Cross-team Competition** : Delta entre TOP 3 équipes du leaderboard

---

## 🛠️ Stack technique

| Élément | Tech |
| --- | --- |
| **Architecture** | Monorepo (Turborepo) |
| **Frontend** | Next.js 15 + TypeScript |
| **UI Components** | Shadcn/ui + Tailwind CSS |
| **Auth** | NextAuth.js (email) + WalletConnect | TO BE DEFINED
| **Database** | PostgreSQL + Drizzle ORM |
| **Blockchain** | Chiliz Chain Testnet (EVM compatible) |
| **Smart Contracts** | Solidity + Hardhat |
| **Paiements** | **CHZ (token natif)** + Condition fan tokens |
| **RNG** | Math.random() + Manuel admin |
| **Competition** | **Off-chain calculations** + Season snapshots |
| **Déploiement** | Vercel + Railway |

### 🏗️ Architecture Monorepo
```
raliz/
├── apps/
│   ├── app/              # App utilisateur (Next.js)
│   └── backoffice/       # Backoffice organisateurs  (Next.js)
├── packages/
│   ├── ui/               # Composants Shadcn partagés
│   ├── db/               # Schema Drizzle + migrations
│   ├── contracts/        # Smart contracts Solidity + Hardhat
│   ├── auth/             # Configuration authentication
│   └── config/           # Config ESLint, TS, Tailwind
└── packages.json         # Turborepo setup
```

---

## 🔄 User Flow - Mise à jour avec Compétition

### 👤 Côté Utilisateur - Nouveau Parcours

1. **Inscription** : Création compte avec email/mdp (NextAuth) TO BE DEFINED
2. **Découverte** : Browse les raffles + **découverte leaderboard équipes**
3. **Choix d'équipe** : **Sélection équipe favorite** (optionnel mais encourage)
4. **Connexion Wallet** : Obligatoire pour participer (WalletConnect)
5. **Vérification d'éligibilité** : Détenir ≥ 50 fan tokens du sponsor
6. **Participation** : Paye en CHZ → **+1 point automatique**
7. **Suivi** : **Dashboard personnel avec points + classement équipe**
8. **Compétition** : **Suivi leaderboard temps réel + progression équipe**
9. **Gain** : Contacté par l'organisateur + **+5 points bonus**
10. **Rewards saisonniers** : **Notification airdrops équipe + NFT individuels**

### 🛠️ Côté Organisateur - Nouveau Workflow Compétitif

1. **Auth Admin** : Connexion backoffice avec credentials
2. **Setup Profil** : Enregistrement avec adresse de leur fan token spécifique (ex: PSG Token)
3. **Connexion Wallet** : Wallet personnel pour payer les frais de gas et transactions
4. **Dashboard Competition** : **Vue position vs autres équipes + métriques engagement**
5. **Création Raffle** : Titre, lot, prix en CHZ, durée (fan token automatiquement celui de l'organisateur)
6. **Monitoring** : **Suit les participations + impact sur leaderboard équipe**
7. **Tirage** : Lance manuellement après `endDate` (utilise son wallet pour la transaction)
8. **Contact** : Récupère emails des gagnants pour distribution
9. **Analyse Compétition** : **Review performance vs autres équipes + préparation saison suivante**

### 🏆 Nouveau Flow : Gestion des Saisons

**🔧 Admin Super (Raliz) :**
1. **Création Saison** : Définit dates début/fin + budget rewards
2. **Monitoring** : Suit leaderboard temps réel + engagement global
3. **Fin de Saison** : **Calcul automatique classements + préparation airdrops**
4. **Distribution Rewards** : **Airdrops CHZ + Mint NFT pour MVP fans**
5. **Reset & Nouvelle Saison** : Archivage stats + initialisation nouvelle compétition

---

## 📊 Nouvelles Pages & Components - Compétition

### 🏆 Page Leaderboard (`/leaderboard`)

**Sections :**
- **🥇 Team Rankings** : TOP 10 équipes par CHZ engagé
- **⭐ MVP Fans** : TOP 100 fans individuels par points
- **📈 Most Active Teams** : Équipes avec le plus de participations
- **🔥 Rising Stars** : Fans avec la plus forte progression

**Métriques affichées :**
- Position actuelle vs position précédente
- CHZ total engagé (équipes)
- Points total (fans individuels)  
- Nombre participations (fans + équipes)
- Tendance 7 derniers jours

### 🎯 Page Compétition (`/competitions`)

**Vue d'ensemble :**
- **📊 Saison actuelle** : Dates + temps restant + TOP 3 preview
- **🏆 Rewards à gagner** : Montants CHZ + NFT descriptions
- **📈 Ma progression** : Points actuels + classement dans équipe favorite
- **🎲 Raffles contributives** : Quelles raffles impactent le plus le leaderboard

### 🎁 Page Saison (`/season/[id]`)

**Détails saison :**
- **📅 Timeline** : Dates importantes + milestones
- **🏆 Classement final** (si terminée)
- **💰 Rewards distribués** : Historique des airdrops
- **📊 Stats globales** : Participation totale + CHZ total + nb équipes
- **🌟 Highlights** : Moments marquants de la saison

---

## ⛓️ Smart Contracts Architecture - Compétition

### 🤔 On-Chain vs Off-Chain pour le MVP

**💡 Recommandation : Architecture Hybride Off-Chain**

**✅ Avantages Off-Chain (MVP) :**
- **🚀 Rapidité développement** : 2-3h vs 1-2 jours on-chain
- **💰 Gas costs réduits** : Pas de transactions supplémentaires
- **🔄 Flexibilité** : Modification règles compétition facilement
- **📊 Analyses complexes** : Calculs aggregés performance optimal
- **🎯 MVP Focus** : Se concentrer sur UX et mécaniques de base

**⚠️ Inconvénients :**
- **🔒 Moins transparent** que 100% on-chain
- **⚖️ Dépendance DB** pour les classements

**🔄 Architecture Recommandée MVP :**
```
🏗️ Hybrid Architecture :
├── ON-CHAIN (Immutable)
│   ├── Participations & Payments (CHZ)
│   ├── Winners & Random draws
│   └── Critical raffle data
└── OFF-CHAIN (Performance)
    ├── Points calculations & Leaderboards
    ├── Season management & Stats
    ├── Rewards preparation & Analytics
    └── Complex aggregations & Rankings
```

**🚀 Migration Path Future :**
1. **MVP** : Off-chain calculations + Smart contract participations
2. **V2** : Season snapshots on-chain (immutable leaderboards)
3. **V3** : Full on-chain avec optimisations gas + layer 2

### 📊 Services pour la Compétition

**CompetitionService** (Off-chain)
```typescript
// services/competition.service.ts
export class CompetitionService {
  // Calcul points en temps réel
  static async calculateUserPoints(userId: string, seasonId?: string)
  
  // Leaderboard équipes par CHZ
  static async getTeamLeaderboard(seasonId?: string, limit = 10)
  
  // Leaderboard fans individuels
  static async getFanLeaderboard(seasonId?: string, limit = 100)
  
  // Stats équipe spécifique
  static async getTeamStats(organizerId: string, seasonId?: string)
  
  // Préparation rewards fin de saison
  static async calculateSeasonRewards(seasonId: string)
  
  // Snapshot leaderboard pour archivage
  static async snapshotSeasonResults(seasonId: string)
}
```

---

## 🧱 Modèle de données (MCD) - Mis à jour avec Compétition

### Entités principales

**USER**
```
├── id (PK)
├── email
├── username
├── wallet_address (UK)
├── auth_provider (email|github|google)
├── is_verified
├── total_points                    # 🆕 Points cumulés (cache)
├── total_participations           # 🆕 Nombre participations (cache)
├── favorite_organizer_id (FK)     # 🆕 Équipe favorite (optionnel)
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
├── wallet_address (UK)             # Wallet pour payer les frais de gas et transactions
├── fan_token_address (UK)          # Adresse spécifique de leur propre fan token
├── is_verified
├── total_chz_engaged              # 🆕 Total CHZ engagé (cache)
├── total_completed_raffles        # 🆕 Nombre raffles terminées (cache)
├── leaderboard_rank               # 🆕 Position actuelle classement (cache)
├── created_at
├── updated_at
```

**SEASON** - 🆕 Nouvelle entité
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

**USER_SEASON_STATS** - 🆕 Nouvelle entité
```
├── id (PK)
├── user_id (FK)
├── season_id (FK)
├── organizer_id (FK)              # Équipe supportée cette saison
├── total_points                   # Points cette saison
├── total_participations           # Participations cette saison
├── total_chz_spent               # CHZ dépensé cette saison
├── rank_in_team                  # Classement dans l'équipe
├── last_participation_date
├── created_at
├── updated_at
```

**ORGANIZER_SEASON_STATS** - 🆕 Nouvelle entité
```
├── id (PK)
├── organizer_id (FK)
├── season_id (FK)
├── total_chz_engaged             # CHZ total engagé cette saison
├── total_raffles_completed       # Raffles terminées cette saison
├── total_participants_unique     # Fans uniques cette saison
├── average_participation_rate    # Taux participation moyen
├── leaderboard_position          # Position dans le classement saison
├── created_at
├── updated_at
```

**SEASON_REWARD** - 🆕 Nouvelle entité
```
├── id (PK)
├── season_id (FK)
├── reward_type (TEAM_TOP3|INDIVIDUAL_MVP|SPECIAL)
├── organizer_id (FK)             # Pour rewards équipes
├── user_id (FK)                  # Pour rewards individuels
├── position                      # 1, 2, 3 pour TOP 3
├── reward_amount_chz            # Montant CHZ
├── reward_description           # Description du reward
├── distributed                  # Boolean
├── transaction_hash             # Hash transaction airdrop
├── distributed_at
├── created_at
```

**RAFFLE** - Mis à jour
```
├── id (PK)
├── organizer_id (FK)                    # Le fan token requis est celui de l'organisateur
├── season_id (FK)                       # 🆕 Saison associée
├── title
├── description
├── prize_description
├── image_url
├── participation_price_chz (decimal)     # Prix en CHZ
├── minimum_fan_tokens (decimal)         # Minimum de fan tokens requis (défaut: 50)
├── start_date
├── end_date
├── max_winners
├── max_participants
├── status (DRAFT|ACTIVE|ENDED)
├── smart_contract_address
├── total_chz_collected              # 🆕 Total CHZ collecté (cache)
├── created_at
├── updated_at
```

**PARTICIPATION** - Mis à jour
```
├── id (PK)
├── raffle_id (FK)
├── user_id (FK)
├── wallet_address
├── transaction_hash
├── chz_paid                            # Montant CHZ payé
├── fan_token_balance_at_participation  # Balance du fan token de l'organisateur au moment de la participation
├── points_earned                       # 🆕 Points gagnés (1 base + 5 si winner)
├── participated_at
├── is_winner
├── notified_at
```

**WINNER** - Existant
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

**NOTIFICATION** - Mis à jour
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

### Relations étendues
- USER 1→N PARTICIPATION
- USER 1→N USER_SEASON_STATS
- ORGANIZER 1→N RAFFLE
- ORGANIZER 1→N ORGANIZER_SEASON_STATS
- SEASON 1→N RAFFLE
- SEASON 1→N USER_SEASON_STATS
- SEASON 1→N ORGANIZER_SEASON_STATS
- SEASON 1→N SEASON_REWARD
- RAFFLE 1→N PARTICIPATION
- PARTICIPATION 1→1 WINNER (optionnel)
- USER 1→N NOTIFICATION
- RAFFLE 1→N NOTIFICATION

---

## 📱 Organisation des Pages - Mise à jour

### 🌐 App Utilisateur (`/apps/app/`) - Ajouts Compétition

```
Pages principales :
├── / (homepage)           # Landing + liste raffles publics + leaderboard preview
├── /auth/login           # Connexion email/mdp
├── /auth/register        # Inscription
├── /raffles              # Liste complète raffles
├── /raffle/[id]          # Détail raffle + participation
├── /profile              # Profil + wallet connect + stats personnelles
├── /my-participations    # Historique participations + points earned
├── /leaderboard          # 🆕 Classements équipes + fans individuels
├── /season/[id]          # 🆕 Détails saison + rewards + stats
├── /competitions         # 🆕 Vue d'ensemble compétitions actives
└── /notifications        # Centre notifications + season updates
```

### ⚙️ Backoffice Admin (`/apps/backoffice/`) - Ajouts Compétition

```
Dashboard organisateur :
├── /admin                # Dashboard overview + position leaderboard
├── /admin/raffles        # Gestion raffles
├── /admin/raffle/create  # Création raffle
├── /admin/raffle/[id]    # Détail + tirage gagnants
├── /admin/participants   # Vue participants + stats équipe
├── /admin/winners        # Gestion gagnants
├── /admin/competition    # 🆕 Stats compétition + ranking équipe
├── /admin/season         # 🆕 Gestion saisons + rewards
├── /admin/settings       # Config fan token
└── /admin/analytics      # Stats participations + competition analytics
```

**Nouvelles fonctionnalités admin :**
- 📊 Dashboard compétition temps réel
- 🏆 Vue position leaderboard vs autres équipes
- 👥 Analytics engagement fans par équipe
- 🎁 Preparation rewards de fin de saison
- 📈 Métriques de performance équipe

---

## 🛣️ Roadmap Hackathon - Mise à jour Compétition

### ⏱️ Phase 1 (2-3h) : Setup & Core
- ✅ Setup monorepo Turborepo
- ✅ Config Shadcn/ui + Tailwind
- ✅ Setup Drizzle + PostgreSQL + **nouvelles tables compétition**
- ✅ Auth NextAuth.js (email/password) TO BE DEFINED
- ✅ Smart contracts révisés + tests + déploiement testnet

### ⏱️ Phase 2 (2-3h) : Features MVP + Compétition
- ✅ CRUD raffles (admin) avec fan tokens requis
- ✅ Liste + détail raffles (public) avec éligibilité
- ✅ Connexion wallet + vérification fan tokens + participation CHZ
- ✅ **Points système** : +1 point par participation + cache stats
- ✅ **Leaderboard basique** : Équipes par CHZ + Fans par points
- ✅ Intégration paiements CHZ + conditions fan tokens
- ✅ Tirage gagnants manuel + **bonus +5 points winner**

### ⏱️ Phase 3 (1-2h) : Polish & Demo Compétition
- ✅ **Pages leaderboard** + compétition avec temps réel
- ✅ Notifications in-app avec conditions d'éligibilité + **updates compétition**
- ✅ Dashboard admin complet avec métriques fan tokens + **position leaderboard**
- ✅ Interface responsive mobile
- ✅ **Data seeding** pour la demo avec fan tokens + **stats compétition**
- ✅ Documentation API mise à jour

**🎯 Objectif total : 6-8h pour MVP fonctionnel avec compétition**

---

## 🎯 Focus MVP - Compétition Simplifiée

### 🏆 Mécaniques Compétition MVP

**Objectifs :**
- ✅ **Engagement** : +1 point = motivation claire et immédiate
- ✅ **Transparence** : Leaderboard temps réel visible par tous
- ✅ **Simplicité** : Calculs off-chain rapides et flexibles
- ✅ **Gamification** : Classements équipes + fans individuels
- ✅ **Rewards tangibles** : CHZ + NFT pour créer de la valeur

### 📊 Calculs Simplifiés MVP

**Points Fans :**
- ✅ **Participation** = +1 point (automatique)
- ✅ **Victory** = +5 points bonus (si winner)
- ✅ **Cache en DB** pour performance optimale

**Leaderboard Équipes :**
- ✅ **Métrique principale** : Total CHZ engagé sur raffles terminées
- ✅ **Métrique secondaire** : Nombre participations uniques
- ✅ **Mise à jour** : Temps réel à chaque participation/fin raffle

**Rewards de Saison :**
- ✅ **TOP 3 Équipes** : Airdrop CHZ proportionnel
- ✅ **TOP 10 Fans** : NFT exclusif badge MVP
- ✅ **Distribution** : Manuelle admin avec smart contract

### 🔄 Workflow Compétition Simplifié

**En continu :**
1. **Participation** → +1 point + update cache équipe
2. **Victory** → +5 points bonus + notification
3. **Leaderboard** → Recalcul automatique + cache refresh

**Fin de saison :**
1. **Snapshot** → Archivage des classements finals
2. **Rewards calculation** → Script automatique TOP 3 + TOP 10
3. **Distribution** → Batch transactions CHZ + NFT minting
4. **Reset** → Nouvelle saison + conservation historique

---

## 🔮 Améliorations futures - Compétition Avancée

- ✅ **On-chain leaderboards** avec snapshots immutables
- ✅ **Rewards automatiques** via smart contracts + timelock
- 🏆 **Compétitions cross-saisons** + historique performances
- 🎮 **Achievements system** + badges déblocables
- 📊 **Analytics avancées** : prediction modelling engagement
- 🤝 **Team battles** : Défis directs entre équipes
- 💎 **Staking competitions** : Staker fan tokens pour booster équipe
- 🎁 **Dynamic rewards** : Rewards adaptatifs selon performance saison
- 🌍 **Cross-chain expansion** : Compétitions multi-blockchains

---

## ✅ Conclusion - Compétition Intégrée

**Raliz** evolve vers une plateforme de **compétition communautaire Web3** qui révolutionne l'engagement des fans sportifs sur la **blockchain Chiliz**. 

### 🚀 **Points forts MVP + Compétition :**
- ⚡ **Rapide** : 6-8h de développement pour produit fonctionnel + compétition
- 🏗️ **Scalable** : Architecture off-chain performante + migration on-chain future
- 💰 **Gamifié** : Points + leaderboards + rewards = engagement maximal
- 🎯 **Community-driven** : Competition entre équipes drive la participation
- 📱 **Modern** : Interface responsive avec real-time leaderboards
- 🔗 **Web3 native** : Intégration transparente blockchain Chiliz + rewards tangibles
- 🏆 **Loyalty rewarded** : Vrais incentives pour l'engagement long-terme

### 💡 **Valeur ajoutée Compétition :**
- **Engagement décuplé** : Les fans participent pour leur équipe, pas juste pour gagner
- **Effet réseau** : Plus une équipe a de fans actifs, plus elle performe
- **Rivalité saine** : Competition inter-équipes = plus de participations globales
- **Fidélisation renforcée** : Rewards saisonniers = retention long-terme
- **Viralité naturelle** : Fans recrutent d'autres fans pour booster leur équipe

### 📊 **Impact attendu MVP + Compétition :**
- **Participation rate** : +200% grâce à la gamification
- **Retention** : +150% grâce aux rewards saisonniers
- **CHZ engagement** : +300% grâce aux leaderboards équipes
- **Fan token holding** : +250% grâce à l'obligation d'éligibilité
- **Community building** : Formation de véritables communautés compétitives

**Raliz transforme chaque fan en ambassadeur de son équipe, créant un écosystème competitif où l'engagement individuel contribue au succès collectif de la communauté, tout en générant de la valeur tangible dans l'écosystème Chiliz.**

---

> 🏆 Competition-Driven Hackathon powered by Chiliz ⚡️ #BuiltOnChiliz #CompetitiveWeb3  