import React, { useEffect, useState } from "react";
import { fetchAllBets } from "../utils/contractServices";

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

  return (
    <div>
      <h1>My Bets</h1>
      {myBets.length === 0 ? (
        <p>You have no bets yet.</p>
      ) : (
        <ul>
          {myBets.map((bet, index) => (
            <li key={index}>
              Bet on contract: {bet.address}, Name: {bet.name}, Option: {bet.options[bet.betData[0]]}, Amount: {bet.betData[1]} wei
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyBets;
