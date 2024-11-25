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

let provider: BrowserProvider | null = null;
let signer: JsonRpcSigner | null = null;
let betFactoryContract: Contract | null = null;

const initialize = async () => {
  if (window.ethereum !== null) {
    provider = new BrowserProvider(window.ethereum as MetaMaskInpageProvider);
    signer = await provider.getSigner();
    betFactoryContract = new Contract(
      CONTRACT_ADDRESS,
      Bet_Factory.abi,
      signer
    );
    console.log("INITIALIZATION DONE 🟢");
  } else {
    console.log("INITIALIZATION ERROR ⭕");
    console.error("Please install MetaMask!");
  }
};

const initializeBetContract = async (address: string) => {
  if (!provider) {
    await initialize();
  }

  try {
    const betContract = new Contract(address, Bet.abi, signer);

    return betContract;
  } catch (error: any) {
    console.error("Error initializing bet contract:", error.message);
    return null;
  }
};

// Function to request single account
export const requestAccount = async () => {
  if (!provider) {
    await initialize();
  }

  try {
    const accounts = await provider!.send("eth_requestAccounts", []);
    console.log("REQUEST ACCOUNT DONE 🟢");
    return accounts[0]; // Return the first account
    // return null;
  } catch (error: any) {
    console.error("Error requesting account:", error.message);
    console.log("REQUEST ACCOUNT ERROR ⭕");
    return null;
  }
};

// Function to get balance of account
export const getBalance = async (account: string) => {
  if (!provider) {
    await initialize();
  }

  try {
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
    const tx = await betFactoryContract!.createBet(title, options);
    await tx.wait();
    console.log("Bet created successfully 🟢");
  } catch (error: any) {
    console.log("Bet creation error ⭕");
    console.error("Error creating bet:", error.message);
  }
};

export const getBetsAddresses = async (limit: number, offset: number) => {
  if (!betFactoryContract) {
    await initialize();
  }

  try {
    const bets = await betFactoryContract!.getBets(limit, offset);
    return bets;
  } catch (error: any) {
    console.error("Error getting bets:", error.message);
    return [];
  }
};

export const getBetsCount = async () => {
  if (!betFactoryContract) {
    await initialize();
  }

  try {
    const length = await betFactoryContract!.betsCount();
    // transform length from bigint to number
    const count = Number(length);
    return count;
  } catch (error: any) {
    console.error("Error getting bets length:", error.message);
    return 0;
  }
};

export const getBetDetails = async (address: string) => {
  const betContract = await initializeBetContract(address);

  if (betContract === null) {
    console.log("Bet contract is null ⭕");
    return "";
  }

  try {
    const name = await getBetName(betContract);
    const options = await getBetOptions(betContract);
    return { name, options, address };
  } catch (error: any) {
    console.error("Error getting bet name:", error.message);
    return "";
  }
};

const getBetName = async (betContract: Contract) => {
  try {
    const name = await betContract.getName();
    return name;
  } catch (error: any) {
    console.error("Error getting bet name:", error.message);
    return "";
  }
};

const getBetOptions = async (betContract: Contract) => {
  try {
    const options = await betContract.getOptions();
    return options;
  } catch (error: any) {
    console.error("Error getting bet options:", error.message);
    return [];
  }
};

export const placeBet = async (
  address: string,
  option: number,
  amount: string
) => {
  const betContract = await initializeBetContract(address);

  if (!betContract) {
    console.error("Bet contract not initialized ⭕");
    return false;
  }

  try {
    const ethValue = parseEther(amount);
    const tx = await betContract.bet(option, { value: ethValue });
    await tx.wait();
    console.log(
      `Bet placed successfully 🟢 Option: ${option}, Amount: ${amount}`
    );
    return true;
  } catch (error: any) {
    console.error("Error placing bet:", error.message);
    return false;
  }
};

export const fetchAllBets = async (userAddress: string) => {
  if (!provider) {
    await initialize();
  }
  const bets = [];
  let offset = 0;
  const limit = 20;

  while (true) {
    if (Number(await betFactoryContract!.betsCount()) - offset <= 0) break;
    const deployedBets = await betFactoryContract!.getBets(limit, offset);

    for (const betAddress of deployedBets) {
      const betContract = new Contract(betAddress, Bet.abi, provider);
      const betData = await betContract.getBet({ from: userAddress });
      if (betData !== null && Number(betData[1]) > 0) {
        // User has placed a bet here
        const betName = await betContract.getName();
        const betOptions = await betContract.getOptions();
        bets.push({
          address: betAddress,
          name: betName,
          options: betOptions,
          betData,
        });
      }
    }

    // Increment offset for pagination
    offset += limit;
  }

  return bets;
}

export const fetchCreatedBets = async (userAddress: string) => {
  if (!provider) {
    await initialize();
  }
  const bets = [];
  let offset = 0;
  const limit = 20;

  while (true) {
    if (Number(await betFactoryContract!.betsCount()) - offset <= 0) break;
    const deployedBets = await betFactoryContract!.getBets(limit, offset);

    for (const betAddress of deployedBets) {
      const betContract = new Contract(betAddress, Bet.abi, provider);
      const owner = await betContract.owner();
      if (owner.toLowerCase() === userAddress.toLowerCase()) {
        const betName = await betContract.getName();
        const betOptions = await betContract.getOptions();
        bets.push({
          address: betAddress,
          name: betName,
          options: betOptions,
        });
      }
    }

    // Increment offset for pagination
    offset += limit;
  }

  return bets;
}

export const closeBet = async (betAddress: string) => {
  if (!provider) {
    await initialize();
  }
  
  const contract = new Contract(betAddress, Bet.abi, signer);
  try {
    const tx = await contract.close();
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Failed to close the bet:", error);
    return false;
  }
};

export const cancelBet = async (betAddress: string) => {
  if (!provider) {
    await initialize();
  }
  
  const contract = new Contract(betAddress, Bet.abi, signer);
  try {
    const tx = await contract.cancel();
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Failed to cancel the bet:", error);
    return false;
  }
};

export const setWinner = async (betAddress: string, winningOption: number) => {
  if (!provider) {
    await initialize();
  }
  
  const contract = new Contract(betAddress, Bet.abi, signer);
  try {
    const tx = await contract.setWinner(winningOption);
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Failed to set winner:", error);
    return false;
  }
};