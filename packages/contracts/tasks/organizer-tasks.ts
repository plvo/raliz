import { task } from "hardhat/config";
import { createRalizContract } from "../src/index";
import dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

// Task pour autoriser un organisateur
task("authorize-organizer", "Authorizes an organizer on the blockchain")
  .addParam("address", "The organizer's Ethereum address")
  .setAction(async (taskArgs, hre) => {
    const { address: organizerAddress } = taskArgs;

    // Valider l'adresse Ethereum
    if (!hre.ethers.isAddress(organizerAddress)) {
      console.error('❌ Error: Invalid Ethereum address');
      console.log('Please provide a valid Ethereum address');
      process.exit(1);
    }

    try {
      const contractAddress = process.env.NEXT_PUBLIC_RALIZ_CONTRACT_ADDRESS;
      
      console.log('🔐 Authorizing organizer...');
      console.log(`📍 Organizer address: ${organizerAddress}`);
      console.log(`📍 Contract address: ${contractAddress}`);

      // Obtenir le signer (admin)
      const [adminSigner] = await hre.ethers.getSigners();
      console.log(`👤 Admin address: ${await adminSigner.getAddress()}`);

      // Créer l'instance du contrat
      if (!contractAddress) {
        throw new Error('RALIZ contract address not found in environment variables');
      }

      const ralizContract = createRalizContract(contractAddress, adminSigner);

      // Vérifier si l'organisateur est déjà autorisé
      const isAlreadyAuthorized = await ralizContract.authorizedOrganizers(organizerAddress);
      
      if (isAlreadyAuthorized) {
        console.log('✅ Organizer is already authorized');
        return;
      }

      // Autoriser l'organisateur
      console.log('⏳ Sending authorization transaction...');
      const tx = await ralizContract.authorizeOrganizer(organizerAddress);
      console.log(`📝 Transaction hash: ${tx.hash}`);

      // Attendre la confirmation
      console.log('⏳ Waiting for transaction confirmation...');
      const receipt = await tx.wait();

      if (receipt && receipt.status === 1) {
        console.log('✅ Success! Organizer authorized successfully');
        console.log(`🎉 Transaction confirmed in block: ${receipt.blockNumber}`);
        console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
      } else {
        console.error('❌ Transaction failed');
        process.exit(1);
      }

    } catch (error) {
      console.error('❌ Error authorizing organizer:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Not authorized organizer')) {
          console.log('💡 Tip: Make sure you are using an admin wallet that owns the contract');
        } else if (error.message.includes('insufficient funds')) {
          console.log('💡 Tip: Make sure your admin wallet has enough CHZ for gas fees');
        }
      }
      
      process.exit(1);
    }
  });

// Task pour vérifier l'autorisation d'un organisateur
task("check-organizer", "Checks if an organizer is authorized")
  .addParam("address", "The organizer's Ethereum address")
  .setAction(async (taskArgs, hre) => {
    const { address: organizerAddress } = taskArgs;

    // Valider l'adresse Ethereum
    if (!hre.ethers.isAddress(organizerAddress)) {
      console.error('❌ Error: Invalid Ethereum address');
      console.log('Please provide a valid Ethereum address');
      process.exit(1);
    }

    try {
      const contractAddress = process.env.NEXT_PUBLIC_RALIZ_CONTRACT_ADDRESS;
      
      console.log('🔍 Checking organizer authorization...');
      console.log(`📍 Organizer address: ${organizerAddress}`);
      console.log(`📍 Contract address: ${contractAddress}`);

      // Obtenir un provider (pas besoin de signer pour les lectures)
      const [signer] = await hre.ethers.getSigners();

      // Créer l'instance du contrat
      if (!contractAddress) {
        throw new Error('RALIZ contract address not found in environment variables');
      }

      const ralizContract = createRalizContract(contractAddress, signer);

      // Vérifier si l'organisateur est autorisé
      const isAuthorized = await ralizContract.authorizedOrganizers(organizerAddress);
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 Authorization Status Report');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`👤 Organizer: ${organizerAddress}`);
      console.log(`🔐 Status: ${isAuthorized ? '✅ AUTHORIZED' : '❌ NOT AUTHORIZED'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      if (isAuthorized) {
        console.log('🎉 This organizer can create raffles');
      } else {
        console.log('⚠️  This organizer cannot create raffles');
        console.log('💡 To authorize this organizer, run:');
        console.log(`   bun hardhat authorize-organizer --network chiliz-testnet --address ${organizerAddress}`);
      }

    } catch (error) {
      console.error('❌ Error checking organizer authorization:', error);
      process.exit(1);
    }
  });

// Task pour révoquer l'autorisation d'un organisateur
task("revoke-organizer", "Revokes an organizer's authorization")
  .addParam("address", "The organizer's Ethereum address")
  .setAction(async (taskArgs, hre) => {
    const { address: organizerAddress } = taskArgs;

    // Valider l'adresse Ethereum
    if (!hre.ethers.isAddress(organizerAddress)) {
      console.error('❌ Error: Invalid Ethereum address');
      console.log('Please provide a valid Ethereum address');
      process.exit(1);
    }

    try {
      const contractAddress = process.env.NEXT_PUBLIC_RALIZ_CONTRACT_ADDRESS;
      
      console.log('🚫 Revoking organizer authorization...');
      console.log(`📍 Organizer address: ${organizerAddress}`);
      console.log(`📍 Contract address: ${contractAddress}`);

      // Obtenir le signer (admin)
      const [adminSigner] = await hre.ethers.getSigners();
      console.log(`👤 Admin address: ${await adminSigner.getAddress()}`);

      // Créer l'instance du contrat
      if (!contractAddress) {
        throw new Error('RALIZ contract address not found in environment variables');
      }

      const ralizContract = createRalizContract(contractAddress, adminSigner);

      // Vérifier si l'organisateur est autorisé
      const isAuthorized = await ralizContract.authorizedOrganizers(organizerAddress);
      
      if (!isAuthorized) {
        console.log('⚠️  Organizer is not authorized (nothing to revoke)');
        return;
      }

      console.log('⚠️  WARNING: This will revoke the organizer\'s ability to create raffles');
      console.log('   The organizer will no longer be able to create new raffles');
      console.log('   Existing raffles will not be affected');

      // Révoquer l'autorisation
      console.log('⏳ Sending revocation transaction...');
      const tx = await ralizContract.revokeOrganizer(organizerAddress);
      console.log(`📝 Transaction hash: ${tx.hash}`);

      // Attendre la confirmation
      console.log('⏳ Waiting for transaction confirmation...');
      const receipt = await tx.wait();

      if (receipt && receipt.status === 1) {
        console.log('✅ Success! Organizer authorization revoked');
        console.log(`🎉 Transaction confirmed in block: ${receipt.blockNumber}`);
        console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
        console.log('');
        console.log('📋 Summary:');
        console.log(`   👤 Organizer: ${organizerAddress}`);
        console.log('   🔐 Status: ❌ NO LONGER AUTHORIZED');
        console.log('   📝 This organizer cannot create new raffles');
      } else {
        console.error('❌ Transaction failed');
        process.exit(1);
      }

    } catch (error) {
      console.error('❌ Error revoking organizer authorization:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Not authorized organizer')) {
          console.log('💡 Tip: Make sure you are using an admin wallet that owns the contract');
        } else if (error.message.includes('insufficient funds')) {
          console.log('💡 Tip: Make sure your admin wallet has enough CHZ for gas fees');
        }
      }
      
      process.exit(1);
    }
  }); 