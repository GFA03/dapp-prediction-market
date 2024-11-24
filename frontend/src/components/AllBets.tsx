import React, { useEffect, useState } from "react";
import { getBetsAddresses, getBetDetails, placeBet } from "../utils/contractServices";
import BetCard from "./BetCard";
import Bet from "../models/Bet";

const AllBets = ({ account, balance, updateBalance }: { account: string; balance: string; updateBalance: () => void }) => {
  const [bets, setBets] = useState<Bet[]>([]);

  useEffect(() => {
    const fetchBets = async () => {
      const addresses = await getBetsAddresses(10, 0);
      const details = await Promise.all(
        addresses.map(async (addr: string) => await getBetDetails(addr))
      );
      setBets(details);
    };
    fetchBets();
  }, []);

  const handlePlaceBet = async (address: string, option: number, amount: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid bet amount.");
      return;
    }
  
    const success = await placeBet(address, option, amount);
    if (success) {
      alert(`Bet placed successfully on option ${option}!`);
      updateBalance(); // Refresh user's balance
    } else {
      alert("Failed to place bet. Please try again.");
    }
  };

  return (
    <div>
      <h1>All Bets</h1>
      {bets.map((bet, idx) => (
        <BetCard key={idx} {...bet} userBalance={balance} onPlaceBet={handlePlaceBet} />
      ))}
    </div>
  );
};

export default AllBets;
