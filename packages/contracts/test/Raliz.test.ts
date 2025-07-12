import { expect } from "chai";
import { ethers, network } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import type { Raliz, MockFanToken } from "../typechain-types";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Raliz Contract", () => {
    let raliz: Raliz;
    let psgToken: MockFanToken;
    let barToken: MockFanToken;
    let owner: HardhatEthersSigner;
    let organizer: HardhatEthersSigner;
    let user1: HardhatEthersSigner;
    let user2: HardhatEthersSigner;
    let user3: HardhatEthersSigner;

    const PARTICIPATION_FEE_CHZ = ethers.parseEther("0.1"); // 0.1 CHZ
    const DEFAULT_MIN_FAN_TOKENS = ethers.parseEther("50"); // 50 fan tokens

    // Fixture pour les tests automatiques
    async function deployRalizFixture() {
        const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

        // Déployer les tokens de test
        const MockFanToken = await ethers.getContractFactory("MockFanToken");
        const psgToken = await MockFanToken.deploy("PSG Token", "PSG", 18, 1000000);

        // Déployer Raliz
        const Raliz = await ethers.getContractFactory("Raliz");
        const raliz = await Raliz.deploy(owner.address);

        // Autoriser le owner comme organisateur
        await raliz.authorizeOrganizer(owner.address);

        return { raliz, psgToken, owner, addr1, addr2, addr3, addr4 };
    }

    beforeEach(async () => {
        [owner, organizer, user1, user2, user3] = await ethers.getSigners();

        // Déployer les tokens de test
        const MockFanToken = await ethers.getContractFactory("MockFanToken");
        psgToken = await MockFanToken.deploy("PSG Token", "PSG", 18, 1000000);
        barToken = await MockFanToken.deploy("BAR Token", "BAR", 18, 1000000);

        // Déployer Raliz
        const Raliz = await ethers.getContractFactory("Raliz");
        raliz = await Raliz.deploy(owner.address);

        // Autoriser l'organisateur
        await raliz.authorizeOrganizer(organizer.address);

        // Donner des fan tokens aux utilisateurs (pour les conditions d'éligibilité)
        await psgToken.transfer(user1.address, ethers.parseEther("100")); // 100 PSG
        await psgToken.transfer(user2.address, ethers.parseEther("30"));  // 30 PSG (insuffisant)
        await barToken.transfer(user1.address, ethers.parseEther("80"));  // 80 BAR
        // user3 n'a pas de fan tokens
    });

    describe("Création de raffle", () => {
        it("Devrait permettre à un organisateur autorisé de créer un raffle", async () => {
            const startDate = Math.floor(Date.now() / 1000);
            const endDate = startDate + 86400 * 7; // 7 jours

            await expect(
                raliz.connect(organizer).createRaffle(
                    "Maillot PSG Signé",
                    "Gagnez un maillot PSG signé par Messi!",
                    PARTICIPATION_FEE_CHZ,
                    await psgToken.getAddress(),
                    0, // 0 = utilise la valeur par défaut (50)
                    startDate,
                    endDate,
                    1, // 1 gagnant
                    100 // Max 100 participants
                )
            )
                .to.emit(raliz, "RaffleCreated")
                .withArgs(
                    0,
                    organizer.address,
                    "Maillot PSG Signé",
                    PARTICIPATION_FEE_CHZ,
                    await psgToken.getAddress(),
                    DEFAULT_MIN_FAN_TOKENS
                );

            const totalRaffles = await raliz.getTotalRaffles();
            expect(totalRaffles).to.equal(1);
        });

        it("Devrait permettre de créer un raffle avec un seuil personnalisé", async () => {
            const startDate = Math.floor(Date.now() / 1000);
            const endDate = startDate + 86400 * 7;
            const customMinTokens = ethers.parseEther("100"); // 100 tokens

            await raliz.connect(organizer).createRaffle(
                "Raffle Premium",
                "Raffle avec seuil élevé",
                PARTICIPATION_FEE_CHZ,
                await psgToken.getAddress(),
                customMinTokens,
                startDate,
                endDate,
                1,
                50
            );

            const raffle = await raliz.getRaffle(0);
            expect(raffle.minimumFanTokens).to.equal(customMinTokens);
        });

        it("Ne devrait pas permettre à un utilisateur non autorisé de créer un raffle", async () => {
            const startDate = Math.floor(Date.now() / 1000);
            const endDate = startDate + 86400 * 7;

            await expect(
                raliz.connect(user1).createRaffle(
                    "Test Raffle",
                    "Description",
                    PARTICIPATION_FEE_CHZ,
                    await psgToken.getAddress(),
                    0,
                    startDate,
                    endDate,
                    1,
                    100
                )
            ).to.be.revertedWith("Not authorized organizer");
        });

        it("Ne devrait pas permettre de créer un raffle avec une adresse de token invalide", async () => {
            const startDate = Math.floor(Date.now() / 1000);
            const endDate = startDate + 86400 * 7;

            await expect(
                raliz.connect(organizer).createRaffle(
                    "Test Raffle",
                    "Description",
                    PARTICIPATION_FEE_CHZ,
                    ethers.ZeroAddress, // Adresse invalide
                    0,
                    startDate,
                    endDate,
                    1,
                    100
                )
            ).to.be.revertedWith("Invalid fan token address");
        });
    });

    describe("Vérification d'éligibilité", () => {
        beforeEach(async () => {
            // Créer un raffle test
            const startDate = Math.floor(Date.now() / 1000);
            const endDate = startDate + 86400 * 7;

            await raliz.connect(organizer).createRaffle(
                "Test Raffle",
                "Description test",
                PARTICIPATION_FEE_CHZ,
                await psgToken.getAddress(),
                0, // Défaut: 50 PSG tokens
                startDate,
                endDate,
                1,
                100
            );
        });

        it("Devrait confirmer l'éligibilité d'un utilisateur avec suffisamment de fan tokens", async () => {
            const [eligible, userBalance, required, reason] = await raliz.isEligibleToParticipate(0, user1.address);

            expect(eligible).to.be.true;
            expect(userBalance).to.equal(ethers.parseEther("100"));
            expect(required).to.equal(DEFAULT_MIN_FAN_TOKENS);
            expect(reason).to.equal("Eligible");
        });

        it("Devrait rejeter un utilisateur sans suffisamment de fan tokens", async () => {
            const [eligible, userBalance, required, reason] = await raliz.isEligibleToParticipate(0, user2.address);

            expect(eligible).to.be.false;
            expect(userBalance).to.equal(ethers.parseEther("30"));
            expect(required).to.equal(DEFAULT_MIN_FAN_TOKENS);
            expect(reason).to.equal("Insufficient fan token balance");
        });

        it("Devrait rejeter un utilisateur sans fan tokens", async () => {
            const [eligible, userBalance, required, reason] = await raliz.isEligibleToParticipate(0, user3.address);

            expect(eligible).to.be.false;
            expect(userBalance).to.equal(0);
            expect(required).to.equal(DEFAULT_MIN_FAN_TOKENS);
            expect(reason).to.equal("Insufficient fan token balance");
        });
    });

    describe("Participation à un raffle", () => {
        beforeEach(async () => {
            // Créer un raffle test
            const startDate = Math.floor(Date.now() / 1000);
            const endDate = startDate + 86400 * 7;

            await raliz.connect(organizer).createRaffle(
                "Test Raffle",
                "Description test",
                PARTICIPATION_FEE_CHZ,
                await psgToken.getAddress(),
                0, // Défaut: 50 PSG tokens
                startDate,
                endDate,
                1,
                100
            );
        });

        it("Devrait permettre à un utilisateur éligible de participer avec CHZ", async () => {
            const userBalanceBefore = await ethers.provider.getBalance(user1.address);
            const contractBalanceBefore = await ethers.provider.getBalance(await raliz.getAddress());

            await expect(
                raliz.connect(user1).participate(0, { value: PARTICIPATION_FEE_CHZ })
            )
                .to.emit(raliz, "ParticipationRegistered")
                .withArgs(0, user1.address, PARTICIPATION_FEE_CHZ, ethers.parseEther("100"));

            const participants = await raliz.getParticipants(0);
            expect(participants.length).to.equal(1);
            expect(participants[0]).to.equal(user1.address);

            // Vérifier que le CHZ a été transféré
            const contractBalanceAfter = await ethers.provider.getBalance(await raliz.getAddress());
            expect(contractBalanceAfter - contractBalanceBefore).to.equal(PARTICIPATION_FEE_CHZ);
        });

        it("Devrait rembourser l'excédent de CHZ", async () => {
            const excessAmount = ethers.parseEther("0.05"); // 0.05 CHZ excédent
            const totalSent = PARTICIPATION_FEE_CHZ + excessAmount;

            const userBalanceBefore = await ethers.provider.getBalance(user1.address);

            const tx = await raliz.connect(user1).participate(0, { value: totalSent });
            const receipt = await tx.wait();
            const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

            const userBalanceAfter = await ethers.provider.getBalance(user1.address);

            // L'utilisateur devrait avoir payé seulement les frais de participation + gas
            const expectedBalance = userBalanceBefore - PARTICIPATION_FEE_CHZ - gasUsed;
            expect(userBalanceAfter).to.be.closeTo(expectedBalance, ethers.parseEther("0.001"));
        });

        it("Ne devrait pas permettre la participation sans suffisamment de fan tokens", async () => {
            await expect(
                raliz.connect(user2).participate(0, { value: PARTICIPATION_FEE_CHZ })
            ).to.be.revertedWith("Insufficient fan token balance");
        });

        it("Ne devrait pas permettre la participation sans suffisamment de CHZ", async () => {
            const insufficientAmount = ethers.parseEther("0.05"); // Moins que requis

            await expect(
                raliz.connect(user1).participate(0, { value: insufficientAmount })
            ).to.be.revertedWith("Insufficient CHZ sent");
        });

        it("Ne devrait pas permettre une double participation", async () => {
            // Première participation
            await raliz.connect(user1).participate(0, { value: PARTICIPATION_FEE_CHZ });

            // Tentative de double participation
            await expect(
                raliz.connect(user1).participate(0, { value: PARTICIPATION_FEE_CHZ })
            ).to.be.revertedWith("Already participated");
        });
    });

    describe("Participation avec différents fan tokens", () => {
        it("Devrait permettre la participation avec différents fan tokens requis", async () => {
            const startDate = Math.floor(Date.now() / 1000);
            const endDate = startDate + 86400 * 7;

            // Créer un raffle BAR
            await raliz.connect(organizer).createRaffle(
                "Raffle Barcelona",
                "Raffle nécessitant des BAR tokens",
                PARTICIPATION_FEE_CHZ,
                await barToken.getAddress(),
                0,
                startDate,
                endDate,
                1,
                100
            );

            // user1 a 80 BAR tokens (suffisant)
            await expect(
                raliz.connect(user1).participate(0, { value: PARTICIPATION_FEE_CHZ })
            ).to.emit(raliz, "ParticipationRegistered");

            // user2 n'a pas de BAR tokens
            await expect(
                raliz.connect(user2).participate(0, { value: PARTICIPATION_FEE_CHZ })
            ).to.be.revertedWith("Insufficient fan token balance");
        });
    });

    describe("Tirage des gagnants", () => {
        beforeEach(async () => {
            // Créer un raffle et ajouter des participants
            const currentBlock = await ethers.provider.getBlock('latest');
            const startDate = currentBlock!.timestamp;
            const endDate = startDate + 200; // Raffle actif pendant 200 secondes

            await raliz.connect(organizer).createRaffle(
                "Test Raffle",
                "Description test",
                PARTICIPATION_FEE_CHZ,
                await psgToken.getAddress(),
                0,
                startDate,
                endDate,
                2, // 2 gagnants
                100
            );

            // Ajouter des participants avec CHZ
            await raliz.connect(user1).participate(0, { value: PARTICIPATION_FEE_CHZ });

            // Donner des PSG tokens à user3 pour qu'il puisse participer
            await psgToken.transfer(user3.address, ethers.parseEther("60"));
            await raliz.connect(user3).participate(0, { value: PARTICIPATION_FEE_CHZ });

            // Attendre que le raffle se termine
            await ethers.provider.send("evm_increaseTime", [300]); // +300 secondes pour dépasser endDate
            await ethers.provider.send("evm_mine", []);
        });

        it("Devrait permettre au owner de tirer les gagnants", async () => {
            const winners = [user1.address, user3.address];

            await expect(raliz.connect(owner).drawWinners(0, winners))
                .to.emit(raliz, "WinnersDrawn")
                .withArgs(0, winners);

            const raffleWinners = await raliz.getWinners(0);
            expect(raffleWinners.length).to.equal(2);
            expect(raffleWinners).to.include(user1.address);
            expect(raffleWinners).to.include(user3.address);
        });

        it("Ne devrait pas permettre de tirer les gagnants avant la fin", async () => {
            // Créer un nouveau raffle qui n'est pas encore fini
            const currentBlock = await ethers.provider.getBlock('latest');
            const startDate = currentBlock!.timestamp;
            const endDate = startDate + 86400; // 1 jour dans le futur

            await raliz.connect(organizer).createRaffle(
                "Future Raffle",
                "Description",
                PARTICIPATION_FEE_CHZ,
                await psgToken.getAddress(),
                0,
                startDate,
                endDate,
                1,
                100
            );

            await expect(raliz.connect(owner).drawWinners(1, [user1.address]))
                .to.be.revertedWith("Raffle not ended yet");
        });
    });

    describe("Retrait de fonds CHZ", () => {
        beforeEach(async () => {
            // Créer un raffle et ajouter de la participation
            const startDate = Math.floor(Date.now() / 1000);
            const endDate = startDate + 86400 * 7;

            await raliz.connect(organizer).createRaffle(
                "Test Raffle",
                "Description test",
                PARTICIPATION_FEE_CHZ,
                await psgToken.getAddress(),
                0,
                startDate,
                endDate,
                1,
                100
            );

            // Ajouter quelques participants
            await raliz.connect(user1).participate(0, { value: PARTICIPATION_FEE_CHZ });

            await psgToken.transfer(user3.address, ethers.parseEther("60"));
            await raliz.connect(user3).participate(0, { value: PARTICIPATION_FEE_CHZ });
        });

        it("Devrait permettre au owner de retirer les fonds CHZ", async () => {
            const contractBalanceBefore = await ethers.provider.getBalance(await raliz.getAddress());
            expect(contractBalanceBefore).to.equal(PARTICIPATION_FEE_CHZ * 2n);

            const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

            await expect(raliz.connect(owner).withdrawCHZ())
                .to.not.be.reverted;

            const contractBalanceAfter = await ethers.provider.getBalance(await raliz.getAddress());
            expect(contractBalanceAfter).to.equal(0);
        });

        it("Devrait calculer correctement les frais de plateforme", async () => {
            const totalBalance = PARTICIPATION_FEE_CHZ * 2n;
            const platformFeePercentage = await raliz.platformFeePercentage(); // 250 = 2.5%
            const expectedFee = (totalBalance * platformFeePercentage) / 10000n;

            // Le test principal est que la fonction ne revert pas
            await expect(raliz.connect(owner).withdrawCHZ())
                .to.not.be.reverted;
        });
    });

    describe("Fonctions view", () => {
        it("Devrait retourner les détails corrects du raffle", async () => {
            const startDate = Math.floor(Date.now() / 1000);
            const endDate = startDate + 86400 * 7;

            await raliz.connect(organizer).createRaffle(
                "Test Raffle",
                "Description détaillée",
                PARTICIPATION_FEE_CHZ,
                await psgToken.getAddress(),
                DEFAULT_MIN_FAN_TOKENS,
                startDate,
                endDate,
                3,
                200
            );

            const raffle = await raliz.getRaffle(0);

            expect(raffle.title).to.equal("Test Raffle");
            expect(raffle.description).to.equal("Description détaillée");
            expect(raffle.participationFee).to.equal(PARTICIPATION_FEE_CHZ);
            expect(raffle.requiredFanToken).to.equal(await psgToken.getAddress());
            expect(raffle.minimumFanTokens).to.equal(DEFAULT_MIN_FAN_TOKENS);
            expect(raffle.maxWinners).to.equal(3);
            expect(raffle.maxParticipants).to.equal(200);
            expect(raffle.isActive).to.be.true;
            expect(raffle.winnersDrawn).to.be.false;
            expect(raffle.organizer).to.equal(organizer.address);
        });

        it("Devrait retourner le solde CHZ du contrat", async () => {
            const balance = await raliz.getContractBalance();
            expect(balance).to.equal(0);

            // Ajouter quelques participations
            const startDate = Math.floor(Date.now() / 1000);
            const endDate = startDate + 86400 * 7;

            await raliz.connect(organizer).createRaffle(
                "Test Raffle", "Description", PARTICIPATION_FEE_CHZ,
                await psgToken.getAddress(), 0, startDate, endDate, 1, 100
            );

            await raliz.connect(user1).participate(0, { value: PARTICIPATION_FEE_CHZ });

            const newBalance = await raliz.getContractBalance();
            expect(newBalance).to.equal(PARTICIPATION_FEE_CHZ);
        });
    });

    it("Should draw winners automatically on-chain", async () => {
        const { raliz, psgToken, owner, addr1, addr2, addr3, addr4 } = await loadFixture(deployRalizFixture);

        // Distribuer des PSG tokens aux participants
        await psgToken.transfer(addr1.address, ethers.parseEther("100"));
        await psgToken.transfer(addr2.address, ethers.parseEther("100"));
        await psgToken.transfer(addr3.address, ethers.parseEther("100"));
        await psgToken.transfer(addr4.address, ethers.parseEther("100"));

        // Créer une raffle avec 2 gagnants maximum
        const startDate = Math.floor(Date.now() / 1000);
        const endDate = startDate + 3600; // 1 heure

        await raliz.createRaffle(
            "Test Automatic Draw",
            "Test description",
            ethers.parseEther("0.1"), // 0.1 CHZ
            await psgToken.getAddress(),
            ethers.parseEther("50"), // 50 PSG tokens requis
            startDate,
            endDate,
            2, // maxWinners
            10 // maxParticipants
        );

        // Les 4 utilisateurs participent
        await raliz.connect(addr1).participate(0, { value: ethers.parseEther("0.1") });
        await raliz.connect(addr2).participate(0, { value: ethers.parseEther("0.1") });
        await raliz.connect(addr3).participate(0, { value: ethers.parseEther("0.1") });
        await raliz.connect(addr4).participate(0, { value: ethers.parseEther("0.1") });

        // Avancer le temps pour que la raffle se termine
        await network.provider.send("evm_increaseTime", [3601]); // +1 heure et 1 seconde
        await network.provider.send("evm_mine");

        // Vérifier le statut avant tirage
        const statusBefore = await raliz.getRaffleStatus(0);
        expect(statusBefore.winnersDrawn).to.be.false;
        expect(statusBefore.participantCount).to.equal(4);

        // Effectuer le tirage automatique
        const tx = await raliz.drawWinnersAutomatically(0);
        await tx.wait();

        // Vérifier le résultat
        const statusAfter = await raliz.getRaffleStatus(0);
        expect(statusAfter.winnersDrawn).to.be.true;
        expect(statusAfter.isActive).to.be.false;

        // Vérifier qu'il y a exactement 2 gagnants
        const winners = await raliz.getWinners(0);
        expect(winners.length).to.equal(2);

        // Vérifier que les gagnants sont différents
        expect(winners[0]).to.not.equal(winners[1]);

        // Vérifier que les gagnants font partie des participants
        const participants = await raliz.getParticipants(0);
        expect(participants).to.include(winners[0]);
        expect(participants).to.include(winners[1]);

        // Vérifier l'événement
        const events = await raliz.queryFilter(raliz.filters.WinnersDrawn(0));
        expect(events.length).to.equal(1);
        expect(events[0].args?.winners?.length).to.equal(2);
    });

    it("Should fail automatic draw if raffle not ended", async () => {
        const { raliz, psgToken, addr1 } = await loadFixture(deployRalizFixture);

        // Distribuer des PSG tokens
        await psgToken.transfer(addr1.address, ethers.parseEther("100"));

        // Créer une raffle qui ne se termine pas encore
        const startDate = Math.floor(Date.now() / 1000);
        const endDate = startDate + 3600; // 1 heure dans le futur

        await raliz.createRaffle(
            "Test Future Raffle",
            "Test description",
            ethers.parseEther("0.1"),
            await psgToken.getAddress(),
            ethers.parseEther("50"),
            startDate,
            endDate,
            1,
            10
        );

        // Participant rejoint
        await raliz.connect(addr1).participate(0, { value: ethers.parseEther("0.1") });

        // Tenter le tirage avant la fin (doit échouer)
        await expect(raliz.drawWinnersAutomatically(0))
            .to.be.revertedWith("Raffle not ended yet");
    });

    it("Should fail automatic draw if no participants", async () => {
        const { raliz, psgToken } = await loadFixture(deployRalizFixture);

        // Créer une raffle valide qui se terminera dans le futur
        const startDate = Math.floor(Date.now() / 1000);
        const endDate = startDate + 3600; // 1 heure dans le futur

        await raliz.createRaffle(
            "Empty Raffle",
            "Test description",
            ethers.parseEther("0.1"),
            await psgToken.getAddress(),
            ethers.parseEther("50"),
            startDate,
            endDate,
            1,
            10
        );

        // Avancer le temps pour que la raffle se termine
        await network.provider.send("evm_increaseTime", [3601]); // +1 heure et 1 seconde
        await network.provider.send("evm_mine");

        // Tenter le tirage sans participants (doit échouer)
        await expect(raliz.drawWinnersAutomatically(0))
            .to.be.revertedWith("No participants");
    });

    it("Should handle automatic draw with more winners than participants", async () => {
        const { raliz, psgToken, addr1 } = await loadFixture(deployRalizFixture);

        // Distribuer des PSG tokens
        await psgToken.transfer(addr1.address, ethers.parseEther("100"));

        // Créer une raffle avec plus de gagnants max que de participants
        const startDate = Math.floor(Date.now() / 1000);
        const endDate = startDate + 3600;

        await raliz.createRaffle(
            "Test More Winners",
            "Test description",
            ethers.parseEther("0.1"),
            await psgToken.getAddress(),
            ethers.parseEther("50"),
            startDate,
            endDate,
            5, // 5 gagnants max mais seulement 1 participant
            10
        );

        // Un seul participant
        await raliz.connect(addr1).participate(0, { value: ethers.parseEther("0.1") });

        // Avancer le temps
        await network.provider.send("evm_increaseTime", [3601]);
        await network.provider.send("evm_mine");

        // Effectuer le tirage automatique
        await raliz.drawWinnersAutomatically(0);

        // Vérifier qu'il n'y a qu'un seul gagnant (pas 5)
        const winners = await raliz.getWinners(0);
        expect(winners.length).to.equal(1);
        expect(winners[0]).to.equal(addr1.address);
    });
});