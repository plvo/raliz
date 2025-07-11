// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Raliz - Raffles Web3 sur Chiliz
 * @dev Contrat pour gérer des raffles avec paiement en fan tokens
 */
contract Raliz is ReentrancyGuard, Ownable, Pausable {
    
    // ===== STRUCTS =====
    
    struct Raffle {
        string title;
        string description;
        uint256 participationFee;      // Prix en wei du fan token
        address tokenContract;         // Adresse du fan token (PSG, BAR, etc.)
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
    
    // ===== EVENTS =====
    
    event RaffleCreated(
        uint256 indexed raffleId,
        address indexed organizer,
        string title,
        uint256 participationFee,
        address tokenContract
    );
    
    event ParticipationRegistered(
        uint256 indexed raffleId,
        address indexed participant,
        uint256 amountPaid
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
     */
    function createRaffle(
        string memory _title,
        string memory _description,
        uint256 _participationFee,
        address _tokenContract,
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
        
        uint256 raffleId = raffleCounter++;
        
        Raffle storage newRaffle = raffles[raffleId];
        newRaffle.title = _title;
        newRaffle.description = _description;
        newRaffle.participationFee = _participationFee;
        newRaffle.tokenContract = _tokenContract;
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
            _tokenContract
        );
    }
    
    /**
     * @dev Participer à un raffle
     */
    function participate(uint256 _raffleId) 
        external 
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
        
        // Transfert du fan token
        if (raffle.participationFee > 0) {
            IERC20 token = IERC20(raffle.tokenContract);
            require(
                token.transferFrom(msg.sender, address(this), raffle.participationFee),
                "Token transfer failed"
            );
        }
        
        // Enregistrer la participation
        raffle.participants.push(msg.sender);
        hasParticipated[_raffleId][msg.sender] = true;
        
        emit ParticipationRegistered(_raffleId, msg.sender, raffle.participationFee);
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
     * @dev Retirer les fonds de plateforme (fees)
     */
    function withdrawPlatformFees(address _tokenContract) external onlyOwner {
        IERC20 token = IERC20(_tokenContract);
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No balance to withdraw");
        
        require(token.transfer(feeRecipient, balance), "Transfer failed");
    }
    
    // ===== VIEW FUNCTIONS =====
    
    function getRaffle(uint256 _raffleId) external view returns (
        string memory title,
        string memory description,
        uint256 participationFee,
        address tokenContract,
        uint256 startDate,
        uint256 endDate,
        uint256 maxWinners,
        uint256 maxParticipants,
        uint256 participantCount,
        bool isActive,
        bool winnersDrawn,
        address organizer
    ) {
        Raffle storage raffle = raffles[_raffleId];
        return (
            raffle.title,
            raffle.description,
            raffle.participationFee,
            raffle.tokenContract,
            raffle.startDate,
            raffle.endDate,
            raffle.maxWinners,
            raffle.maxParticipants,
            raffle.participants.length,
            raffle.isActive,
            raffle.winnersDrawn,
            raffle.organizer
        );
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
} 