import React, { Dispatch, SetStateAction } from "react";
import { Button } from "@mui/material";
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Button variant="contained" color="primary" onClick={connectWallet}>
        Connect Web3 Wallet
      </Button>
    </div>
  );
}

export default ConnectWalletPage;
