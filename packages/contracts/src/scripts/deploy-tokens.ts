import { ethers } from 'hardhat';

async function main() {
  console.log('🪙 Déploiement des Fan Tokens de test...');

  const [deployer] = await ethers.getSigners();
  console.log('📍 Déployeur:', deployer.address);
  console.log('💰 Balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'CHZ');

  const MockFanToken = await ethers.getContractFactory('MockFanToken');

  // Configuration des fan tokens (CHZ retiré car c'est le token natif)
  const fanTokens = [
    {
      name: 'Paris Saint-Germain Fan Token',
      symbol: 'PSG',
      decimals: 1,
      supply: 1_000_000,
      description: 'Required to participate in PSG raffles',
    },
    {
      name: 'FC Barcelona Fan Token',
      symbol: 'BAR',
      decimals: 1,
      supply: 1_000_000,
      description: 'Required to participate in Barcelona raffles',
    },
    {
      name: 'Manchester City Fan Token',
      symbol: 'CITY',
      decimals: 1,
      supply: 1_000_000,
      description: 'Required to participate in Manchester City raffles',
    },
    {
      name: 'Galatasaray Fan Token',
      symbol: 'GAL',
      decimals: 1,
      supply: 1_000_000,
      description: 'Required to participate in Galatasaray raffles',
    },
  ];

  const deployedTokens = [];

  console.log("\n🎯 Architecture: Fan tokens pour conditions d'éligibilité");
  console.log('ℹ️  CHZ (token natif) sera utilisé pour les paiements\n');

  // Déploiement de chaque fan token
  for (const tokenConfig of fanTokens) {
    console.log(`🔄 Déploiement ${tokenConfig.symbol}...`);

    const token = await MockFanToken.deploy(
      tokenConfig.name,
      tokenConfig.symbol,
      tokenConfig.decimals,
      tokenConfig.supply,
    );

    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();

    console.log(`✅ ${tokenConfig.symbol} déployé:`, tokenAddress);

    // Vérification
    const totalSupply = await token.totalSupply();
    console.log(`   📊 Supply: ${ethers.formatEther(totalSupply)} ${tokenConfig.symbol}`);
    console.log(`   🎯 Usage: ${tokenConfig.description}`);

    deployedTokens.push({
      ...tokenConfig,
      address: tokenAddress,
    });
  }

  console.log('\n📋 Résumé des déploiements:');
  console.log('='.repeat(70));
  console.log('TOKEN  | ADDRESS                                      | USAGE');
  console.log('-'.repeat(70));

  deployedTokens.forEach((token) => {
    console.log(`${token.symbol.padEnd(6)} | ${token.address} | Eligibility`);
  });
  console.log(`${'CHZ'.padEnd(6)} | ${'(Native Token)'.padEnd(42)} | Payment`);
  console.log('='.repeat(70));

  // Instructions pour récupérer des tokens de test
  console.log('\n🚰 Pour récupérer des fan tokens de test:');
  console.log(`
  // Via Hardhat console ou script
  const psg = await ethers.getContractAt("MockFanToken", "${deployedTokens[0]?.address}");
  await psg.faucetDefault(); // 1000 PSG tokens gratuits
  
  // Ou spécifier un montant personnalisé
  await psg.faucet(ethers.parseEther("5000")); // 5000 PSG tokens
  
  // Vérifier votre balance
  const balance = await psg.balanceOf(yourAddress);
  console.log("Balance PSG:", ethers.formatEther(balance));
  `);

  // Configuration suggérée pour Raliz
  console.log('\n🔧 Configuration pour Raliz:');
  console.log(`
  # Variables d'environnement (.env)
  PSG_FAN_TOKEN_ADDRESS=${deployedTokens[0]?.address}
  BAR_FAN_TOKEN_ADDRESS=${deployedTokens[1]?.address}  
  CITY_FAN_TOKEN_ADDRESS=${deployedTokens[2]?.address}
  
  # Note: CHZ est le token natif, pas besoin d'adresse
  `);

  // Exemples d'utilisation avec Raliz
  console.log('\n🎲 Exemples de raffles avec ces tokens:');
  deployedTokens.forEach((token, index) => {
    console.log(`
  # Raffle ${token.symbol}
  await raliz.createRaffle(
    "Lot exclusif ${token.symbol}",
    "Raffle réservé aux détenteurs de ${token.symbol}",
    ethers.parseEther("0.1"),      // 0.1 CHZ de participation
    "${token.address}",            // Fan token requis
    0,                             // 0 = défaut (50 tokens minimum)
    startDate,
    endDate,
    1,
    100
  );`);
  });

  // Instructions pour tester l'éligibilité
  console.log("\n🧪 Tester l'éligibilité (après déploiement Raliz):");
  console.log(`
  // 1. Distribuer des fan tokens aux utilisateurs de test
  await psg.transfer(user1, ethers.parseEther("100")); // Eligible
  await psg.transfer(user2, ethers.parseEther("30"));  // Non eligible
  
  // 2. Vérifier l'éligibilité
  const [eligible, balance, required, reason] = await raliz.isEligibleToParticipate(raffleId, user1);
  console.log("Eligible:", eligible, "Balance:", ethers.formatEther(balance));
  
  // 3. Participer avec CHZ
  if (eligible) {
    await raliz.connect(user1).participate(raffleId, { value: ethers.parseEther("0.1") });
  }
  `);

  console.log('\n✨ Tokens déployés avec succès!');
  console.log("🎯 Prochaine étape: Déployer le contrat Raliz avec 'bun run deploy:testnet'");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });
