// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Raliz - Raffles Web3 sur Chiliz
 * @dev Contrat pour gérer des raffles avec paiement en CHZ et condition de détention de fan tokens
 */
contract Raliz is ReentrancyGuard, Ownable, Pausable {
    
    // ===== STRUCTS =====
    
    struct Raffle {
        string title;
        string description;
        uint256 participationFee;      // Prix en CHZ (wei)
        address requiredFanToken;      // Adresse du fan token requis (PSG, BAR, etc.)
        uint256 minimumFanTokens;     // Minimum de fan tokens requis (défaut: 50)
        uint256 startDate;
        uint256 endDate;
        uint256 maxWinners;
        uint256 maxParticipants;
        address[] participants;
        address[] winners;
        bool isActive;
        bool winnersDrawn;
        address organizer;             // Adresse de l'organisateur
    }
    
    // ===== STATE VARIABLES =====
    
    mapping(uint256 => Raffle) public raffles;
    mapping(uint256 => mapping(address => bool)) public hasParticipated;
    mapping(address => bool) public authorizedOrganizers;
    
    uint256 public raffleCounter;
    uint256 public platformFeePercentage = 250; // 2.5% (250/10000)
    address public feeRecipient;
    uint256 public constant DEFAULT_MIN_FAN_TOKENS = 50 * 10**18; // 50 fan tokens avec 18 décimales
    
    // ===== EVENTS =====
    
    event RaffleCreated(
        uint256 indexed raffleId,
        address indexed organizer,
        string title,
        uint256 participationFee,
        address requiredFanToken,
        uint256 minimumFanTokens
    );
    
    event ParticipationRegistered(
        uint256 indexed raffleId,
        address indexed participant,
        uint256 chzPaid,
        uint256 fanTokenBalance
    );
    
    event WinnersDrawn(
        uint256 indexed raffleId,
        address[] winners
    );
    
    event OrganizerAuthorized(address indexed organizer);
    event OrganizerRevoked(address indexed organizer);
    
    // ===== MODIFIERS =====
    
    modifier onlyAuthorizedOrganizer() {
        require(authorizedOrganizers[msg.sender] || msg.sender == owner(), "Not authorized organizer");
        _;
    }
    
    modifier raffleExists(uint256 _raffleId) {
        require(_raffleId < raffleCounter, "Raffle does not exist");
        _;
    }
    
    modifier raffleActive(uint256 _raffleId) {
        Raffle storage raffle = raffles[_raffleId];
        require(raffle.isActive, "Raffle not active");
        require(block.timestamp >= raffle.startDate, "Raffle not started");
        require(block.timestamp <= raffle.endDate, "Raffle ended");
        _;
    }
    
    // ===== CONSTRUCTOR =====
    
    constructor(address _feeRecipient) Ownable(msg.sender) {
        feeRecipient = _feeRecipient;
        raffleCounter = 0;
    }
    
    // ===== RAFFLE MANAGEMENT =====
    
    /**
     * @dev Créer un nouveau raffle
     * @param _requiredFanToken Adresse du fan token que les participants doivent détenir
     * @param _minimumFanTokens Minimum de fan tokens requis (0 = utilise la valeur par défaut de 50)
     */
    function createRaffle(
        string memory _title,
        string memory _description,
        uint256 _participationFee,
        address _requiredFanToken,
        uint256 _minimumFanTokens,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _maxWinners,
        uint256 _maxParticipants
    ) external onlyAuthorizedOrganizer whenNotPaused {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_endDate > _startDate, "End date must be after start date");
        require(_endDate > block.timestamp, "End date must be in the future");
        require(_maxWinners > 0, "Must have at least 1 winner");
        require(_maxWinners <= _maxParticipants || _maxParticipants == 0, "Winners cannot exceed participants");
        require(_requiredFanToken != address(0), "Invalid fan token address");
        
        // Utiliser la valeur par défaut si 0 est passé
        uint256 minTokens = _minimumFanTokens == 0 ? DEFAULT_MIN_FAN_TOKENS : _minimumFanTokens;
        
        uint256 raffleId = raffleCounter++;
        
        Raffle storage newRaffle = raffles[raffleId];
        newRaffle.title = _title;
        newRaffle.description = _description;
        newRaffle.participationFee = _participationFee;
        newRaffle.requiredFanToken = _requiredFanToken;
        newRaffle.minimumFanTokens = minTokens;
        newRaffle.startDate = _startDate;
        newRaffle.endDate = _endDate;
        newRaffle.maxWinners = _maxWinners;
        newRaffle.maxParticipants = _maxParticipants;
        newRaffle.isActive = true;
        newRaffle.winnersDrawn = false;
        newRaffle.organizer = msg.sender;
        
        emit RaffleCreated(
            raffleId,
            msg.sender,
            _title,
            _participationFee,
            _requiredFanToken,
            minTokens
        );
    }
    
    /**
     * @dev Participer à un raffle
     * Nécessite de détenir le minimum de fan tokens et de payer en CHZ
     */
    function participate(uint256 _raffleId) 
        external 
        payable
        nonReentrant
        whenNotPaused
        raffleExists(_raffleId)
        raffleActive(_raffleId)
    {
        Raffle storage raffle = raffles[_raffleId];
        
        require(!hasParticipated[_raffleId][msg.sender], "Already participated");
        require(
            raffle.maxParticipants == 0 || raffle.participants.length < raffle.maxParticipants,
            "Max participants reached"
        );
        require(msg.value >= raffle.participationFee, "Insufficient CHZ sent");
        
        // Vérifier que l'utilisateur détient suffisamment de fan tokens
        IERC20 fanToken = IERC20(raffle.requiredFanToken);
        uint256 fanTokenBalance = fanToken.balanceOf(msg.sender);
        require(
            fanTokenBalance >= raffle.minimumFanTokens,
            "Insufficient fan token balance"
        );
        
        // Enregistrer la participation
        raffle.participants.push(msg.sender);
        hasParticipated[_raffleId][msg.sender] = true;
        
        // Rembourser l'excédent de CHZ si nécessaire
        if (msg.value > raffle.participationFee) {
            payable(msg.sender).transfer(msg.value - raffle.participationFee);
        }
        
        emit ParticipationRegistered(_raffleId, msg.sender, raffle.participationFee, fanTokenBalance);
    }
    
    /**
     * @dev Tirer les gagnants (appelé par l'admin après endDate)
     */
    function drawWinners(uint256 _raffleId, address[] memory _winners) 
        external 
        onlyOwner
        raffleExists(_raffleId)
    {
        Raffle storage raffle = raffles[_raffleId];
        
        require(block.timestamp > raffle.endDate, "Raffle not ended yet");
        require(!raffle.winnersDrawn, "Winners already drawn");
        require(_winners.length <= raffle.maxWinners, "Too many winners");
        require(_winners.length > 0, "Must specify at least 1 winner");
        
        // Vérifier que tous les gagnants ont participé
        for (uint256 i = 0; i < _winners.length; i++) {
            require(hasParticipated[_raffleId][_winners[i]], "Winner did not participate");
        }
        
        // Enregistrer les gagnants
        for (uint256 i = 0; i < _winners.length; i++) {
            raffle.winners.push(_winners[i]);
        }
        
        raffle.winnersDrawn = true;
        raffle.isActive = false;
        
        emit WinnersDrawn(_raffleId, _winners);
    }
    
    // ===== ELIGIBILITY CHECK =====
    
    /**
     * @dev Vérifier si un utilisateur est éligible pour participer à un raffle
     */
    function isEligibleToParticipate(uint256 _raffleId, address _user) 
        external 
        view 
        raffleExists(_raffleId)
        returns (bool eligible, uint256 userBalance, uint256 required, string memory reason) 
    {
        Raffle storage raffle = raffles[_raffleId];
        
        // Vérifications de base
        if (hasParticipated[_raffleId][_user]) {
            return (false, 0, 0, "Already participated");
        }
        
        if (!raffle.isActive) {
            return (false, 0, 0, "Raffle not active");
        }
        
        if (block.timestamp < raffle.startDate) {
            return (false, 0, 0, "Raffle not started");
        }
        
        if (block.timestamp > raffle.endDate) {
            return (false, 0, 0, "Raffle ended");
        }
        
        if (raffle.maxParticipants > 0 && raffle.participants.length >= raffle.maxParticipants) {
            return (false, 0, 0, "Max participants reached");
        }
        
        // Vérifier la balance de fan tokens
        IERC20 fanToken = IERC20(raffle.requiredFanToken);
        uint256 fanTokenBalance = fanToken.balanceOf(_user);
        
        if (fanTokenBalance < raffle.minimumFanTokens) {
            return (false, fanTokenBalance, raffle.minimumFanTokens, "Insufficient fan token balance");
        }
        
        return (true, fanTokenBalance, raffle.minimumFanTokens, "Eligible");
    }
    
    // ===== ADMIN FUNCTIONS =====
    
    function authorizeOrganizer(address _organizer) external onlyOwner {
        authorizedOrganizers[_organizer] = true;
        emit OrganizerAuthorized(_organizer);
    }
    
    function revokeOrganizer(address _organizer) external onlyOwner {
        authorizedOrganizers[_organizer] = false;
        emit OrganizerRevoked(_organizer);
    }
    
    function setPlatformFee(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "Fee cannot exceed 10%"); // Max 10%
        platformFeePercentage = _feePercentage;
    }
    
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Retirer les fonds CHZ collectés
     */
    function withdrawCHZ() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No CHZ to withdraw");
        
        // Calculer la commission de plateforme
        uint256 platformFee = (balance * platformFeePercentage) / 10000;
        uint256 organizerAmount = balance - platformFee;
        
        // Envoyer la commission à feeRecipient
        if (platformFee > 0) {
            payable(feeRecipient).transfer(platformFee);
        }
        
        // Envoyer le reste à l'owner (qui peut redistribuer aux organisateurs)
        if (organizerAmount > 0) {
            payable(owner()).transfer(organizerAmount);
        }
    }
    
    /**
     * @dev Retirer les CHZ pour un raffle spécifique vers l'organisateur
     */
    function withdrawRaffleFunds(uint256 _raffleId) external onlyOwner raffleExists(_raffleId) {
        Raffle storage raffle = raffles[_raffleId];
        require(raffle.winnersDrawn, "Winners not drawn yet");
        
        uint256 raffleBalance = raffle.participants.length * raffle.participationFee;
        require(address(this).balance >= raffleBalance, "Insufficient contract balance");
        
        // Calculer la commission
        uint256 platformFee = (raffleBalance * platformFeePercentage) / 10000;
        uint256 organizerAmount = raffleBalance - platformFee;
        
        // Envoyer à l'organisateur et à la plateforme
        if (platformFee > 0) {
            payable(feeRecipient).transfer(platformFee);
        }
        
        if (organizerAmount > 0) {
            payable(raffle.organizer).transfer(organizerAmount);
        }
    }
    
    // ===== VIEW FUNCTIONS =====
    
    function getRaffleInfo(uint256 _raffleId) external view returns (
        string memory title,
        string memory description,
        uint256 participationFee,
        address requiredFanToken,
        uint256 minimumFanTokens,
        address organizer
    ) {
        Raffle storage raffle = raffles[_raffleId];
        return (
            raffle.title,
            raffle.description,
            raffle.participationFee,
            raffle.requiredFanToken,
            raffle.minimumFanTokens,
            raffle.organizer
        );
    }
    
    function getRaffleStatus(uint256 _raffleId) external view returns (
        uint256 startDate,
        uint256 endDate,
        uint256 maxWinners,
        uint256 maxParticipants,
        uint256 participantCount,
        bool isActive,
        bool winnersDrawn
    ) {
        Raffle storage raffle = raffles[_raffleId];
        return (
            raffle.startDate,
            raffle.endDate,
            raffle.maxWinners,
            raffle.maxParticipants,
            raffle.participants.length,
            raffle.isActive,
            raffle.winnersDrawn
        );
    }
    
    // Fonction legacy pour compatibilité (divise l'appel en deux)
    function getRaffle(uint256 _raffleId) external view returns (
        string memory title,
        string memory description,
        uint256 participationFee,
        address requiredFanToken,
        uint256 minimumFanTokens,
        uint256 startDate,
        uint256 endDate,
        uint256 maxWinners,
        uint256 maxParticipants,
        uint256 participantCount,
        bool isActive,
        bool winnersDrawn,
        address organizer
    ) {
        (
            title,
            description, 
            participationFee,
            requiredFanToken,
            minimumFanTokens,
            organizer
        ) = this.getRaffleInfo(_raffleId);
        
        (
            startDate,
            endDate,
            maxWinners,
            maxParticipants,
            participantCount,
            isActive,
            winnersDrawn
        ) = this.getRaffleStatus(_raffleId);
    }
    
    function getParticipants(uint256 _raffleId) external view returns (address[] memory) {
        return raffles[_raffleId].participants;
    }
    
    function getWinners(uint256 _raffleId) external view returns (address[] memory) {
        return raffles[_raffleId].winners;
    }
    
    function getTotalRaffles() external view returns (uint256) {
        return raffleCounter;
    }
    
    /**
     * @dev Obtenir le solde CHZ du contrat
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
} 