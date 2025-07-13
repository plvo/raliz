import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, RPC_CONFIG } from '../config/web3-config';
import { type MockFanToken, type Raliz, createMockFanTokenContract, createRalizContract } from '../index';

export interface RaffleInfo {
  title: string;
  description: string;
  participationFee: bigint;
  requiredFanToken: string;
  minimumFanTokens: bigint;
  organizer: string;
}

export interface RaffleStatus {
  startDate: bigint;
  endDate: bigint;
  maxWinners: bigint;
  maxParticipants: bigint;
  participantCount: bigint;
  isActive: boolean;
  winnersDrawn: boolean;
}

export interface CreateRaffleParams {
    title: string;
    description: string;
    participationFee: string; // En CHZ (string pour éviter les erreurs de précision)
    requiredFanToken: string; // Adresse du token requis
    minimumFanTokens: string; // Minimum requis
    maxWinners: number;
    endDate: Date;
    maxParticipants: number;
}

export class BlockchainService {
    private readonly provider: ethers.JsonRpcProvider;
    private readonly signer: ethers.Signer;

    private readonly ralizContract: Raliz;

    constructor(provider: ethers.JsonRpcProvider, signer: ethers.Signer, ralizContractAddress: string | null) {
        this.provider = provider;
        this.signer = signer;

        if (ralizContractAddress) {
            this.ralizContract = createRalizContract(ralizContractAddress, this.provider);
        } else {
            if (!CONTRACT_ADDRESSES.RALIZ || CONTRACT_ADDRESSES.RALIZ === '') {
                throw new Error('RALIZ contract address is not defined');
            }
            this.ralizContract = createRalizContract(CONTRACT_ADDRESSES.RALIZ as string, this.provider);
        }
    }

    // ===== HELPER METHODS =====
    private getProvider(): ethers.JsonRpcProvider {
        return new ethers.JsonRpcProvider(RPC_CONFIG.url);
    }

    private getContract(signerOrProvider?: ethers.Signer | ethers.Provider): Raliz {
        const provider = signerOrProvider || this.getProvider();
        return createRalizContract(CONTRACT_ADDRESSES.RALIZ as string, provider);
    }

    private getTokenContract(tokenAddress: string, signerOrProvider?: ethers.Signer | ethers.Provider): MockFanToken {
        const provider = signerOrProvider || this.getProvider();
        return createMockFanTokenContract(tokenAddress, provider);
    }

    // ===== READ METHODS =====

    /**
     * Récupère les informations d'une raffle
     */
    async getRaffleInfo(raffleId: number): Promise<RaffleInfo> {
        const contract = this.getContract();
        const result = await contract.getRaffleInfo(raffleId);

        return {
            title: result[0],
            description: result[1],
            participationFee: result[2],
            requiredFanToken: result[3],
            minimumFanTokens: result[4],
            organizer: result[5],
        };
    }

    /**
     * Récupère le statut d'une raffle
     */
    async getRaffleStatus(raffleId: number): Promise<RaffleStatus> {
        const contract = this.getContract();
        const result = await contract.getRaffleStatus(raffleId);

        return {
            startDate: result[0],
            endDate: result[1],
            maxWinners: result[2],
            maxParticipants: result[3],
            participantCount: result[4],
            isActive: result[5],
            winnersDrawn: result[6],
        };
    }

    /**
     * Vérifie si un utilisateur est éligible pour participer
     */
    async isEligibleToParticipate(raffleId: number, userAddress: string): Promise<boolean> {
        const contract = this.getContract();
        const result = await contract.isEligibleToParticipate(raffleId, userAddress);
        return result[0]; // Premier élément du tuple = eligible
    }

    /**
     * Vérifie si un utilisateur a déjà participé
     */
    async hasParticipated(raffleId: number, userAddress: string): Promise<boolean> {
        const contract = this.getContract();
        return await contract.hasParticipated(raffleId, userAddress);
    }

    /**
     * Récupère le nombre total de raffles
     */
    async getRaffleCount(): Promise<number> {
        const contract = this.getContract();
        const count = await contract.getTotalRaffles();
        return Number(count);
    }

    /**
     * Récupère les participants d'une raffle
     */
    async getParticipants(raffleId: number): Promise<string[]> {
        const contract = this.getContract();
        return await contract.getParticipants(raffleId);
    }

    /**
     * Récupère les gagnants d'une raffle
     */
    async getWinners(raffleId: number): Promise<string[]> {
        const contract = this.getContract();
        return await contract.getWinners(raffleId);
    }

    /**
     * Récupère la balance de fan tokens d'un utilisateur
     */
    async getFanTokenBalance(userAddress: string, tokenAddress: string): Promise<{
        balance: bigint;
        decimals: number;
        symbol: string;
        name: string;
    }> {
        const contract = this.getTokenContract(tokenAddress);

        const [balance, decimals, symbol, name] = await Promise.all([
            contract.balanceOf(userAddress),
            contract.decimals(),
            contract.symbol(),
            contract.name(),
        ]);

        return {
            balance,
            decimals: Number(decimals),
            symbol,
            name,
        };
    }

    // ===== WRITE METHODS (nécessitent un signer) =====

