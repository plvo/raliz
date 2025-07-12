# 🎲 Raliz Simulation Seeder

Ce seeder génère des données de simulation réalistes pour tester et développer la plateforme Raliz.

## 🎯 Objectif

Le seeder crée un environnement de test complet avec :
- **2 saisons** : une terminée (avril-juin 2024) et une en cours (juillet-septembre 2024)
- **3 organisateurs** : PSG, FC Barcelona, Manchester City
- **100 utilisateurs** avec wallets et participations
- **Raffles** avec différents statuts (DRAFT, ACTIVE, ENDED)
- **Participations** avec transactions blockchain simulées
- **Gagnants et perdants** pour la saison terminée
- **Statistiques** de saison pour utilisateurs et organisateurs
- **Notifications** diverses

## 📊 Données Créées

### Saisons
- **Spring Championship 2024** (avril-juin) - Terminée avec récompenses distribuées
- **Summer League 2024** (juillet-septembre) - En cours

### Organisateurs
- **PSG** avec fan token simulé
- **FC Barcelona** avec fan token simulé  
- **Manchester City** avec fan token simulé

### Utilisateurs
- **100 utilisateurs** avec prénoms/noms réalistes
- **Wallets** générés automatiquement
- **Statistiques** de participation et points

### Raffles
- **3-5 raffles par organisateur** pour la saison 1 (toutes terminées)
- **2-4 raffles par organisateur** pour la saison 2 (mix DRAFT/ACTIVE/ENDED)
- **Prix** variés : 0.1 à 2.0 CHZ
- **Gagnants** : 1 à 5 par raffle
- **Participants** : 10 à 100 par raffle

### Participations
- **10-30 participants** par raffle saison 1
- **5-20 participants** par raffle active saison 2
- **Transaction hashes** simulés
- **Points** : 1 pour participation + 5 bonus si gagnant

### Gagnants
- **Sélection aléatoire** parmi les participants
- **70% contactés** (simulation réaliste)
- **Rangs** : 1er, 2ème, 3ème, etc.

## 🚀 Utilisation

### Prérequis
```bash
# Installer les dépendances
bun install

# Configurer la base de données
cp .env.example .env
# Modifier DATABASE_URL dans .env
```

### Exécuter le Seeder
```bash
# Depuis le dossier packages/db
bun run db:seed-simulation

# Ou depuis la racine du projet
bun run --filter @repo/db db:seed-simulation
```

### Nettoyage (optionnel)
```bash
# Vider la base de données avant de re-seeder
bun run db:push --force
```

## 📋 Structure des Données

### Contrats Simulés
```typescript
// Adresses de contrats simulées
const MOCK_FAN_TOKENS = {
  PSG: '0x1234567890abcdef1234567890abcdef12345678',
  BAR: '0x2345678901bcdef12345678901bcdef123456789', 
  CITY: '0x3456789012cdef123456789012cdef1234567890',
};

const MOCK_RALIZ_CONTRACT = '0x4567890123def1234567890123def12345678901';
```

### Wallets
- **Générés avec ethers.js** pour réalisme
- **Uniques** pour chaque utilisateur
- **Format correct** (42 caractères, 0x...)

### Transactions
- **Hashes réalistes** générés avec keccak256
- **Montants** correspondant aux prix des raffles
- **Timestamps** cohérents avec les dates de raffles

## 🔧 Personnalisation

### Modifier le nombre d'utilisateurs
```typescript
// Dans simulation-seeder.ts, ligne ~X
const userData = Array.from({ length: 100 }, (_, i) => generateUserData(i));
//                                    ^^^ Changer ce nombre
```

### Ajouter des organisateurs
```typescript
// Dans generateOrganizerData
const organizers = await db
  .insert(organizerTable)
  .values([
    generateOrganizerData('PSG', MOCK_FAN_TOKENS.PSG),
    generateOrganizerData('FC Barcelona', MOCK_FAN_TOKENS.BAR),
    generateOrganizerData('Manchester City', MOCK_FAN_TOKENS.CITY),
    // Ajouter ici vos organisateurs
  ])
  .returning();
```

### Modifier les dates de saison
```typescript
// Saison 1
startDate: new Date('2024-04-01'),
endDate: new Date('2024-06-30'),

// Saison 2  
startDate: new Date('2024-07-01'),
endDate: new Date('2024-09-30'),
```

## 🎯 Cas d'Usage

### Développement
- **Tests end-to-end** avec données réalistes
- **Développement UI** avec contenu varié
- **Tests de performance** avec volume de données

### Démonstration
- **Démos client** avec scénarios complets
- **Présentation** de toutes les fonctionnalités
- **Tests utilisateur** avec données cohérentes

### Tests
- **Tests d'intégration** avec données complexes
- **Tests de requêtes** avec relations multiples
- **Tests de statistiques** avec calculs réels

## ⚠️ Attention

- **Données fictives** : Ne pas utiliser en production
- **Wallets générés** : Clés privées perdues après génération
- **Transactions simulées** : Pas de vraies transactions blockchain
- **Réinitialisation** : Vide la base avant de re-seeder

## 🔍 Logs de Débogage

Le seeder affiche des logs détaillés :
```
🎲 Starting Raliz Simulation Seeder...
📅 Creating seasons...
✅ Created seasons: uuid-1, uuid-2
🏢 Creating organizers...
✅ Created 3 organizers
👥 Creating users...
✅ Created 100 users
🎟️ Creating Season 1 raffles...
✅ Created 12 Season 1 raffles
🎟️ Creating Season 2 raffles...
✅ Created 8 Season 2 raffles
🎯 Creating Season 1 participations...
✅ Created 240 Season 1 participations
🏆 Creating Season 1 winners...
✅ Created 18 Season 1 winners
🎯 Creating Season 2 participations...
✅ Created 85 Season 2 participations
📊 Updating user stats...
📈 Creating user season stats...
✅ Created 185 user season stats
📊 Creating organizer season stats...
✅ Created 6 organizer season stats
📢 Creating notifications...
✅ Created 50 notifications

🎉 Simulation seeder completed successfully!
```

## 📚 Documentation

Pour plus d'informations sur la structure de données, consultez :
- `packages/db/src/schema.ts` - Schéma complet
- `packages/db/src/types.ts` - Types TypeScript
- `packages/contracts/contracts/Raliz.sol` - Contrat blockchain 