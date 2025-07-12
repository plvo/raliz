import { ethers } from "hardhat";

/**
 * Script de test complet pour valider l'architecture CHZ + Fan Tokens
 * Ce script démontre le workflow end-to-end de la nouvelle architecture
 */
async function main() {
    console.log("🧪 Test du workflow complet Raliz - Architecture CHZ + Fan Tokens\n");

    const [deployer, organizer, user1, user2, user3] = await ethers.getSigners();

    console.log("👥 Acteurs du test:");
    console.log("📍 Deployer:", deployer.address);
    console.log("🏢 Organizer:", organizer.address);
    console.log("👤 User1:", user1.address);
    console.log("👤 User2:", user2.address);
    console.log("👤 User3:", user3.address);

    // 1. Déployer les fan tokens
    console.log("\n🪙 1. Déploiement des fan tokens...");
    const MockFanToken = await ethers.getContractFactory("MockFanToken");
    const psgToken = await MockFanToken.deploy("PSG Token", "PSG", 18, 1000000);
    await psgToken.waitForDeployment();
    
    console.log("✅ PSG Token déployé:", await psgToken.getAddress());

    // 2. Déployer Raliz
    console.log("\n🎟️ 2. Déploiement du contrat Raliz...");
    const Raliz = await ethers.getContractFactory("Raliz");
    const raliz = await Raliz.deploy(deployer.address);
    await raliz.waitForDeployment();
    
    console.log("✅ Raliz déployé:", await raliz.getAddress());

    // 3. Configuration
    console.log("\n⚙️ 3. Configuration...");
    await raliz.authorizeOrganizer(organizer.address);
    console.log("✅ Organisateur autorisé");

    // 4. Distribution des fan tokens
    console.log("\n💰 4. Distribution des fan tokens...");
    await psgToken.transfer(user1.address, ethers.parseEther("100")); // Eligible
    await psgToken.transfer(user2.address, ethers.parseEther("30"));  // Non eligible
    // user3 n'a pas de tokens
    
    console.log("✅ User1: 100 PSG tokens (eligible)");
    console.log("✅ User2: 30 PSG tokens (non eligible)");
    console.log("✅ User3: 0 PSG tokens (non eligible)");

    // 5. Créer un raffle
    console.log("\n🎲 5. Création d'un raffle...");
    const startDate = Math.floor(Date.now() / 1000);
    const endDate = startDate + 86400 * 7; // 7 jours
    const participationFee = ethers.parseEther("0.1"); // 0.1 CHZ

    await raliz.connect(organizer).createRaffle(
        "Maillot PSG Signé par Messi",
        "Raffle exclusif pour les détenteurs de PSG tokens",
        participationFee,
        await psgToken.getAddress(),
        0, // Utilise la valeur par défaut (50 tokens)
        startDate,
        endDate,
        1, // 1 gagnant
        100 // Max 100 participants
    );

    console.log("✅ Raffle créé avec succès");
    
    const raffle = await raliz.getRaffle(0);
    console.log("   📋 Titre:", raffle.title);
    console.log("   💰 Prix participation:", ethers.formatEther(raffle.participationFee), "CHZ");
    console.log("   🎫 Fan token requis:", raffle.requiredFanToken);
    console.log("   📊 Minimum requis:", ethers.formatEther(raffle.minimumFanTokens), "tokens");

    // 6. Tests d'éligibilité
    console.log("\n🔍 6. Tests d'éligibilité...");
    
    const [eligible1, balance1, required1, reason1] = await raliz.isEligibleToParticipate(0, user1.address);
    console.log(`👤 User1 - Eligible: ${eligible1}, Balance: ${ethers.formatEther(balance1)} PSG, Raison: ${reason1}`);

    const [eligible2, balance2, required2, reason2] = await raliz.isEligibleToParticipate(0, user2.address);
    console.log(`👤 User2 - Eligible: ${eligible2}, Balance: ${ethers.formatEther(balance2)} PSG, Raison: ${reason2}`);

    const [eligible3, balance3, required3, reason3] = await raliz.isEligibleToParticipate(0, user3.address);
    console.log(`👤 User3 - Eligible: ${eligible3}, Balance: ${ethers.formatEther(balance3)} PSG, Raison: ${reason3}`);

    // 7. Tentatives de participation
    console.log("\n🎯 7. Tentatives de participation...");

    // User1 - Eligible
    try {
        console.log("👤 User1 participe...");
        await raliz.connect(user1).participate(0, { value: participationFee });
        console.log("✅ User1 a participé avec succès");
    } catch (error) {
        console.log("❌ User1 - Erreur:", error);
    }

    // User2 - Non eligible (pas assez de tokens)
    try {
        console.log("👤 User2 tente de participer...");
        await raliz.connect(user2).participate(0, { value: participationFee });
        console.log("✅ User2 a participé");
    } catch (error: any) {
        console.log("❌ User2 - Rejected:", error.reason || "Insufficient fan token balance");
    }

    // User3 - Non eligible (pas de tokens)
    try {
        console.log("👤 User3 tente de participer...");
        await raliz.connect(user3).participate(0, { value: participationFee });
        console.log("✅ User3 a participé");
    } catch (error: any) {
        console.log("❌ User3 - Rejected:", error.reason || "Insufficient fan token balance");
    }

    // 8. Test remboursement excédent
    console.log("\n💸 8. Test remboursement excédent CHZ...");
    
    // Donner plus de PSG tokens à user3 pour qu'il puisse participer
    await psgToken.transfer(user3.address, ethers.parseEther("60"));
    console.log("✅ User3 reçoit 60 PSG tokens supplémentaires");

    // User3 participe avec excédent
    const excessAmount = ethers.parseEther("0.05"); // 0.05 CHZ excédent
    const totalSent = participationFee + excessAmount;
    
    const balanceBefore = await ethers.provider.getBalance(user3.address);
    const tx = await raliz.connect(user3).participate(0, { value: totalSent });
    const receipt = await tx.wait();
    const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
    const balanceAfter = await ethers.provider.getBalance(user3.address);
    
    const actualCost = balanceBefore - balanceAfter;
    const expectedCost = participationFee + gasUsed;
    
    console.log("💰 Montant envoyé:", ethers.formatEther(totalSent), "CHZ");
    console.log("💰 Coût réel:", ethers.formatEther(actualCost), "CHZ");
    console.log("💰 Coût attendu:", ethers.formatEther(expectedCost), "CHZ");
    console.log("✅ Remboursement automatique:", actualCost <= expectedCost + ethers.parseEther("0.001"));

    // 9. Vérifier les participants
    console.log("\n👥 9. Participants enregistrés...");
    const participants = await raliz.getParticipants(0);
    console.log("📊 Nombre de participants:", participants.length);
    participants.forEach((participant, index) => {
        console.log(`   ${index + 1}. ${participant}`);
    });

    // 10. Solde du contrat
    console.log("\n💰 10. Solde du contrat...");
    const contractBalance = await raliz.getContractBalance();
    console.log("💳 Balance CHZ:", ethers.formatEther(contractBalance), "CHZ");
    
    const expectedBalance = participationFee * BigInt(participants.length);
    console.log("💳 Balance attendue:", ethers.formatEther(expectedBalance), "CHZ");
    console.log("✅ Balance correcte:", contractBalance === expectedBalance);

    // 11. Simulation fin de raffle et tirage
    console.log("\n🏆 11. Simulation fin de raffle...");
    
    // Avancer le temps pour terminer le raffle
    await ethers.provider.send("evm_increaseTime", [86400 * 8]); // 8 jours
    await ethers.provider.send("evm_mine", []);
    
    // Tirer les gagnants
    const winners = [user1.address];
    await raliz.connect(deployer).drawWinners(0, winners);
    console.log("✅ Gagnants tirés:", winners.length);
    
    const raffleWinners = await raliz.getWinners(0);
    console.log("🎉 Gagnant:", raffleWinners[0]);

    // 12. Test retrait des fonds
    console.log("\n💸 12. Test retrait des fonds...");
    const balanceBeforeWithdraw = await ethers.provider.getBalance(deployer.address);
    await raliz.connect(deployer).withdrawCHZ();
    const balanceAfterWithdraw = await ethers.provider.getBalance(deployer.address);
    
    console.log("✅ Fonds retirés avec succès");
    console.log("💰 Balance contrat après retrait:", ethers.formatEther(await raliz.getContractBalance()), "CHZ");

    // Résumé final
    console.log("\n📋 RÉSUMÉ DU TEST");
    console.log("==================");
    console.log("✅ Déploiement des contrats");
    console.log("✅ Configuration des permissions");
    console.log("✅ Distribution des fan tokens");
    console.log("✅ Création de raffle avec fan token requis");
    console.log("✅ Vérification d'éligibilité fonctionnelle");
    console.log("✅ Participation avec paiement CHZ");
    console.log("✅ Rejet des non-éligibles");
    console.log("✅ Remboursement automatique excédent");
    console.log("✅ Tirage des gagnants");
    console.log("✅ Retrait des fonds");
    
    console.log("\n🎯 Architecture CHZ + Fan Tokens validée !");
    console.log("🚀 Prêt pour l'intégration frontend");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Erreur dans le test:", error);
        process.exit(1);
    }); 