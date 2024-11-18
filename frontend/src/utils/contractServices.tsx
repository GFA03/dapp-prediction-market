import Bet_Factory from "../artifacts/contracts/Bet_Factory.sol/Bet_Factory.json";
import { BrowserProvider, Contract, formatEther, JsonRpcSigner, parseEther } from "ethers";
import { CONTRACT_ADDRESS } from "./constants";
import { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
    interface Window{
      ethereum?:MetaMaskInpageProvider
    }
  }

let provider: BrowserProvider | null = null;
let signer: JsonRpcSigner | null = null;
let betFactoryContract: Contract | null = null;

const initialize = async () => {
  console.log("INITIALIZE");
  if (window.ethereum !== null) {
    provider = new BrowserProvider(window.ethereum as MetaMaskInpageProvider);
    signer = await provider.getSigner();
    betFactoryContract = new Contract(CONTRACT_ADDRESS, Bet_Factory.abi, signer);
    console.log('INITIALIZATION DONE 🟢');
  } else {
    console.log('INITIALIZATION ERROR ⭕');
    console.error("Please install MetaMask!");
  }
};

const initializeBetContract = async (address: string) => {
  if (!provider) {
    await initialize();
  }

  try {
    console.log("Initializing bet contract with address:", address);
    const betContract = new Contract(address, Bet_Factory.abi, signer);
    console.log("Bet contract initialized 🟢");
    return betContract;
  } catch (error: any) {
    console.error("Error initializing bet contract:", error.message);
    return null;
  }
}

// Function to request single account
export const requestAccount = async () => {
  if (!provider) {
    console.log("REQUEST ACCOUNT Initialize!");
    await initialize();
    console.log(provider);
  }

  try {
    console.log("REQUEST ACCOUNT TRY BLOCK");
    const accounts = await provider!.send("eth_requestAccounts", []);
    console.log('REQUEST ACCOUNT DONE 🟢');
    return accounts[0]; // Return the first account
    // return null;
  } catch (error: any) {
    console.error("Error requesting account:", error.message);
    console.log('REQUEST ACCOUNT ERROR ⭕');
    return null;
  }
};

// Function to get balance of account
export const getBalance = async (account: string) => {
  if (!provider) {
    await initialize();
  }

  try {
    console.log("Getting balance for account:", account);
    const balance = await provider!.getBalance(account);
    console.log("Balance DONE 🟢");
    const balanceInEth = formatEther(balance);
    return balanceInEth;
  } catch (error: any) {
    console.error("Error getting balance:", error.message);
    return null;
  }
};

export const createBet = async (title: string, options: string[]) => {
  if (!betFactoryContract) {
    await initialize();
  }

  try {
    console.log("Creating bet with title:", title, "and options:", options);
    const tx = await betFactoryContract!.createBet(title, options);
    console.log(tx);
    await tx.wait();
    console.log("Bet created successfully 🟢");
  } catch (error: any) {
    console.log("Bet creation error ⭕");
    console.error("Error creating bet:", error.message);
  }
}

export const getBets = async (limit: number, offset: number) => {
  if (!betFactoryContract) {
    await initialize();
  }

  try {
    console.log("Getting bets");
    console.log(betFactoryContract);
    const bets = await betFactoryContract!.getBets(limit, offset);
    console.log("Bets DONE 🟢:");
    console.log(bets);
    return bets;
  } catch (error: any) {
    console.error("Error getting bets:", error.message);
    return [];
  }
}

export const getBetsCount = async () => {
  if (!betFactoryContract) {
    await initialize();
  }

  try {
    console.log("Getting bets length");
    const length = await betFactoryContract!.betsCount();
    console.log("Bets length DONE 🟢:");
    console.log(length);
    // transform length from bigint to number
    const count = Number(length);
    return count;
  } catch (error: any) {
    console.error("Error getting bets length:", error.message);
    return 0;
  }
}

export const getBetName = async (address: string) => {
  const betContract = await initializeBetContract(address);

  if (betContract === null) {
    console.log("Bet contract is null ⭕");
    return "";
  }

  try {
    console.log("Getting bet name for address:", address);
    const name = await betContract!.name();
    console.log("Bet name DONE 🟢:");
    console.log(name);
    return name;
  } catch (error: any) {
    console.error("Error getting bet name:", error.message);
    return "";
  }
}