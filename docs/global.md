# 🎟️ Raliz – Jeux concours Web3 sur la blockchain Chiliz

## 🎯 Objectif du projet

**Raliz** permet aux organisateurs (clubs de sport, marques, artistes) de lancer des **raffles** (jeux concours) sur la **blockchain Chiliz**. Les utilisateurs participent avec leur wallet pour tenter de **gagner des lots exclusifs** (maillots, tickets VIP, NFT, etc.).

> Un raffle peut avoir plusieurs gagnants définis par l’organisateur. Le processus est transparent, auditable et immuable grâce à la blockchain.
> 

---

## 🧩 Fonctionnalités clés

- ✅ Création de raffles par un admin
- 🧾 Participation gratuite ou payante (token ERC20)
- 🎲 Sélection aléatoire de plusieurs gagnants
- 🔗 Intégration facile sur mobile et desktop

---

## 🛠️ Stack technique

| Élément | Tech |
| --- | --- |
| **Architecture** | Monorepo (Turborepo) |
| **Frontend** | Next.js 15 + TypeScript |
| **UI Components** | Shadcn/ui + Tailwind CSS |
| **Auth** | NextAuth.js (email) + WalletConnect | TO BE DEFINED
| **Database** | PostgreSQL + Prisma ORM |
| **Blockchain** | Chiliz Chain Testnet (EVM compatible) |
| **Smart Contracts** | Solidity + Hardhat |
| **Paiements** | Fan Tokens ERC20 (ex: PSG, CHZ) |
| **RNG** | Math.random() + Manuel admin |
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

## 🔄 User Flow

### 👤 Côté Utilisateur

1. **Inscription** : Création compte avec email/mdp (NextAuth) TO BE DEFINED
2. **Découverte** : Browse les raffles disponibles (guest ok)
3. **Connexion Wallet** : Obligatoire pour participer (WalletConnect)
4. **Participation** : Paye avec fan token de l'organisateur
5. **Suivi** : Reçoit notifications par email + in-app
6. **Gain** : Contacté par l'organisateur si gagnant

### 🛠️ Côté Organisateur (Ex: PSG)

1. **Auth Admin** : Connexion backoffice avec credentials
2. **Setup Token** : Configure son fan token (PSG Token, etc.)
3. **Création Raffle** : Titre, lot, prix en fan token, durée
4. **Monitoring** : Suit les participations en temps réel
5. **Tirage** : Lance manuellement après `endDate`
6. **Contact** : Récupère emails des gagnants pour distribution

### 💰 Système de Paiement par Fan Token

**Exemples concrets :**
- **PSG** → Participation en `$PSG` token
- **FC Barcelona** → Participation en `$BAR` token  
- **Manchester City** → Participation en `$CITY` token

**Avantages :**
- ✅ Engagement communautaire renforcé
- ✅ Utility réelle pour les fan tokens
- ✅ Écosystème Chiliz valorisé
- ✅ Barrier d'entrée pour éviter le spam

## 📱 Organisation des Pages

### 🌐 App Utilisateur (`/apps/app/`)

```
Pages principales :
├── / (homepage)           # Landing + liste raffles publics
├── /auth/login           # Connexion email/mdp
├── /auth/register        # Inscription
├── /raffles              # Liste complète raffles
├── /raffle/[id]          # Détail raffle + participation
├── /profile              # Profil + wallet connect
├── /my-participations    # Historique participations
└── /notifications        # Centre notifications
```

### ⚙️ Backoffice Admin (`/apps/backoffice/`)

```
Dashboard organisateur :
├── /admin                # Dashboard overview
├── /admin/raffles        # Gestion raffles
├── /admin/raffle/create  # Création raffle
├── /admin/raffle/[id]    # Détail + tirage gagnants
├── /admin/participants   # Vue participants
├── /admin/winners        # Gestion gagnants
├── /admin/settings       # Config fan token
└── /admin/analytics      # Stats participations
```

