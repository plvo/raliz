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

    console.log("👤 Propriétaire:", owner);
    console.log("🎲 Nombre de raffles:", totalRaffles.toString());
    console.log("💸 Fee plateforme:", feePercentage.toString() / 100, "%");

    console.log("\n📋 Résumé du déploiement:");
    console.log("=====================================");
    console.log("Contrat: Raliz");
    console.log("Adresse:", contractAddress);
    console.log("Network:", (await deployer.provider.getNetwork()).name);
    console.log("Deployer:", deployer.address);
    console.log("=====================================");

    // Exemples de configuration post-déploiement
    console.log("\n🔧 Configuration suggérée:");
    console.log(`
  # Autoriser des organisateurs (PSG, Barcelona, etc.)
  await raliz.authorizeOrganizer("0x..."); // Adresse PSG
  await raliz.authorizeOrganizer("0x..."); // Adresse Barcelona
  
  # Créer un raffle test
  await raliz.createRaffle(
    "Maillot PSG Signé",
    "Gagnez un maillot PSG signé par Messi!",
    ethers.parseEther("100"), // 100 PSG tokens
    "0x...", // Adresse PSG token
    Math.floor(Date.now() / 1000), // Start maintenant
    Math.floor(Date.now() / 1000) + 86400 * 7, // End dans 7 jours
    1, // 1 gagnant
    100 // Max 100 participants
  );
  `);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Erreur de déploiement:", error);
        process.exit(1);
    }); 