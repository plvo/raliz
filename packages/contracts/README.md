# 🎟️ Raliz Smart Contracts

Package contenant les **smart contracts** pour la plateforme de raffles Web3 sur la blockchain **Chiliz**.

## 📁 Structure du Package

```
packages/contracts/
├── 📄 README.md              # Ce fichier - Documentation complète
├── 📄 package.json           # Configuration NPM et scripts
├── 📄 hardhat.config.ts      # Configuration Hardhat pour déploiement
├── 📄 tsconfig.json          # Configuration TypeScript
├── 📄 .gitignore             # Fichiers à ignorer par Git
├── 📄 .env                   # Variables d'environnement (à créer)
│
├── 📁 contracts/             # 📝 CODE SOURCE DES CONTRATS
│   ├── Raliz.sol             # Contrat principal des raffles
│   └── MockFanToken.sol      # Contrat ERC20 pour les tests
│
├── 📁 scripts/               # 🚀 SCRIPTS DE DÉPLOIEMENT
│   ├── deploy.ts             # Déploiement standard
│   ├── deploy-spicy.ts       # Déploiement complet sur Chiliz Spicy
│   ├── deploy-tokens.ts      # Déploiement des tokens uniquement
│   └── test-full-workflow.ts # Test complet du workflow
│
├── 📁 test/                  # 🧪 TESTS UNITAIRES
│   └── Raliz.test.ts         # Suite de tests complète (19 tests)
│
├── 📁 artifacts/             # 📦 RÉSULTATS DE COMPILATION
│   └── contracts/            # ABIs et bytecode générés
│       ├── Raliz.sol/
│       │   └── Raliz.json    # ABI + bytecode du contrat Raliz
│       └── MockFanToken.sol/
│           └── MockFanToken.json
│
├── 📁 typechain-types/       # 🔷 TYPES TYPESCRIPT AUTO-GÉNÉRÉS
│   ├── common.ts             # Types communs
│   ├── hardhat.d.ts          # Types Hardhat
│   ├── index.ts              # Exports principaux
│   └── contracts/            # Types spécifiques aux contrats
│       ├── Raliz.ts          # Types pour Raliz.sol
│       └── MockFanToken.ts   # Types pour MockFanToken.sol
│
├── 📁 cache/                 # 🗂️ CACHE DE COMPILATION
│   └── solidity-files-cache.json
│
├── 📁 ignition/              # 🔧 SCRIPTS IGNITION (non utilisés)
└── 📁 .cursor/               # 🖱️ CONFIGURATION CURSOR IDE
```

## 🤔 **Pourquoi Déployer des Tokens ?**

### **🏭 En Production (Chiliz Mainnet)**
Les fan tokens **existent déjà** sur Chiliz :
- **PSG Token** : `0x...` (déjà déployé par Chiliz)
- **BAR Token** : `0x...` (déjà déployé par Chiliz)
- **CITY Token** : `0x...` (déjà déployé par Chiliz)

➡️ **On utilise simplement leurs adresses existantes !**

### **🧪 En Développement/Test**
On déploie des **"Mock Tokens"** pour :
- **Tests locaux** : Les vrais tokens n'existent pas sur le réseau local
- **Testnet** : Contrôle total des balances pour les tests
- **Indépendance** : Ne pas dépendre de contrats externes

```typescript
// Production : Vraies adresses Chiliz
const PSG_TOKEN = "0x...";  // Adresse réelle PSG

// Test : Nos mock tokens
const PSG_TOKEN = await MockFanToken.deploy("PSG", "PSG");
```

## 🎯 Éléments Clés à Comprendre

### 1. 📝 **Smart Contracts** (`contracts/`)

#### **Raliz.sol** - Le Contrat Principal
- **Rôle** : Gère toutes les raffles de la plateforme
- **Architecture** : Paiement en CHZ + condition de détention de fan tokens
- **Sécurité** : OpenZeppelin (ReentrancyGuard, Ownable, Pausable)
- **Fonctionnalités** :
  - ✅ Création de raffles par organisateurs autorisés
  - 💰 Paiement en CHZ (token natif Chiliz)
  - 🎫 Condition d'éligibilité : détenir minimum 50 fan tokens
  - 🎲 Tirage au sort des gagnants
  - 🔒 Gestion des permissions et sécurité

