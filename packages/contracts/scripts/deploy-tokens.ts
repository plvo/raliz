import { ethers } from "hardhat";

async function main() {
    console.log("🪙 Déploiement des Fan Tokens de test...");

    const [deployer] = await ethers.getSigners();
    console.log("📍 Déployeur:", deployer.address);
    console.log("💰 Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "CHZ");

    const MockFanToken = await ethers.getContractFactory("MockFanToken");

    // Configuration des tokens
    const tokens = [
        {
            name: "Paris Saint-Germain Fan Token",
            symbol: "PSG",
            decimals: 18,
            supply: 1000000 // 1M tokens
        },
        {
            name: "FC Barcelona Fan Token",
            symbol: "BAR",
            decimals: 18,
            supply: 1000000
        },
        {
            name: "Manchester City Fan Token",
            symbol: "CITY",
            decimals: 18,
            supply: 1000000
        },
        {
            name: "Chiliz",
            symbol: "CHZ",
            decimals: 18,
            supply: 5000000 // 5M CHZ
        }
    ];

    const deployedTokens = [];

    // Déploiement de chaque token
    for (const tokenConfig of tokens) {
        console.log(`\n🔄 Déploiement ${tokenConfig.symbol}...`);

        const token = await MockFanToken.deploy(
            tokenConfig.name,
            tokenConfig.symbol,
            tokenConfig.decimals,
            tokenConfig.supply
        );

        await token.waitForDeployment();
        const tokenAddress = await token.getAddress();

        console.log(`✅ ${tokenConfig.symbol} déployé:`, tokenAddress);

        // Vérification
        const totalSupply = await token.totalSupply();
        console.log('   📊 Supply:', ethers.formatEther(totalSupply), tokenConfig.symbol);

        deployedTokens.push({
            ...tokenConfig,
            address: tokenAddress
        });
    }

    console.log("\n📋 Résumé des déploiements:");
    console.log("=".repeat(50));

    deployedTokens.forEach(token => {
        console.log(`${token.symbol.padEnd(6)} | ${token.address}`);
    });

    console.log("=".repeat(50));

    // Instructions pour récupérer des tokens de test
    console.log("\n🚰 Pour récupérer des tokens de test:");
    console.log(`
  // Via Hardhat console
  const psg = await ethers.getContractAt("MockFanToken", "${deployedTokens[0]?.address}");
  await psg.faucetDefault(); // 1000 PSG tokens
  
  // Ou spécifier un montant
  await psg.faucet(ethers.parseEther("5000")); // 5000 PSG tokens
  `);

    // Configuration suggérée pour Raliz
    console.log("\n🔧 Configuration pour Raliz:");
    console.log(`
  # Variables d'environnement (.env)
  PSG_TOKEN_ADDRESS=${deployedTokens[0]?.address}
  BAR_TOKEN_ADDRESS=${deployedTokens[1]?.address}  
  CITY_TOKEN_ADDRESS=${deployedTokens[2]?.address}
  CHZ_TOKEN_ADDRESS=${deployedTokens[3]?.address}
  `);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Erreur:", error);
        process.exit(1);
    }); 