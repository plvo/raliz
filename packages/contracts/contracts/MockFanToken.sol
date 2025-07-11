// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockFanToken - Token de test pour simuler PSG, BAR, CITY tokens
 * @dev Utilisé uniquement pour les tests et le développement local
 */
contract MockFanToken is ERC20, Ownable {
    
    uint8 private _decimals;
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _tokenDecimals,
        uint256 _initialSupply
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        _decimals = _tokenDecimals;
        _mint(msg.sender, _initialSupply * 10**_tokenDecimals);
    }
    
    function decimals() public view override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Mint tokens pour les tests (owner only)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Faucet function - permet aux users de récupérer des tokens de test
     */
    function faucet(uint256 amount) external {
        require(amount <= 10000 * 10**_decimals, "Max 10,000 tokens per faucet");
        _mint(msg.sender, amount);
    }
    
    /**
     * @dev Mint automatique de 1000 tokens pour nouveaux utilisateurs
     */
    function faucetDefault() external {
        _mint(msg.sender, 1000 * 10**_decimals);
    }
} 