**Fonctionnalités admin :**
- 📊 Dashboard temps réel
- 🎲 Interface tirage gagnants
- 📧 Export emails gagnants
- 🏆 Gestion des lots
- 💰 Config tokens acceptés

---

## 🧱 Modèle de données (MCD)

### Entités principales

**USER**
```
├── id (PK)
├── email
├── username
├── wallet_address (UK)
├── auth_provider (email|github|google)
├── is_verified
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
├── wallet_address (UK)
├── is_verified
├── created_at
```

**RAFFLE**
```
├── id (PK)
├── organizer_id (FK)
├── title
├── description
├── prize_description
├── image_url
├── participation_price (decimal)
├── token_contract_address
├── token_symbol (PSG, BAR, CITY, CHZ)
├── start_date
├── end_date
├── max_winners
├── max_participants
├── status (DRAFT|ACTIVE|ENDED)
├── smart_contract_address
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
├── amount_paid
├── token_used
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
├── type (RAFFLE_CREATED|PARTICIPATION_CONFIRMED|WINNER_SELECTED|RAFFLE_ENDED)
├── title
├── message
├── is_read
├── created_at
```

### Relations
- USER 1→N PARTICIPATION
- ORGANIZER 1→N RAFFLE
- RAFFLE 1→N PARTICIPATION
- PARTICIPATION 1→1 WINNER (optionnel)
- USER 1→N NOTIFICATION
- RAFFLE 1→N NOTIFICATION

---

## ⛓️ Smart Contracts Architecture

### 🎲 Raliz.sol - Contrat Principal

Notre système utilise **2 smart contracts** sécurisés et optimisés :

```solidity
// contracts/Raliz.sol - Contrat principal de gestion des raffles
contract Raliz is ReentrancyGuard, Ownable, Pausable {
    
    struct Raffle {
        string title;
        string description;
        uint256 participationFee;      // Prix en fan tokens (wei)
        address tokenContract;         // Adresse du fan token (PSG, BAR, etc.)
        uint256 startDate;
        uint256 endDate;
        uint256 maxWinners;
        uint256 maxParticipants;
        address[] participants;
        address[] winners;
        bool isActive;
        bool winnersDrawn;
        address organizer;             // Adresse de l'organisateur
    }
    
    // Fonctions principales
    function createRaffle(...) external onlyAuthorizedOrganizer;
    function participate(uint256 _raffleId) external nonReentrant;
    function drawWinners(uint256 _raffleId, address[] memory _winners) external onlyOwner;
    function authorizeOrganizer(address _organizer) external onlyOwner;
}
```

### 🪙 MockFanToken.sol - Tokens de Test

```solidity
// contracts/MockFanToken.sol - Tokens ERC20 pour développement
contract MockFanToken is ERC20, Ownable {
    function faucet(uint256 amount) external;      // Récupérer tokens test
    function faucetDefault() external;             // 1000 tokens gratuits
}
```

### 🔒 Sécurité & Bonnes Pratiques

**✅ Sécurités implémentées :**
- **ReentrancyGuard** : Protection contre attaques de réentrance
- **Pausable** : Arrêt d'urgence par l'admin
- **Ownable** : Gestion des permissions (OpenZeppelin v5)
- **Input Validation** : Vérification complète des paramètres
- **Events** : Logs transparents pour tous les événements

**✅ Tests automatisés :**
```bash
✅ Création de raffles (autorisations)
✅ Participation avec fan tokens  
✅ Anti-double participation
✅ Tirage des gagnants
✅ Gestion des erreurs & edge cases
```

### 🌐 Déploiement & Configuration

**Structure des packages :**
```
packages/contracts/
├── contracts/
│   ├── Raliz.sol              # Contrat principal
│   └── MockFanToken.sol       # Tokens de test
├── scripts/
│   ├── deploy.ts              # Déploiement Raliz
│   └── deploy-tokens.ts       # Déploiement tokens PSG/BAR/CITY
├── test/
│   └── Raliz.test.ts          # Tests complets TypeScript
├── hardhat.config.ts          # Config Chiliz testnet/mainnet
└── README.md                  # Documentation détaillée
```

