import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
import "./tasks/organizer-tasks";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  networks: {
    // Chiliz Testnet (Spicy)
    "chiliz-testnet": {
      url: "https://spicy-rpc.chiliz.com/",
      chainId: 88882,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // Chiliz Mainnet
    "chiliz-mainnet": {
      url: "https://rpc.chiliz.com/",
      chainId: 88888,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // Local development
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  etherscan: {
    apiKey: {
      "chiliz-testnet": "abc", // Chiliscan ne nécessite pas d'API key
      "chiliz-mainnet": "abc",
    },
    customChains: [
      {
        network: "chiliz-testnet",
        chainId: 88882,
        urls: {
          apiURL: "https://testnet.chiliscan.com/api",
          browserURL: "https://testnet.chiliscan.com",
        },
      },
      {
        network: "chiliz-mainnet", 
        chainId: 88888,
        urls: {
          apiURL: "https://chiliscan.com/api",
          browserURL: "https://chiliscan.com",
        },
      },
    ],
  },
};

export default config;
