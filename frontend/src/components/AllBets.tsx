import React, { useEffect, useState } from "react";
import { getBetsAddresses, getBetDetails } from "../utils/contractServices";
import BetCard from "./BetCard";
import Bet from "../models/Bet";

const AllBets = ({ account }: { account: string }) => {
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

  return (
    <div>
      <h1>All Bets</h1>
      {bets.map((bet, idx) => (
        <BetCard key={idx} {...bet} userBalance="0" onPlaceBet={() => {}} />
      ))}
    </div>
  );
};

export default AllBets;