**Déploiement Chiliz :**
```bash
# Compiler les contrats
cd packages/contracts && bun run build

# Déployer sur Chiliz testnet
bun run deploy:testnet

# Déployer tokens de test (PSG, BAR, CITY)
bun run deploy:tokens
```

### 💰 Gas Optimization

| Fonction | Gas Moyen | Coût USD |
|----------|-----------|----------|
| `createRaffle` | ~277k | $0.50 |
| `participate` | ~146k | $0.25 |
| `drawWinners` | ~180k | $0.35 |
| `authorizeOrganizer` | ~47k | $0.08 |

### 🔄 Intégration Frontend-Blockchain

**Données stockées :**

| Lieu | Type de données | Raison |
|------|----------------|---------|
| **🔗 Blockchain** | participationFee, participants[], winners[], tokenContract | Critique + Immutable |
| **💾 Database** | title, description, image_url, organizer_info | UX + Performance |

**Workflow hybride :**
1. **Admin** crée raffle en DB → Déploie smart contract
2. **User** participe → Transaction blockchain + Sync DB
3. **Admin** tire gagnants → Stockage blockchain + Notifications DB

### 🔧 Intégration Architecture Complète

```mermaid
graph TD
    A[Admin UI - Backoffice] --> B[Server Actions]
    B --> C[Database Drizzle]
    B --> D[Smart Contract Raliz]
    
    E[User UI - App] --> F[Server Actions]
    F --> C
    F --> D
    
    G[WalletConnect] --> D
    D --> H[Chiliz Blockchain]
    
    C --> I[PostgreSQL]
    D --> J[Events/Logs]
    J --> F
    F --> K[Notifications]
```

**Séparation des responsabilités :**
- **🎨 Frontend** : UX/UI uniquement
- **⚙️ Server Actions** : Logique métier + Orchestration
- **💾 Database** : Données utilisateur + Cache performance  
- **🔗 Smart Contracts** : Logique critique + Immutabilité
- **⛓️ Blockchain** : Source de vérité pour participations/gagnants

---

## 🧪 Environnement de Test

### 🌐 Chiliz Chain Testnet
- **Network** : Chiliz Chain Testnet (Spicy)
- **RPC** : `https://spicy-rpc.chiliz.com/`
- **Chain ID** : `88882`
- **Explorer** : `https://testnet.chiliscan.com/`
- **Faucet** : `https://spicy-faucet.chiliz.com/`

### 🪙 Tokens de test disponibles
- **CHZ** : Token natif Chiliz (gas + participation générique)
- **PSG** : `0x...` (mock Fan Token PSG)
- **BAR** : `0x...` (mock Fan Token Barcelona)
- **CITY** : `0x...` (mock Fan Token Manchester City)

### 🚀 Déploiement MVP
```bash
# Smart contracts → Chiliz Testnet
cd packages/contracts
bun run deploy:testnet      # Déploie Raliz.sol
bun run deploy:tokens       # Déploie PSG/BAR/CITY tokens

# Frontend → Vercel
# Database → Railway PostgreSQL  
# Domain → raliz-testnet.vercel.app
```

### 🧪 Commandes de Développement

```bash
# Smart Contracts
cd packages/contracts
bun install                 # Installer dépendances
bun run build              # Compiler les contrats
bun run test               # Lancer les tests
bun run deploy:testnet     # Déployer sur Chiliz testnet

# Frontend
cd apps/app
bun dev                    # Serveur de développement

# Database
cd packages/db
bun run db:generate        # Générer les types
bun run db:migrate         # Exécuter migrations
bun run db:seed            # Données de test
```

## 🛣️ Roadmap Hackathon

### ⏱️ Phase 1 (2-3h) : Setup & Core
- ✅ Setup monorepo Turborepo
- ✅ Config Shadcn/ui + Tailwind
- ✅ Setup Drizzle + PostgreSQL
- ✅ Auth NextAuth.js (email/password) TO BE DEFINED
- ✅ Smart contracts sécurisés + tests + déploiement testnet