#### **MockFanToken.sol** - Tokens de Test
- **Rôle** : Simule les fan tokens PSG, BAR, CITY pour les tests
- **Standard** : ERC20 avec fonction `mint()` pour les tests
- **Usage** : Uniquement en développement et testnet
- **⚠️ Note** : En production, on utilise les VRAIS fan tokens déjà déployés sur Chiliz

### 2. 🚀 **Scripts de Déploiement** (`scripts/`)

#### **deploy-spicy.ts** - Déploiement Complet
- **Objectif** : Déploiement "one-click" sur Chiliz Spicy Testnet
- **⚠️ Usage** : Uniquement pour tests et développement
- **Actions** :
  1. Déploie les 3 **mock tokens** de test (PSG, BAR, CITY)
  2. Déploie le contrat Raliz principal
  3. Configure les autorisations
  4. Distribue des tokens de test
  5. Crée une raffle d'exemple
  6. Affiche toutes les adresses pour le front-end

#### **deploy.ts** - Déploiement Standard
- **Objectif** : Déploiement basique du contrat Raliz uniquement
- **Usage** : Pour production ou déploiement custom

#### **deploy-tokens.ts** - Tokens Uniquement
- **Objectif** : Déploie seulement les tokens de test
- **Usage** : Réapprovisionnement en tokens de test

#### **test-full-workflow.ts** - Test de Workflow
- **Objectif** : Teste le workflow complet sur réseau local
- **Actions** : Simule un scénario réaliste avec participants

### 3. 🧪 **Tests** (`test/`)

#### **Raliz.test.ts** - Suite de Tests Complète
- **Couverture** : 19 tests unitaires
- **Scénarios testés** :
  - Déploiement et configuration
  - Création de raffles
  - Vérification d'éligibilité
  - Participation avec paiement CHZ
  - Tirage au sort des gagnants
  - Gestion des erreurs et edge cases

### 4. 📦 **Artefacts** (`artifacts/`)

#### **Résultats de Compilation**
- **Contenu** : ABIs (Application Binary Interface) et bytecode
- **Usage** : Utilisés par le front-end pour interagir avec les contrats
- **Génération** : Automatique lors de `bun run build`

#### **Raliz.json** - ABI Principal
```json
{
  "contractName": "Raliz",
  "abi": [
    // Interface du contrat pour le front-end
  ],
  "bytecode": "0x608060405234801561001057600080fd5b50..."
}
```

### 5. 🔷 **Types TypeScript** (`typechain-types/`)

#### **Types Auto-Générés**
- **Génération** : Automatique lors de la compilation
- **Usage** : Autocomplétion et type safety dans le code TypeScript
- **Intégration** : Utilisés dans le front-end pour les interactions blockchain

### 6. 📄 **Fichiers de Configuration**

#### **package.json** - Scripts NPM
```json
{
  "scripts": {
    "build": "hardhat compile",
    "test": "hardhat test",
    "deploy:spicy": "hardhat run scripts/deploy-spicy.ts --network chiliz-testnet",
    "deploy:testnet": "hardhat run scripts/deploy.ts --network chiliz-testnet",
    "deploy:local": "hardhat run scripts/deploy.ts --network localhost"
  }
}
```

#### **hardhat.config.ts** - Configuration Réseau
- **Réseaux configurés** :
  - 🌶️ Chiliz Spicy Testnet (Chain ID: 88882)
  - 🔥 Chiliz Mainnet (Chain ID: 88888)
  - 🏠 Localhost (développement)
- **Optimisations** : Compilateur Solidity avec IR pour gestion "Stack too deep"

## 🔄 Workflow de Développement

### 1. **Développement Local**
```bash
# Compiler les contrats
bun run build

# Lancer les tests
bun run test

# Tester le workflow complet
bun run test:workflow
```

### 2. **Déploiement sur Testnet**
```bash
# Configuration
echo "PRIVATE_KEY=your_private_key" > .env

# Déploiement complet
bun run deploy:spicy

# Récupérer les adresses pour le front-end
# (affichées dans le terminal)
```

### 3. **Intégration Front-End**
```typescript
// Les ABIs sont dans artifacts/
import RalizABI from '@/contracts/artifacts/contracts/Raliz.sol/Raliz.json';

// Les types sont auto-générés dans typechain-types/
import type { Raliz } from '@/contracts/typechain-types';
```

