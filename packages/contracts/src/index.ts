export type { Raliz, MockFanToken } from '../typechain-types';
export type { RalizInterface } from '../typechain-types/contracts/Raliz';
export type { MockFanTokenInterface } from '../typechain-types/contracts/MockFanToken';

export { abi as RalizABI } from '../artifacts/contracts/Raliz.sol/Raliz.json';
export { abi as MockFanTokenABI } from '../artifacts/contracts/MockFanToken.sol/MockFanToken.json';

import { ethers } from 'ethers';
import type { Raliz, MockFanToken } from '../typechain-types';
import { abi as RalizABI } from '../artifacts/contracts/Raliz.sol/Raliz.json';
import { abi as MockFanTokenABI } from '../artifacts/contracts/MockFanToken.sol/MockFanToken.json';

export function createRalizContract(
    address: string, 
    signerOrProvider: ethers.Signer | ethers.Provider
): Raliz {
    return new ethers.Contract(address, RalizABI, signerOrProvider) as unknown as Raliz;
}

export function createMockFanTokenContract(
    address: string, 
    signerOrProvider: ethers.Signer | ethers.Provider
): MockFanToken {
    return new ethers.Contract(address, MockFanTokenABI, signerOrProvider) as unknown as MockFanToken;
}

export * from './config/web3-config';
export * from './service/blockchain.service';