### ⏱️ Phase 2 (2-3h) : Features MVP
- ✅ CRUD raffles (admin)
- ✅ Liste + détail raffles (public)
- ✅ Connexion wallet + participation
- ✅ Intégration fan tokens ERC20
- ✅ Tirage gagnants manuel

### ⏱️ Phase 3 (1-2h) : Polish & Demo
- ✅ Notifications in-app
- ✅ Dashboard admin complet
- ✅ Interface responsive mobile
- ✅ Data seeding pour la demo
- ✅ Documentation API

**🎯 Objectif total : 6-8h pour MVP fonctionnel**

---

## 🎯 Focus MVP - Choix techniques

### 🎲 Tirage aléatoire manuel (Admin-triggered)

**Objectifs :**
- ✅ **Simplicité** : Pas de dépendance Chainlink VRF (coût + complexité)
- ✅ **Contrôle** : L'organisateur décide du moment exact du tirage
- ✅ **Transparence** : Algorithme simple et auditable
- ✅ **Rapidité de dev** : MVP livrable en quelques heures


### 📋 Simplifications MVP vs Version complète

| Fonctionnalité | MVP | Version complète |
|---|---|---|
| **RNG** | `Math.random()` JS | Chainlink VRF |
| **Tirage** | Manuel admin | Automatique à `endDate` |
| **Anti-triche** | Confiance admin | VRF + time-lock |
| **Gas cost** | ~50k gas | ~200k+ gas |
| **Dev time** | 2-3h | 1-2 jours |

### 🔄 Workflow MVP optimisé

**Côté Admin :**
1. Crée un raffle avec `endDate`
2. Surveille les participations
3. **Après `endDate`** : clique "Tirer les gagnants"
4. Algo JS tire N gagnants aléatoires
5. Transaction on-chain pour enregistrer les gagnants
6. Notification auto des gagnants

**Côté Participant :**
1. Participe avant `endDate`
2. Reçoit confirmation
3. Attend notification de gain (ou pas)

## 🔮 Améliorations futures

- ✅ Tirage aléatoire avec Chainlink VRF
- 🛑 Anti-double participation stricte
- ⏰ Tirage automatique à l'expiration
- 🏆 Récompenses NFT pour les gagnants
- 🧠 Vote communautaire pour choisir les lots
- 📩 Notification via mail / wallet push (ex: WalletConnect Notify)
- 🎁 Airdrop pour les plus gros participants

---

## ✅ Conclusion

**Raliz** est une plateforme de raffles Web3 innovante qui révolutionne l'engagement des communautés sportives sur la **blockchain Chiliz**. 

### 🚀 **Points forts MVP :**
- ⚡ **Rapide** : 6-8h de développement pour un produit fonctionnel
- 🏗️ **Scalable** : Architecture monorepo avec Turborepo + Shadcn/ui
- 💰 **Innovant** : Premier système de raffles utilisant les fan tokens
- 🎯 **User-centric** : Auth email-first, puis wallet pour participer
- 📱 **Modern** : Interface responsive avec composants Shadcn
- 🔗 **Web3 native** : Intégration transparente blockchain Chiliz

### 💡 **Valeur ajoutée Chiliz :**
- Donne de l'**utility réelle** aux fan tokens (PSG, BAR, CITY, etc.)
- Renforce l'**engagement communautaire** des clubs
- Crée un **écosystème** autour des équipes sportives
- Ouvre la voie aux **NFT rewards** et **experiences exclusives**

### 📊 **Impact attendu :**
- Augmentation de la **demande** pour les fan tokens
- **Adoption** accrue de l'écosystème Chiliz
- **Nouveaux use cases** pour le sport Web3
- **Expérience utilisateur** fluide entre Web2 et Web3

**Raliz transforme chaque participation en raffle en un acte d'engagement envers son équipe favorite, tout en créant de la valeur dans l'écosystème Chiliz.**

---

> 🏆 Hackathon powered by Chiliz ⚡️ #BuiltOnChiliz  
>