## 🎛️ Scripts Disponibles

| Script | Description | Usage |
|--------|-------------|-------|
| `bun run build` | Compile les contrats | Génère ABIs et types |
| `bun run test` | Lance les tests | Validation des contrats |
| `bun run deploy:spicy` | Déploiement complet | Testnet Chiliz Spicy |
| `bun run deploy:testnet` | Déploiement standard | Contrat principal seulement |
| `bun run deploy:local` | Déploiement local | Réseau Hardhat local |
| `bun run test:workflow` | Test workflow complet | Simulation réaliste |

## 🔗 Intégration avec le Front-End

### Variables d'Environnement Nécessaires
```env
# À ajouter dans apps/app/.env.local
NEXT_PUBLIC_RALIZ_CONTRACT_ADDRESS=0x... # Adresse du contrat Raliz
NEXT_PUBLIC_PSG_TOKEN_ADDRESS=0x...      # Adresse du token PSG
NEXT_PUBLIC_BAR_TOKEN_ADDRESS=0x...      # Adresse du token BAR
NEXT_PUBLIC_CITY_TOKEN_ADDRESS=0x...     # Adresse du token CITY
```

### Utilisation dans le Front-End
```typescript
// Service blockchain utilise les ABIs
import { ethers } from 'ethers';
import RalizABI from '@/contracts/artifacts/contracts/Raliz.sol/Raliz.json';

// Interaction avec le contrat
const contract = new ethers.Contract(address, RalizABI.abi, signer);
```

## 🚨 Points Importants

### ⚠️ Fichiers à NE PAS Modifier
- **`artifacts/`** : Générés automatiquement
- **`typechain-types/`** : Générés automatiquement
- **`cache/`** : Cache de compilation

### ✅ Fichiers à Modifier
- **`contracts/`** : Code source des contrats
- **`scripts/`** : Scripts de déploiement
- **`test/`** : Tests unitaires
- **`hardhat.config.ts`** : Configuration réseau

### 🔧 Regeneration des Types
```bash
# Après modification des contrats
bun run build  # Regénère artifacts/ et typechain-types/
```

## 🚀 **Passage Développement → Production**

### **Phase 1 : Développement/Test**
```bash
# Déploiement sur testnet avec mock tokens
bun run deploy:spicy
```
- Déploie MockFanToken (PSG, BAR, CITY)
- Déploie le contrat Raliz
- Crée une raffle de test

### **Phase 2 : Production**
```typescript
// Configuration production dans web3-config.ts
export const CONTRACT_ADDRESSES = {
  RALIZ: "0x...",                    // Notre contrat déployé
  PSG_TOKEN: "0x...",               // VRAIE adresse PSG (Chiliz)
  BAR_TOKEN: "0x...",               // VRAIE adresse BAR (Chiliz)
  CITY_TOKEN: "0x...",              // VRAIE adresse CITY (Chiliz)
};
```

### **Différences Clés**
| Aspect | Développement | Production |
|--------|---------------|------------|
| **Fan Tokens** | Mock tokens déployés | Vrais tokens Chiliz |
| **Contrôle** | Total (mint à volonté) | Lecture seule |
| **Réseau** | Testnet/Local | Chiliz Mainnet |
| **Coût** | Gratuit | Frais de gas réels |

## 🏆 Architecture Raliz

### Système de Paiement
- **Ancien** : ❌ Paiement en fan tokens (complexe)
- **Nouveau** : ✅ Paiement en CHZ + condition de détention

### Flux de Participation
1. **Vérification** : L'utilisateur détient ≥ 50 fan tokens requis
2. **Paiement** : L'utilisateur paie les frais en CHZ
3. **Participation** : Enregistrement dans la raffle
4. **Remboursement** : Excédent CHZ automatiquement remboursé

### Sécurité
- **OpenZeppelin** : Contrats audités et sécurisés
- **ReentrancyGuard** : Protection contre les attaques de réentrance
- **Pausable** : Possibilité de suspendre en cas d'urgence
- **Ownable** : Contrôle des permissions administratives

---

Ce README explique maintenant clairement le rôle de chaque élément du package `@/contracts`. 🎯
