import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, RPC_CONFIG } from '../config/web3-config';
import { createRalizContract, createMockFanTokenContract, type Raliz, type MockFanToken } from '../index';

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
}

export class BlockchainService {
    private readonly provider: ethers.JsonRpcProvider;
    private readonly signer: ethers.Signer;

    private readonly ralizContract: Raliz;
    private readonly psgTokenContract: MockFanToken;
    private readonly barTokenContract: MockFanToken;
    private readonly cityTokenContract: MockFanToken;

    constructor(provider: ethers.JsonRpcProvider, signer: ethers.Signer) {
        this.provider = provider;
        this.signer = signer;

        this.ralizContract = createRalizContract(CONTRACT_ADDRESSES.RALIZ, this.provider);
        this.psgTokenContract = createMockFanTokenContract(CONTRACT_ADDRESSES.PSG_TOKEN, this.provider);
        this.barTokenContract = createMockFanTokenContract(CONTRACT_ADDRESSES.BAR_TOKEN, this.provider);
        this.cityTokenContract = createMockFanTokenContract(CONTRACT_ADDRESSES.CITY_TOKEN, this.provider);
    }

    // ===== HELPER METHODS =====
    private getProvider(): ethers.JsonRpcProvider {
        return new ethers.JsonRpcProvider(RPC_CONFIG.url);
    }

    private getContract(signerOrProvider?: ethers.Signer | ethers.Provider): Raliz {
        const provider = signerOrProvider || this.getProvider();
        return createRalizContract(CONTRACT_ADDRESSES.RALIZ, provider);
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
     */
    async createRaffle(params: CreateRaffleParams, signer: ethers.Signer): Promise<{
        transaction: ethers.ContractTransactionResponse;
        raffleId?: number;
    }> {
        const contract = createRalizContract(CONTRACT_ADDRESSES.RALIZ, signer);

        const participationFeeWei = ethers.parseEther(params.participationFee);
        const minimumFanTokensWei = ethers.parseUnits(params.minimumFanTokens, 18);
        const endDateTimestamp = Math.floor(params.endDate.getTime() / 1000);
        const startDateTimestamp = Math.floor(Date.now() / 1000);

        // ✅ TypeScript valide automatiquement les paramètres !
        const tx = await contract.createRaffle(
            params.title,
            params.description,
            participationFeeWei,
            params.requiredFanToken,
            minimumFanTokensWei,
            startDateTimestamp,
            endDateTimestamp,
            params.maxWinners,
            100 // maxParticipants par défaut
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
        const contract = createRalizContract(CONTRACT_ADDRESSES.RALIZ, signer);
        const feeWei = ethers.parseEther(participationFee);

        return await contract.participate(raffleId, { value: feeWei });
    }

    /**
     * Tire au sort les gagnants manuellement (organizer seulement)
     */
    async drawWinners(raffleId: number, winners: string[], signer: ethers.Signer): Promise<ethers.ContractTransactionResponse> {
        const contract = createRalizContract(CONTRACT_ADDRESSES.RALIZ, signer);
        return await contract.drawWinners(raffleId, winners);
    }

    /**
     * Tire au sort les gagnants automatiquement on-chain (organizer seulement)
     * Utilise l'algorithme pseudo-aléatoire intégré dans le smart contract
     * NOTE: Types seront mis à jour après recompilation des contrats
     */
    async drawWinnersAutomatically(raffleId: number, signer: ethers.Signer): Promise<ethers.ContractTransactionResponse> {
        const contract = createRalizContract(CONTRACT_ADDRESSES.RALIZ, signer);
        // @ts-ignore - Fonction ajoutée au contrat, types seront regénérés après compilation
        return await contract.drawWinnersAutomatically(raffleId);
    }

    /**
     * Retire les fonds d'une raffle (organizer seulement)
     */
    async withdrawRaffleFunds(raffleId: number, signer: ethers.Signer): Promise<ethers.ContractTransactionResponse> {
        const contract = createRalizContract(CONTRACT_ADDRESSES.RALIZ, signer);
        return await contract.withdrawRaffleFunds(raffleId);
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