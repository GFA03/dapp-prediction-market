import Bet_Factory from "../artifacts/contracts/Bet_Factory.sol/Bet_Factory.json";
import Bet from "../artifacts/contracts/Bet.sol/Bet.json";
import {
  BrowserProvider,
  Contract,
  formatEther,
  JsonRpcSigner,
  parseEther,
} from "ethers";
import { CONTRACT_ADDRESS } from "./constants";
import { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

enum BetStatus {
  Open = 0,
  Closed = 1,
  Canceled = 2,
  Finished = 3,
}

// Global Variables
let provider: BrowserProvider | null = null;
let signer: JsonRpcSigner | null = null;
let betFactoryContract: Contract | null = null;

// Utility: Ensure Initialization
const ensureInitialized = async () => {
  if (!provider || !signer || !betFactoryContract) {
    if (window.ethereum) {
      provider = new BrowserProvider(window.ethereum as MetaMaskInpageProvider);
      signer = await provider.getSigner();
      betFactoryContract = new Contract(CONTRACT_ADDRESS, Bet_Factory.abi, signer);
      console.log("Initialization complete 🟢");
    } else {
      console.error("MetaMask is not installed! ⭕");
      throw new Error("MetaMask is required.");
    }
  }
};

// Utility: Initialize Specific Bet Contract
const initializeBetContract = async (address: string) => {
  await ensureInitialized();
  return new Contract(address, Bet.abi, signer);
};

// Account Management
export const requestAccount = async () => {
  await ensureInitialized();
  try {
    const accounts = await provider!.send("eth_requestAccounts", []);
    console.log("Account request successful 🟢");
    return accounts[0];
  } catch (error: any) {
    console.error("Error requesting account ⭕", error.message);
    return null;
  }
};

export const getBalance = async (account: string) => {
  await ensureInitialized();
  try {
    const balance = await provider!.getBalance(account);
    console.log("Balance retrieved 🟢");
    return formatEther(balance);
  } catch (error: any) {
    console.error("Error retrieving balance ⭕", error.message);
    return null;
  }
};

// Bet Factory Functions
export const createBet = async (title: string, options: string[]) => {
  await ensureInitialized();
  try {
    const tx = await betFactoryContract!.createBet(title, options);
    await tx.wait();
    console.log("Bet created successfully 🟢");
  } catch (error: any) {
    console.error("Error creating bet ⭕", error.message);
  }
};

export const getBetsAddresses = async (limit: number, offset: number) => {
  await ensureInitialized();
  try {
    return await betFactoryContract!.getBets(limit, offset);
  } catch (error: any) {
    console.error("Error retrieving bet addresses ⭕", error.message);
    return [];
  }
};

export const getBetsCount = async () => {
  await ensureInitialized();
  try {
    const count = await betFactoryContract!.betsCount();
    return Number(count);
  } catch (error: any) {
    console.error("Error retrieving bet count ⭕", error.message);
    return 0;
  }
};

// Bet Contract Functions
export const getBetDetails = async (address: string) => {
  const betContract = await initializeBetContract(address);
  try {
    const name = await betContract.getName();
    const options = await betContract.getOptions();
    const status = Number(await betContract.getStatus());
    return { name, options, status, address };
  } catch (error: any) {
    console.error("Error retrieving bet details ⭕", error.message);
    return null;
  }
};

export const placeBet = async (address: string, option: number, amount: string) => {
  const betContract = await initializeBetContract(address);
  try {
    const tx = await betContract.bet(option, { value: parseEther(amount) });
    await tx.wait();
    console.log(`Bet placed successfully 🟢 Option: ${option}, Amount: ${amount}`);
    return true;
  } catch (error: any) {
    console.error("Error placing bet ⭕", error.message);
    return false;
  }
};

// Fetch Bets
const fetchBets = async (
  userAddress: string,
  filterFn: (contract: Contract) => Promise<boolean>
) => {
  await ensureInitialized();
  const bets = [];
  let offset = 0;
  const limit = 20;

  while (true) {
    const count = await getBetsCount();
    if (count - offset <= 0) break;

    const deployedBets = await getBetsAddresses(limit, offset);
    for (const betAddress of deployedBets) {
      const betContract = await initializeBetContract(betAddress);
      if (await filterFn(betContract)) {
        const name = await betContract.getName();
        const options = await betContract.getOptions();
        const status = Number(await betContract.getStatus());
        const betData = await betContract.getBet({ from: userAddress });
        bets.push({ address: betAddress, name, options, status, betData });
      }
    }
    offset += limit;
  }
  return bets;
};

export const fetchAllOpenBets = async () => {
  await ensureInitialized();

  const bets = [];
  let offset = 0;
  const limit = 20;

  while (true) {
    const count = await getBetsCount();
    if (count - offset <= 0) break;

    const deployedBets = await getBetsAddresses(limit, offset);
    for (const betAddress of deployedBets) {
      const betContract = await initializeBetContract(betAddress);
      const status = Number(await betContract.getStatus());
      if (status === BetStatus.Open) {
        const name = await betContract.getName();
        const options = await betContract.getOptions();
        bets.push({ address: betAddress, name, options });
      }
    }
    offset += limit;
  }
}

export const fetchUserBets = async (userAddress: string) =>
  fetchBets(userAddress, async (betContract) => {
    const betData = await betContract.getBet({ from: userAddress });
    const status = Number(await betContract.getStatus());
    return betData && Number(betData[1]) > 0 && (status === BetStatus.Open || status === BetStatus.Closed);
  });

export const fetchCreatedBets = async (userAddress: string) =>
  fetchBets(userAddress, async (betContract) => {
    const owner = await betContract.owner();
    return owner.toLowerCase() === userAddress.toLowerCase();
  });

// Bet Management
const manageBet = async (betAddress: string, action: (contract: Contract) => Promise<any>) => {
  const contract = await initializeBetContract(betAddress);
  try {
    const tx = await action(contract);
    await tx.wait();
    return true;
  } catch (error: any) {
    console.error("Error managing bet ⭕", error.message);
    return false;
  }
};

export const closeBet = (betAddress: string) =>
  manageBet(betAddress, (contract) => contract.close());

export const cancelBet = (betAddress: string) =>
  manageBet(betAddress, (contract) => contract.cancel());

export const setWinner = (betAddress: string, winningOption: number) =>
  manageBet(betAddress, (contract) => contract.setWinner(winningOption));