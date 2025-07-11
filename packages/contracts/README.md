# 🎟️ Raliz Smart Contracts

Smart contracts pour la plateforme de raffles Web3 sur la blockchain **Chiliz**.

## 📋 Contrats

### 🎲 Raliz.sol
Contrat principal gérant les raffles avec paiement en fan tokens.

**Fonctionnalités :**
- ✅ Création de raffles par organisateurs autorisés
- 💰 Participation payante en fan tokens (PSG, BAR, CITY, CHZ)
- 🏆 Tirage manuel des gagnants par l'admin
- 🔒 Sécurité avec ReentrancyGuard + Pausable
- 👥 Gestion des permissions (organisateurs autorisés)

### 🪙 MockFanToken.sol
Contrat ERC20 pour simuler les fan tokens en développement.

**Fonctionnalités :**
- 🚰 Faucet pour récupérer des tokens de test
- 🎯 Compatible avec les vrais fan tokens Chiliz

## 🚀 Installation & Setup

```bash
# Dans le dossier contracts
cd packages/contracts

# Installer les dépendances
bun install

# Compiler les contrats
bun run build

# Lancer les tests
bun run test
```

## 🌐 Déploiement

### 1. Variables d'environnement

Créer un fichier `.env` :
```bash
# Clé privée de votre wallet
PRIVATE_KEY=your_private_key_here

# Adresses des tokens (après déploiement)
PSG_TOKEN_ADDRESS=0x...
BAR_TOKEN_ADDRESS=0x...
CITY_TOKEN_ADDRESS=0x...
CHZ_TOKEN_ADDRESS=0x...
```

### 2. Déployer sur Chiliz Testnet

```bash
# Déployer les tokens de test
bun run deploy:tokens

# Déployer le contrat Raliz
bun run deploy:testnet
```

### 3. Configuration post-déploiement

```javascript
// Autoriser des organisateurs
await raliz.authorizeOrganizer("0x..."); // Adresse PSG
await raliz.authorizeOrganizer("0x..."); // Adresse Barcelona

// Créer un raffle test
await raliz.createRaffle(
  "Maillot PSG Signé",
  "Gagnez un maillot PSG signé par Messi!",
  ethers.parseEther("100"), // 100 PSG tokens
  PSG_TOKEN_ADDRESS,
  Math.floor(Date.now() / 1000), // Start maintenant
  Math.floor(Date.now() / 1000) + 86400 * 7, // End dans 7 jours
  1, // 1 gagnant
  100 // Max 100 participants
);
```

## 🔧 API Contrat Raliz

### Fonctions Admin

```solidity
// Autoriser un organisateur
function authorizeOrganizer(address _organizer) external onlyOwner

// Créer un raffle (organisateur autorisé)
function createRaffle(
    string memory _title,
    string memory _description,
    uint256 _participationFee,
    address _tokenContract,
    uint256 _startDate,
    uint256 _endDate,
    uint256 _maxWinners,
    uint256 _maxParticipants
) external

// Tirer les gagnants (owner seulement)
function drawWinners(uint256 _raffleId, address[] memory _winners) external
```

### Fonctions Utilisateur

```solidity
// Participer à un raffle
function participate(uint256 _raffleId) external

// Voir les détails d'un raffle
function getRaffle(uint256 _raffleId) external view returns (...)

// Voir les participants
function getParticipants(uint256 _raffleId) external view returns (address[])

// Voir les gagnants
function getWinners(uint256 _raffleId) external view returns (address[])
```

## 🧪 Tests

Les tests couvrent :
- ✅ Création de raffles (autorisations)
- ✅ Participation avec tokens
- ✅ Anti-double participation
- ✅ Tirage des gagnants
- ✅ Gestion des erreurs

```bash
# Lancer tous les tests
bun run test

# Tests avec coverage
npx hardhat coverage
```

## 📊 Gas Usage

| Fonction | Gas Moyen | Description |
|----------|-----------|-------------|
| `createRaffle` | ~277k | Création d'un nouveau raffle |
| `participate` | ~146k | Participation avec token |
| `drawWinners` | ~180k | Tirage gagnants (2 winners) |
| `authorizeOrganizer` | ~47k | Autoriser organisateur |

## 🔗 Intégration Frontend

### Exemple avec ethers.js

```typescript
import { ethers } from 'ethers';
import RalizABI from './artifacts/contracts/Raliz.sol/Raliz.json';

// Connexion au contrat
const provider = new ethers.JsonRpcProvider('https://spicy-rpc.chiliz.com/');
const signer = new ethers.Wallet(privateKey, provider);
const raliz = new ethers.Contract(contractAddress, RalizABI.abi, signer);

// Participer à un raffle
async function participateInRaffle(raffleId: number) {
  // 1. Approuver les tokens
  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  await tokenContract.approve(raliz.address, participationFee);
  
  // 2. Participer
  const tx = await raliz.participate(raffleId);
  await tx.wait();
}

// Écouter les événements
raliz.on('ParticipationRegistered', (raffleId, participant, amount) => {
  console.log(`Nouvelle participation: ${participant} pour ${amount} tokens`);
});
```

## 🛡️ Sécurité

### Bonnes pratiques implémentées :
- ✅ **ReentrancyGuard** : Protection contre les attaques de réentrance
- ✅ **Pausable** : Possibilité de mettre en pause le contrat
- ✅ **Ownable** : Gestion des permissions admin
- ✅ **Input validation** : Validation de tous les paramètres
- ✅ **SafeERC20** : Transferts de tokens sécurisés

### Limitations connues :
- ⚠️ **Tirage manuel** : Le tirage n'est pas automatique (confiance admin)
- ⚠️ **Pas de VRF** : Aléatoire non-cryptographique (MVP)

## 🚧 Roadmap

### Version 2.0 (Prochaine)
- 🎲 **Chainlink VRF** : Aléatoire cryptographique
- ⏰ **Tirage automatique** : Exécution automatique à `endDate`
- 💎 **NFT Rewards** : Lots sous forme de NFTs
- 🔄 **Gouvernance** : Vote communautaire pour validation raffles

### Version 3.0 (Future)
- 🌉 **Cross-chain** : Support multi-blockchain
- 🤖 **IA Anti-triche** : Détection automatique de comportements suspects
- 📱 **Mobile SDK** : Kit de développement pour apps mobiles

## 📞 Support

- 🐛 **Issues** : [GitHub Issues](https://github.com/your-repo/issues)
- 💬 **Discord** : [Raliz Community](https://discord.gg/raliz)
- 📧 **Email** : dev@raliz.app

---

> 🏆 **Built on Chiliz** ⚡️ Propulsé par les fan tokens  
> Made with ❤️ for the sports Web3 ecosystem
