import Bet_Factory from "../artifacts/contracts/Bet_Factory.sol/Bet_Factory.json";
import { BrowserProvider, Contract, parseEther, formatEther, JsonRpcSigner } from "ethers";
import { CONTRACT_ADDRESS } from "./constants";
import { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
    interface Window{
      ethereum?:MetaMaskInpageProvider
    }
  }

let provider: BrowserProvider;
let signer: JsonRpcSigner;
let contract: Contract;

const initialize = async () => {
  if (typeof window.ethereum !== "undefined") {
    provider = new BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new Contract(CONTRACT_ADDRESS, Bet_Factory.abi, signer);
  } else {
    console.error("Please install MetaMask!");
  }
};

// Initialize once when the module is loaded
initialize();

// Function to request single account
export const requestAccount = async () => {
  try {
    const accounts = await provider.send("eth_requestAccounts", []);
    return accounts[0]; // Return the first account
  } catch (error: any) {
    console.error("Error requesting account:", error.message);
    return null;
  }
};

// Function to get contract balance in ETH
export const getContractBalanceInETH = async () => {
    const balanceWei = await provider.getBalance(CONTRACT_ADDRESS);
    const balanceEth = formatEther(balanceWei); // Convert Wei to ETH string
    return balanceEth; // Convert ETH string to number
};
  
// Function to deposit funds to the contract
export const depositFund = async (depositValue: string) => {
const ethValue = parseEther(depositValue);
const deposit = await contract.deposit({ value: ethValue });
await deposit.wait();
};
  
// Function to withdraw funds from the contract
export const withdrawFund = async () => {
const withdrawTx = await contract.withdraw();
await withdrawTx.wait();
console.log("Withdrawal successful!");
};
