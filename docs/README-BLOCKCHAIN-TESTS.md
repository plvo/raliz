# 🌶️ Tests Blockchain - Chiliz Spicy Testnet

Ce guide vous explique comment déployer et tester vos smart contracts Raliz sur le testnet Chiliz Spicy.

## 🚀 Déploiement des Contrats

### Prérequis

1. **Créer un compte sur Chiliz Spicy Testnet**
   - Configurez MetaMask avec le réseau Chiliz Spicy
   - RPC URL: `https://spicy-rpc.chiliz.com`
   - Chain ID: `88882`
   - Symbole: `CHZ`
   - Explorer: https://testnet.chiliscan.com

2. **Obtenir des CHZ de test**
   - Utilisez un faucet Chiliz pour obtenir des CHZ de test
   - Ou demandez dans la communauté Chiliz Discord

3. **Configurer les variables d'environnement**
   - Copiez votre clé privée dans `packages/contracts/.env`
   ```bash
   PRIVATE_KEY=votre_cle_privee_ici
   ```

### Déploiement

1. **Naviguer vers le dossier contracts**
   ```bash
   cd packages/contracts
   ```

2. **Installer les dépendances**
   ```bash
   bun install
   ```

3. **Déployer sur Chiliz Spicy Testnet**
   ```bash
   bun hardhat run scripts/deploy-spicy.ts --network chiliz-testnet
   ```

4. **Récupérer les adresses des contrats**
   Le script affichera les adresses des contrats déployés. Copiez-les !

5. **Configurer les variables d'environnement du front-end**
   Créez un fichier `apps/app/.env.local` avec :
   ```env
   NEXT_PUBLIC_RALIZ_CONTRACT_ADDRESS=0x...
   NEXT_PUBLIC_PSG_TOKEN_ADDRESS=0x...
   NEXT_PUBLIC_BAR_TOKEN_ADDRESS=0x...
   NEXT_PUBLIC_CITY_TOKEN_ADDRESS=0x...
   ```

## 🧪 Tests Front-End

### Démarrer l'application

```bash
cd apps/app
bun dev
```

### Accéder à la page de test

Rendez-vous sur : http://localhost:3000/test-blockchain

### Fonctionnalités de test

1. **Test des Fan Tokens**
   - Vérifiez vos balances PSG, BAR, CITY
   - Validez l'éligibilité (minimum 50 tokens requis)

2. **Test des Raffles**
   - Explorez les raffles existantes
   - Vérifiez votre éligibilité pour chaque raffle
   - Consultez les statuts de participation

## 📊 Architecture du Système

### Smart Contracts

- **Raliz.sol** : Contrat principal des raffles
- **MockFanToken.sol** : Tokens de test (PSG, BAR, CITY)

### Front-End

- **Service Blockchain** : `src/services/blockchain.service.ts`
- **Configuration Web3** : `src/lib/web3-config.ts`
- **Composants de test** : `src/components/blockchain/`

### Flux de test typique

1. **Connexion wallet** → MetaMask sur Chiliz Spicy
2. **Vérification tokens** → Balances PSG/BAR/CITY
3. **Exploration raffles** → Liste des raffles disponibles
4. **Test d'éligibilité** → Vérification des prérequis
5. **Participation** → (Implémentation future)

## 🔧 Fonctionnalités Principales Testées

### Lecture des données (Read Functions)

- ✅ `getRaffleCount()` - Nombre total de raffles
- ✅ `getRaffleInfo(id)` - Informations d'une raffle
- ✅ `getRaffleStatus(id)` - Statut d'une raffle
- ✅ `isEligibleToParticipate(id, user)` - Éligibilité
- ✅ `hasParticipated(id, user)` - Statut de participation
- ✅ `getFanTokenBalance(user, token)` - Balance de fan tokens

### Écriture de données (Write Functions)

- 🚧 `participateInRaffle(id)` - Participation (à implémenter)
- 🚧 `createRaffle(...)` - Création (interface admin)
- 🚧 `drawWinners(id)` - Tirage au sort (admin)

## 🐛 Debugging

### Problèmes courants

1. **Contrat non trouvé**
   - Vérifiez les adresses dans `.env.local`
   - Assurez-vous d'être sur le bon réseau

2. **Erreur de connexion**
   - Vérifiez la configuration MetaMask
   - Essayez de rafraîchir la connexion

3. **Transactions échouées**
   - Vérifiez votre balance CHZ
   - Augmentez le gas limit si nécessaire

### Console de développement

Ouvrez la console du navigateur (F12) pour voir les logs détaillés des interactions blockchain.

## 🎯 Prochaines Étapes

1. **Implémentation des transactions**
   - Composant de participation aux raffles
   - Interface de création de raffles (admin)
   - Système de tirage au sort

2. **Amélioration UX**
   - Notifications de transactions
   - États de chargement améliorés
   - Gestion d'erreurs avancée

3. **Intégration complète**
   - Synchronisation avec la base de données
   - Actions serveur pour les interactions blockchain
   - Interface utilisateur complète

---

🔗 **Liens utiles :**
- [Chiliz Docs](https://docs.chiliz.com/)
- [Testnet Explorer](https://testnet.chiliscan.com)
- [MetaMask Guide](https://metamask.io/) 