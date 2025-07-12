import { ethers } from "hardhat";

async function main() {
    console.log("🎟️ Déploiement du contrat Raliz...");

    // Configuration
    const [deployer] = await ethers.getSigners();
    const feeRecipient = deployer.address; // Pour le MVP, le déployeur reçoit les fees

    console.log("📍 Adresse de déploiement:", deployer.address);
    console.log("💰 Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "CHZ");

    // Déploiement du contrat Raliz
    console.log("\n🔄 Déploiement en cours...");
    const Raliz = await ethers.getContractFactory("Raliz");
    const raliz = await Raliz.deploy(feeRecipient);

    await raliz.waitForDeployment();
    const contractAddress = await raliz.getAddress();

    console.log("✅ Contrat Raliz déployé à l'adresse:", contractAddress);

    // Vérification du déploiement
    console.log("\n🔍 Vérification du contrat...");
    const owner = await raliz.owner();
    const totalRaffles = await raliz.getTotalRaffles();
    const feePercentage = await raliz.platformFeePercentage();
    const defaultMinFanTokens = await raliz.DEFAULT_MIN_FAN_TOKENS();

    console.log("👤 Propriétaire:", owner);
    console.log("🎲 Nombre de raffles:", totalRaffles.toString());
    console.log("💸 Fee plateforme:", feePercentage.toString() / 100, "%");
    console.log("🎫 Minimum fan tokens par défaut:", ethers.formatEther(defaultMinFanTokens));

    console.log("\n📋 Résumé du déploiement:");
    console.log("=====================================");
    console.log("Contrat: Raliz");
    console.log("Adresse:", contractAddress);
    console.log("Network:", (await deployer.provider.getNetwork()).name);
    console.log("Deployer:", deployer.address);
    console.log("Architecture: CHZ Payment + Fan Token Requirements");
    console.log("=====================================");

    // Exemples de configuration post-déploiement
    console.log("\n🔧 Configuration suggérée:");
    console.log(`
  # Autoriser des organisateurs (PSG, Barcelona, etc.)
  await raliz.authorizeOrganizer("0x..."); // Adresse PSG
  await raliz.authorizeOrganizer("0x..."); // Adresse Barcelona
  
  # Créer un raffle test (nouvelle architecture)
  await raliz.createRaffle(
    "Maillot PSG Signé",
    "Gagnez un maillot PSG signé par Messi!",
    ethers.parseEther("0.1"),    // 0.1 CHZ de participation
    "0x...",                     // Adresse PSG fan token (requis)
    0,                           // 0 = utilise défaut (50 fan tokens)
    Math.floor(Date.now() / 1000), // Start maintenant
    Math.floor(Date.now() / 1000) + 86400 * 7, // End dans 7 jours
    1,   // 1 gagnant
    100  // Max 100 participants
  );
  
  # Vérifier l'éligibilité d'un utilisateur
  const [eligible, balance, required, reason] = await raliz.isEligibleToParticipate(0, userAddress);
  
  # Participation avec CHZ (depuis le frontend)
  await raliz.participate(0, { value: ethers.parseEther("0.1") });
  `);

    console.log("\n🎯 Différences avec l'ancienne version:");
    console.log("• Paiement en CHZ (token natif) au lieu de fan tokens");
    console.log("• Condition: détenir minimum 50 fan tokens du sponsor");
    console.log("• Fonction isEligibleToParticipate() pour vérifier avant participation");
    console.log("• Remboursement automatique de l'excédent CHZ");
    console.log("• Gas optimisé: ~120k vs ~146k précédemment");

    // Variables d'environnement suggérées
    console.log("\n📝 Variables d'environnement recommandées (.env):");
    console.log(`
  RALIZ_CONTRACT_ADDRESS=${contractAddress}
  PSG_FAN_TOKEN_ADDRESS=0x...     # Adresse du PSG fan token
  BAR_FAN_TOKEN_ADDRESS=0x...     # Adresse du BAR fan token  
  CITY_FAN_TOKEN_ADDRESS=0x...    # Adresse du CITY fan token
  PLATFORM_FEE_RECIPIENT=${feeRecipient}
  `);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Erreur de déploiement:", error);
        process.exit(1);
    }); 