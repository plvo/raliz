# Web3Auth Server-Side Authentication

Ce système d'authentification intègre Web3Auth côté client avec une vérification côté serveur et une base de données pour Raliz.

## 🏗️ Architecture

### Côté Client
- **Web3Auth Modal**: Gestion de la connexion wallet/email
- **WalletButton**: Composant principal de connexion/déconnection
- **WalletLoginForm**: Formulaire de connexion dédié

### Côté Serveur
- **Web3AuthService**: Vérification des tokens JWT Web3Auth
- **Actions User**: CRUD utilisateurs avec auto-création
- **withUser**: Wrapper HOC pour pages protégées

## 🚀 Utilisation

### 1. Pages Protégées

```typescript
// app/dashboard/page.tsx
import { withUser } from '@/lib/wrappers/with-view';

function DashboardPage({ user }: { user: User }) {
  return (
    <div>
      <h1>Welcome {user.firstName}!</h1>
      <p>Email: {user.email}</p>
      <p>Wallet: {user.walletAddress}</p>
    </div>
  );
}

export default withUser(DashboardPage);
```

### 2. Actions Server

```typescript
// Obtenir l'utilisateur actuel
const userResult = await getCurrentUser();
if (userResult.ok) {
  const user = userResult.data;
}

// Auto-création lors de la première connexion
const userResult = await getOrCreateUserFromWeb3Auth();
```

### 3. Hooks Client

```typescript
// Dans un composant client
const { data: user, isLoading } = useActionQuery({
  actionFn: () => getCurrentUser(),
  queryKey: ['current-user'],
});

const { mutate: login } = useActionMutation({
  actionFn: loginWithWeb3Auth,
  successEvent: {
    toast: { title: 'Connecté!', description: 'Bienvenue sur Raliz' }
  }
});
```

## 🔄 Flux d'Authentification

1. **Connexion Web3Auth**: L'utilisateur se connecte via MetaMask ou email
2. **Extraction Token**: Le token JWT est récupéré depuis Web3Auth
3. **Vérification Server**: Le token est vérifié côté serveur avec JWKS
4. **Auto-création**: Si première connexion, un compte est créé automatiquement
5. **Session**: Cookie sécurisé stocké pour les requêtes futures
6. **Pages Protégées**: Accès automatique aux pages avec `withUser`

## 📁 Structure des Fichiers

```
src/
├── actions/
│   ├── auth/
│   │   └── login.ts          # Actions de connexion/déconnexion
│   └── user/
│       ├── get.ts            # Récupération utilisateurs
│       └── create.ts         # Création utilisateurs
├── components/
│   ├── auth/
│   │   └── wallet-login-form.tsx  # Formulaire de connexion
│   └── shared/
│       ├── wallet-button.tsx      # Bouton de connexion/profil
│       └── query-boundary.tsx     # Gestion d'erreurs
├── lib/wrappers/
│   ├── with-action.ts        # Wrapper pour actions server
│   └── with-view.tsx         # Wrapper pour pages protégées
└── services/
    └── web3auth.service.ts   # Service de vérification JWT
```

## 🔧 Configuration

### Variables d'Environnement

```env
# Web3Auth Client ID (déjà configuré)
WEB3AUTH_CLIENT_ID=BDfGekwXLJUrFw-WIxiDBLuqaZ7J9nDFSgZEug-KMBaSYgY4nfX_xTJRSr7_kGEz-MDVBhaa_M_RAJIITVuPlV0

# Base de données (déjà configuré)
DATABASE_URL=postgresql://...
```

### Web3Auth Setup

La configuration Web3Auth est dans `lib/providers.tsx` :

```typescript
const web3AuthOptions: Web3AuthOptions = {
  clientId: 'YOUR_CLIENT_ID',
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  modalConfig: {
    connectors: {
      [WALLET_CONNECTORS.AUTH]: {
        loginMethods: {
          email_passwordless: { showOnModal: true }
        }
      },
      [EVM_CONNECTORS.METAMASK]: { showOnModal: true }
    }
  }
};
```

## 🎯 Fonctionnalités

### ✅ Implémenté
- Connexion Web3Auth (MetaMask + Email)
- Vérification JWT côté serveur
- Auto-création d'utilisateurs
- Pages protégées avec `withUser`
- Gestion de session avec cookies
- Composants UI complets

### 🔄 En Cours
- Intégration avec les raffles
- Gestion des rôles avancée
- Notifications utilisateur

## 🐛 Dépannage

### Token invalide
- Vérifier que Web3Auth est correctement initialisé
- S'assurer que le clientId correspond

### Base de données
- Vérifier que les migrations sont appliquées
- Contrôler la connexion DATABASE_URL

### Cookies
- Vérifier les paramètres HTTPS en production
- Contrôler les domaines autorisés

## 📚 API Reference

### Web3AuthService
```typescript
// Vérifier un token JWT
const userInfo = await verifyWeb3AuthToken(token);

// Valider une session depuis les cookies
const userInfo = await validateWeb3AuthSession(cookieHeader);
```

### Actions User
```typescript
// Obtenir l'utilisateur actuel
const result = await getCurrentUser();

// Auto-création/connexion
const result = await getOrCreateUserFromWeb3Auth();

// Recherche par wallet
const result = await getUserByWalletAddress(address);
```

Ce système respecte l'architecture Raliz et s'intègre parfaitement avec le monorepo existant. 