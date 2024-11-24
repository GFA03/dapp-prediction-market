import React, { useEffect, useState } from "react";
import { fetchAllBets } from "../utils/contractServices";
import MyBetCard from "./MyBetCard";

const MyBets = ({ account }: { account: string }) => {
  const [myBets, setMyBets] = useState<{ address: string; name: string; options: string[]; betData: number[] }[]>([]);

  useEffect(() => {
    const loadUserBets = async () => {
      try {
        const bets = await fetchAllBets(account);
        setMyBets(bets);
      } catch (error) {
        console.error("Error fetching user bets:", error);
      }
    };

    if (account) {
      loadUserBets();
    }
  }, [account]);

  const handleCashback = (betAddress: string) => {
    console.log(`Cashback triggered for bet contract: ${betAddress}`);
    // Integrate cashback logic here
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">My Bets</h1>
      {myBets.length === 0 ? (
        <p className="text-gray-600">You have no bets yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myBets.map((bet, index) => (
            <MyBetCard
              key={index}
              name={bet.name}
              options={bet.options}
              chosenOption={bet.options[Number(bet.betData[0])]}
              amount={Number(bet.betData[1])}
              onCashback={() => handleCashback(bet.address)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBets;
