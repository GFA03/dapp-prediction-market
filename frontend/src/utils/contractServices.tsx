import Bet_Factory from "../artifacts/contracts/Bet_Factory.sol/Bet_Factory.json";
import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";
import { CONTRACT_ADDRESS } from "./constants";
import { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
    interface Window{
      ethereum?:MetaMaskInpageProvider
    }
  }

let provider: BrowserProvider | null = null;
let signer: JsonRpcSigner | null = null;
let contract: Contract | null = null;

const initialize = async () => {
  if (typeof window.ethereum !== "undefined") {
    provider = new BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new Contract(CONTRACT_ADDRESS, Bet_Factory.abi, signer);
  } else {
    console.error("Please install MetaMask!");
  }
};

// Function to request single account
export const requestAccount = async () => {
  if (!provider) {
    await initialize();
  }

  try {
    const accounts = await provider!.send("eth_requestAccounts", []);
    return accounts[0]; // Return the first account
  } catch (error: any) {
    console.error("Error requesting account:", error.message);
    return null;
  }
};

export const createBet = async (title: string, options: string[]) => {
  if (!contract) {
    await initialize();
  }

  try {
    const tx = await contract!.createBet(title, options, { });
    await tx.wait();
  } catch (error: any) {
    console.error("Error creating bet:", error.message);
  }
}

export const getBets = async (limit: number, offset: number) => {
  if (!contract) {
    await initialize();
  }

  try {
    const bets = await contract!.getBets(limit, offset);
    return bets;
  } catch (error: any) {
    console.error("Error getting bets:", error.message);
    return [];
  }
}

export const getBetsCount = async () => {
  if (!contract) {
    await initialize();
  }

  try {
    const length = await contract!.betsCount();
    return length;
  } catch (error: any) {
    console.error("Error getting bets length:", error.message);
    return 0;
  }
}