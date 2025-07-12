import { ethers } from 'hardhat';

async function main() {
  console.log('🌶️  Déploiement sur Chiliz Spicy Testnet...\n');

  const [deployer] = await ethers.getSigners();
  console.log('Déploiement avec le compte:', deployer.address);
  console.log('Balance du compte:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'CHZ\n');

  // 1. Déployer les tokens de test d'abord
  console.log('📄 Déploiement des tokens de test...');

  const MockFanToken = await ethers.getContractFactory('MockFanToken');

  // PSG Token
  const psgToken = await MockFanToken.deploy('Paris Saint-Germain Fan Token', 'PSG', 18, 1000000000000000000n);
  await psgToken.waitForDeployment();
  const psgAddress = await psgToken.getAddress();
  console.log('✅ PSG Token déployé à:', psgAddress);

  // BAR Token
  const barToken = await MockFanToken.deploy('FC Barcelona Fan Token', 'BAR', 18, 1000000000000000000n);
  await barToken.waitForDeployment();
  const barAddress = await barToken.getAddress();
  console.log('✅ BAR Token déployé à:', barAddress);

  // CITY Token
  const cityToken = await MockFanToken.deploy('Manchester City Fan Token', 'CITY', 18, 1000000000000000000n);
  await cityToken.waitForDeployment();
  const cityAddress = await cityToken.getAddress();
  console.log('✅ CITY Token déployé à:', cityAddress);

  // GAL Token
  const galToken = await MockFanToken.deploy('Galatasaray Fan Token', 'GAL', 18, 1000000000000000000n);
  await galToken.waitForDeployment();
  const galAddress = await galToken.getAddress();
  console.log('✅ GAL Token déployé à:', galAddress);

  // 2. Déployer le contrat principal Raliz
  console.log('\n🎟️  Déploiement du contrat Raliz...');

  const Raliz = await ethers.getContractFactory('Raliz');
  const feeRecipient = deployer.address; // Le déployeur recevra les frais

  const raliz = await Raliz.deploy(feeRecipient);
  await raliz.waitForDeployment();
  const ralizAddress = await raliz.getAddress();
  console.log('✅ Raliz déployé à:', ralizAddress);

  // 3. Configurer les autorisations
  console.log('\n⚙️  Configuration des autorisations...');

  // Autoriser le déployeur comme organisateur
  const authTx = await raliz.authorizeOrganizer(deployer.address);
  await authTx.wait();
  console.log('✅ Déployeur autorisé comme organisateur');

  // 4. Distribuer quelques tokens de test au déployeur pour les tests
  console.log('\n🪙 Distribution de tokens de test...');

  const testAmount = ethers.parseEther('1000'); // 1000 tokens de chaque

  await (await psgToken.mint(deployer.address, testAmount)).wait();
  await (await barToken.mint(deployer.address, testAmount)).wait();
  await (await cityToken.mint(deployer.address, testAmount)).wait();

  console.log(`✅ ${ethers.formatEther(testAmount)} tokens de chaque type distribués au déployeur`);

  // 5. Créer une raffle de test
  console.log("\n🎰 Création d'une raffle de test...");

  const startDate = Math.floor(Date.now() / 1000); // Maintenant
  const endDate = startDate + 7 * 24 * 60 * 60; // 7 jours
  const participationFee = ethers.parseEther('0.1'); // 0.1 CHZ
  const minimumFanTokens = ethers.parseEther('50'); // 50 PSG tokens minimum

  const createTx = await raliz.createRaffle(
    'Raffle de Test PSG',
    'Une raffle de test pour les fans du PSG sur Chiliz Spicy Testnet. Gagnez un maillot PSG dédicacé!',
    participationFee,
    psgAddress, // Require PSG tokens
    minimumFanTokens,
    startDate, // Date de début
    endDate, // Date de fin
    1, // 1 gagnant
    100, // Max 100 participants
  );
  await createTx.wait();

  console.log('✅ Raffle de test créée avec succès');

  // 6. Résumé du déploiement
  console.log('\n📋 RÉSUMÉ DU DÉPLOIEMENT');
  console.log('================================');
  console.log('Réseau: Chiliz Spicy Testnet');
  console.log('Chain ID: 88882');
  console.log('Explorer: https://testnet.chiliscan.com');
  console.log('');
  console.log('🎟️  Contrat Raliz:');
  console.log('   Adresse:', ralizAddress);
  console.log('   Explorer:', `https://testnet.chiliscan.com/address/${ralizAddress}`);
  console.log('');
  console.log('🪙 Tokens de test:');
  console.log('   PSG Token:', psgAddress);
  console.log('   BAR Token:', barAddress);
  console.log('   CITY Token:', cityAddress);
  console.log('');
  console.log("📝 VARIABLES D'ENVIRONNEMENT À CONFIGURER:");
  console.log('================================');
  console.log(`NEXT_PUBLIC_RALIZ_CONTRACT_ADDRESS=${ralizAddress}`);
  console.log(`NEXT_PUBLIC_PSG_TOKEN_ADDRESS=${psgAddress}`);
  console.log(`NEXT_PUBLIC_BAR_TOKEN_ADDRESS=${barAddress}`);
  console.log(`NEXT_PUBLIC_CITY_TOKEN_ADDRESS=${cityAddress}`);
  console.log(`NEXT_PUBLIC_GALA_TOKEN_ADDRESS=${galAddress}`);
  console.log('');
  console.log('🔗 Ajoutez ces variables à votre fichier .env.local dans ce package');
  console.log('');
  console.log('✅ Déploiement terminé avec succès!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