    /**
     * Crée une nouvelle raffle
     * Note: L'organisateur doit être autorisé au préalable par un admin
     */
    async createRaffle(params: CreateRaffleParams, signer: ethers.Signer): Promise<{
        transaction: ethers.ContractTransactionResponse;
        raffleId?: number;
    }> {
        const contract = createRalizContract(CONTRACT_ADDRESSES.RALIZ as string, signer);

        const participationFeeWei = ethers.parseEther(params.participationFee);
        const minimumFanTokensWei = ethers.parseUnits(params.minimumFanTokens, 18);
        const endDateTimestamp = Math.floor(params.endDate.getTime() / 1000);
        const startDateTimestamp = Math.floor(Date.now() / 1000);

        const tx = await contract.createRaffle(
            params.title,
            params.description,
            participationFeeWei,
            params.requiredFanToken,
            minimumFanTokensWei,
            startDateTimestamp,
            endDateTimestamp,
            params.maxWinners,
            params.maxParticipants
        );

        return { transaction: tx };
    }

    /**
     * Participe à une raffle
     */
    async participateInRaffle(
        raffleId: number,
        participationFee: string,
        signer: ethers.Signer
    ): Promise<ethers.ContractTransactionResponse> {
        const contract = createRalizContract(CONTRACT_ADDRESSES.RALIZ as string, signer);
        const feeWei = ethers.parseEther(participationFee);

        return await contract.participate(raffleId, { value: feeWei });
    }

    /**
     * Tire au sort les gagnants manuellement (organizer seulement)
     */
    async drawWinners(raffleId: number, winners: string[], signer: ethers.Signer): Promise<ethers.ContractTransactionResponse> {
        const contract = createRalizContract(CONTRACT_ADDRESSES.RALIZ as string, signer);
        return await contract.drawWinners(raffleId, winners);
    }

    /**
     * Tire au sort les gagnants automatiquement on-chain (organizer seulement)
     * Utilise l'algorithme pseudo-aléatoire intégré dans le smart contract
     */
    async drawWinnersAutomatically(raffleId: number, signer: ethers.Signer): Promise<ethers.ContractTransactionResponse> {
        const contract = createRalizContract(CONTRACT_ADDRESSES.RALIZ as string, signer);
        return await contract.drawWinnersAutomatically(raffleId);
    }

    // ===== SUPER ADMIN ONLY METHODS =====
    // 🚨 ATTENTION: Ces méthodes sont réservées au super admin (owner du contrat)
    // Les organisateurs ne peuvent PAS les utiliser !

    /**
     * Retire les fonds d'une raffle (SUPER ADMIN SEULEMENT)
     * ⚠️ Cette méthode ne doit être utilisée que par le super admin pour la gestion du pool commun
     * Les organisateurs ne peuvent pas retirer les fonds directement
     */
    async withdrawRaffleFunds(raffleId: number, signer: ethers.Signer): Promise<ethers.ContractTransactionResponse> {
        const contract = createRalizContract(CONTRACT_ADDRESSES.RALIZ as string, signer);
        return await contract.withdrawRaffleFunds(raffleId);
    }

    /**
     * Retire tous les fonds CHZ du pool commun (SUPER ADMIN SEULEMENT)
     * ⚠️ Cette méthode retire tous les fonds pour redistribution aux participants du TOP 3 des équipes
     * Les organisateurs ne peuvent pas retirer les fonds directement
     */
    async withdrawAllCHZ(signer: ethers.Signer): Promise<ethers.ContractTransactionResponse> {
        const contract = createRalizContract(CONTRACT_ADDRESSES.RALIZ as string, signer);
        return await contract.withdrawCHZ();
    }

    // ===== ORGANIZER AUTHORIZATION METHODS =====

    /**
     * Vérifie si une adresse est autorisée comme organisateur
     */
    async isAuthorizedOrganizer(organizerAddress: string): Promise<boolean> {
        const contract = this.getContract();
        return await contract.authorizedOrganizers(organizerAddress);
    }

    /**
     * Autorise un nouvel organisateur (admin seulement)
     */
    async authorizeOrganizer(organizerAddress: string, adminSigner: ethers.Signer): Promise<ethers.ContractTransactionResponse> {
        const contract = createRalizContract(CONTRACT_ADDRESSES.RALIZ as string, adminSigner);
        return await contract.authorizeOrganizer(organizerAddress);
    }

    /**
     * Révoque l'autorisation d'un organisateur (admin seulement)
     */
    async revokeOrganizer(organizerAddress: string, adminSigner: ethers.Signer): Promise<ethers.ContractTransactionResponse> {
        const contract = createRalizContract(CONTRACT_ADDRESSES.RALIZ as string, adminSigner);
        return await contract.revokeOrganizer(organizerAddress);
    }

    // ===== UTILITY METHODS =====

    /**
     * Formate une valeur wei en CHZ avec décimales
     */
    formatCHZ(weiValue: bigint, decimals = 4): string {
        return ethers.formatEther(weiValue);
    }

    /**
     * Parse une valeur CHZ en wei
     */
    parseCHZ(chzValue: string): bigint {
        return ethers.parseEther(chzValue);
    }

    /**
     * Formate les fan tokens selon leurs décimales
     */
    formatTokens(value: bigint, decimals: number, displayDecimals = 2): string {
        const formatted = ethers.formatUnits(value, decimals);
        const number = Number.parseFloat(formatted);
        return number.toFixed(displayDecimals);
    }
}
