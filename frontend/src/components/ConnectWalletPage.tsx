import React, { Dispatch, SetStateAction } from "react";
import { requestAccount } from "../utils/contractServices";

interface ConnectWalletPageProps {
  setAccount: Dispatch<SetStateAction<string | null>>;
}

function ConnectWalletPage({ setAccount }: ConnectWalletPageProps) {
  const connectWallet = async () => {
    try {
      const account = await requestAccount();
      setAccount(account);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return <button onClick={connectWallet}>Connect Web3 Wallet</button>;
}

export default ConnectWalletPage;