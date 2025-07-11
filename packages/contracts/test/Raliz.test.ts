import { expect } from "chai";
import { ethers } from "hardhat";
import type { Raliz, MockFanToken } from "../typechain-types";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Raliz Contract", () => {
    let raliz: Raliz;
    let psgToken: MockFanToken;
    let owner: HardhatEthersSigner;
    let organizer: HardhatEthersSigner;
    let user1: HardhatEthersSigner;
    let user2: HardhatEthersSigner;

    beforeEach(async () => {
        [owner, organizer, user1, user2] = await ethers.getSigners();

        // Déployer le token PSG de test
        const MockFanToken = await ethers.getContractFactory("MockFanToken");
        psgToken = await MockFanToken.deploy("PSG Token", "PSG", 18, 1000000);

        // Déployer Raliz
        const Raliz = await ethers.getContractFactory("Raliz");
        raliz = await Raliz.deploy(owner.address);

        // Autoriser l'organisateur
        await raliz.authorizeOrganizer(organizer.address);

        // Donner des tokens aux utilisateurs
        await psgToken.transfer(user1.address, ethers.parseEther("10000"));
        await psgToken.transfer(user2.address, ethers.parseEther("10000"));
    });

    describe("Création de raffle", () => {
        it("Devrait permettre à un organisateur autorisé de créer un raffle", async () => {
            const startDate = Math.floor(Date.now() / 1000);
            const endDate = startDate + 86400 * 7; // 7 jours

            await expect(
                raliz.connect(organizer).createRaffle(
                    "Maillot PSG Signé",
                    "Gagnez un maillot PSG signé par Messi!",
                    ethers.parseEther("100"), // 100 PSG tokens
                    await psgToken.getAddress(),
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
                    ethers.parseEther("100"),
                    await psgToken.getAddress()
                );

            const totalRaffles = await raliz.getTotalRaffles();
            expect(totalRaffles).to.equal(1);
        });

        it("Ne devrait pas permettre à un utilisateur non autorisé de créer un raffle", async () => {
            const startDate = Math.floor(Date.now() / 1000);
            const endDate = startDate + 86400 * 7;

            await expect(
                raliz.connect(user1).createRaffle(
                    "Test Raffle",
                    "Description",
                    ethers.parseEther("100"),
                    await psgToken.getAddress(),
                    startDate,
                    endDate,
                    1,
                    100
                )
            ).to.be.revertedWith("Not authorized organizer");
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
                ethers.parseEther("100"),
                await psgToken.getAddress(),
                startDate,
                endDate,
                1,
                100
            );
        });

        it("Devrait permettre à un utilisateur de participer avec des tokens", async () => {
            // Approuver les tokens
            await psgToken.connect(user1).approve(await raliz.getAddress(), ethers.parseEther("100"));

            await expect(raliz.connect(user1).participate(0))
                .to.emit(raliz, "ParticipationRegistered")
                .withArgs(0, user1.address, ethers.parseEther("100"));

            const participants = await raliz.getParticipants(0);
            expect(participants.length).to.equal(1);
            expect(participants[0]).to.equal(user1.address);
        });

        it("Ne devrait pas permettre une double participation", async () => {
            // Première participation
            await psgToken.connect(user1).approve(await raliz.getAddress(), ethers.parseEther("200"));
            await raliz.connect(user1).participate(0);

            // Tentative de double participation
            await expect(raliz.connect(user1).participate(0))
                .to.be.revertedWith("Already participated");
        });
    });

    describe("Tirage des gagnants", () => {
        beforeEach(async () => {
            // Créer un raffle et ajouter des participants
            const startDate = Math.floor(Date.now() / 1000) - 100; // Déjà commencé
            const endDate = startDate + 100; // Déjà fini

            await raliz.connect(organizer).createRaffle(
                "Test Raffle",
                "Description test",
                ethers.parseEther("100"),
                await psgToken.getAddress(),
                startDate,
                endDate,
                2, // 2 gagnants
                100
            );

            // Ajouter des participants
            await psgToken.connect(user1).approve(await raliz.getAddress(), ethers.parseEther("100"));
            await psgToken.connect(user2).approve(await raliz.getAddress(), ethers.parseEther("100"));

            await raliz.connect(user1).participate(0);
            await raliz.connect(user2).participate(0);

            // Attendre que le raffle se termine
            await ethers.provider.send("evm_increaseTime", [200]);
            await ethers.provider.send("evm_mine", []);
        });

        it("Devrait permettre au owner de tirer les gagnants", async () => {
            const winners = [user1.address, user2.address];

            await expect(raliz.connect(owner).drawWinners(0, winners))
                .to.emit(raliz, "WinnersDrawn")
                .withArgs(0, winners);

            const raffleWinners = await raliz.getWinners(0);
            expect(raffleWinners.length).to.equal(2);
            expect(raffleWinners).to.include(user1.address);
            expect(raffleWinners).to.include(user2.address);
        });

        it("Ne devrait pas permettre de tirer les gagnants avant la fin", async () => {
            // Créer un nouveau raffle qui n'est pas encore fini
            const startDate = Math.floor(Date.now() / 1000);
            const endDate = startDate + 86400; // 1 jour dans le futur

            await raliz.connect(organizer).createRaffle(
                "Future Raffle",
                "Description",
                ethers.parseEther("100"),
                await psgToken.getAddress(),
                startDate,
                endDate,
                1,
                100
            );

            await expect(raliz.connect(owner).drawWinners(1, [user1.address]))
                .to.be.revertedWith("Raffle not ended yet");
        });
    });
});