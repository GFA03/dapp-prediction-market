import Bet_Factory from "../artifacts/contracts/Bet_Factory.sol/Bet_Factory.json";
import { BrowserProvider, Contract, parseEther, formatEther, JsonRpcSigner } from "ethers";
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