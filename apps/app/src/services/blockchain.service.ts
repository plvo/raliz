import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, RPC_CONFIG } from '@/lib/web3-config';

export interface RaffleInfo {
    title: string;
    description: string;
    prizeDescription: string;
    participationFee: bigint;
    requiredFanToken: string;
    minimumFanTokens: bigint;
    maxWinners: bigint;
    organizer: string;
}

export interface RaffleStatus {
    startDate: bigint;
    endDate: bigint;
    status: number; // 0: Active, 1: Ended, 2: Cancelled
    participantCount: bigint;
    totalFunds: bigint;
    winnersDrawn: boolean;
}

export interface CreateRaffleParams {
    title: string;
    description: string;
    prizeDescription: string;
    participationFee: string; // En CHZ (string pour éviter les erreurs de précision)
    requiredFanToken: string; // Adresse du token requis
    minimumFanTokens: string; // Minimum requis
    maxWinners: number;
    endDate: Date;
}

// ABI simplifié du contrat Raliz avec les fonctions principales
const RALIZ_ABI = [
    // Events
    'event RaffleCreated(uint256 indexed raffleId, address indexed organizer, string title, uint256 participationFee, address requiredFanToken, uint256 minimumFanTokens)',
    'event ParticipationRegistered(uint256 indexed raffleId, address indexed participant, uint256 chzPaid, uint256 fanTokenBalance)',

    // Read functions
    'function getRaffleInfo(uint256 raffleId) view returns (string title, string description, string prizeDescription, uint256 participationFee, address requiredFanToken, uint256 minimumFanTokens, uint256 maxWinners, address organizer)',
    'function getRaffleStatus(uint256 raffleId) view returns (uint256 startDate, uint256 endDate, uint8 status, uint256 participantCount, uint256 totalFunds, bool winnersDrawn)',
    'function isEligibleToParticipate(uint256 raffleId, address user) view returns (bool)',
    'function hasParticipated(uint256 raffleId, address user) view returns (bool)',
    'function raffleCount() view returns (uint256)',
    'function getParticipants(uint256 raffleId) view returns (address[])',
    'function getWinners(uint256 raffleId) view returns (address[])',

    // Write functions
    'function createRaffle(string title, string description, string prizeDescription, uint256 participationFee, address requiredFanToken, uint256 minimumFanTokens, uint256 maxWinners, uint256 endDate) returns (uint256)',
    'function participate(uint256 raffleId) payable',
    'function drawWinners(uint256 raffleId)',
    'function withdrawRaffleFunds(uint256 raffleId)',
] as const;

// ABI simplifié pour les tokens ERC20 (PSG, BAR, CITY)
const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function name() view returns (string)',
] as const;

class BlockchainService {
    private readonly provider: ethers.JsonRpcProvider;
    private readonly signer: ethers.Signer;

    private readonly ralizContract: ethers.Contract;
    private readonly psgTokenContract: ethers.Contract;
    private readonly barTokenContract: ethers.Contract;
    private readonly cityTokenContract: ethers.Contract;

    constructor(provider: ethers.JsonRpcProvider, signer: ethers.Signer) {
        this.provider = provider;
        this.signer = signer;

        this.ralizContract = new ethers.Contract(CONTRACT_ADDRESSES.RALIZ, RALIZ_ABI, this.provider);
        this.psgTokenContract = new ethers.Contract(CONTRACT_ADDRESSES.PSG_TOKEN, ERC20_ABI, this.provider);
        this.barTokenContract = new ethers.Contract(CONTRACT_ADDRESSES.BAR_TOKEN, ERC20_ABI, this.provider);
        this.cityTokenContract = new ethers.Contract(CONTRACT_ADDRESSES.CITY_TOKEN, ERC20_ABI, this.provider);
    }

    // ===== HELPER METHODS =====
    private getProvider(): ethers.JsonRpcProvider {
        return new ethers.JsonRpcProvider(RPC_CONFIG.url);
    }

    private getContract(signerOrProvider?: ethers.Signer | ethers.Provider): ethers.Contract {
        const provider = signerOrProvider || this.getProvider();
        return new ethers.Contract(CONTRACT_ADDRESSES.RALIZ, RALIZ_ABI, provider);
    }

    private getTokenContract(tokenAddress: string, signerOrProvider?: ethers.Signer | ethers.Provider): ethers.Contract {
        const provider = signerOrProvider || this.getProvider();
        return new ethers.Contract(tokenAddress, ERC20_ABI, provider);
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
            prizeDescription: result[2],
            participationFee: result[3],
            requiredFanToken: result[4],
            minimumFanTokens: result[5],
            maxWinners: result[6],
            organizer: result[7],
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
            status: result[2],
            participantCount: result[3],
            totalFunds: result[4],
            winnersDrawn: result[5],
        };
    }

    /**
     * Vérifie si un utilisateur est éligible pour participer
     */
    async isEligibleToParticipate(raffleId: number, userAddress: string): Promise<boolean> {
        const contract = this.getContract();
        return await contract.isEligibleToParticipate(raffleId, userAddress);
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
        const count = await contract.raffleCount();
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
        const contract = this.getContract(signer);

        const participationFeeWei = ethers.parseEther(params.participationFee);
        const minimumFanTokensWei = ethers.parseUnits(params.minimumFanTokens, 18); // Assuming 18 decimals
        const endDateTimestamp = Math.floor(params.endDate.getTime() / 1000);

        const tx = await contract.createRaffle(
            params.title,
            params.description,
            params.prizeDescription,
            participationFeeWei,
            params.requiredFanToken,
            minimumFanTokensWei,
            params.maxWinners,
            endDateTimestamp
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
        const contract = this.getContract(signer);
        const feeWei = ethers.parseEther(participationFee);

        return await contract.participate(raffleId, { value: feeWei });
    }

    /**
     * Tire au sort les gagnants (organizer seulement)
     */
    async drawWinners(raffleId: number, signer: ethers.Signer): Promise<ethers.ContractTransactionResponse> {
        const contract = this.getContract(signer);
        return await contract.drawWinners(raffleId);
    }

    /**
     * Retire les fonds d'une raffle (organizer seulement)
     */
    async withdrawRaffleFunds(raffleId: number, signer: ethers.Signer): Promise<ethers.ContractTransactionResponse> {
        const contract = this.getContract(signer);
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

export default BlockchainService;