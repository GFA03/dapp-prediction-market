import React, { useEffect, useState } from "react";
import { getBetsAddresses, getBetDetails, placeBet } from "../utils/contractServices";
import BetCard from "./BetCard";
import Bet from "../models/Bet";
import { Container, Typography, Grid, CircularProgress } from "@mui/material";

const AllBets = ({
  account,
  balance,
  updateBalance,
}: {
  account: string;
  balance: string;
  updateBalance: () => void;
}) => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBets = async () => {
      try {
        const addresses = await getBetsAddresses(10, 0);
        const details = await Promise.all(
          addresses.map(async (addr: string) => await getBetDetails(addr))
        );
        setBets(details);
      } catch (error) {
        console.error("Failed to fetch bets:", error);
      } finally {
        setLoading(false);
      }
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
    <Container maxWidth="lg" className="py-8">
      <Typography
        variant="h4"
        className="text-center font-bold text-blue-600 mb-8"
      >
        All Bets
      </Typography>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <CircularProgress />
        </div>
      ) : bets.length === 0 ? (
        <Typography
          variant="h6"
          className="text-center text-gray-500"
        >
          No bets available at the moment.
        </Typography>
      ) : (
        <Grid container spacing={4}>
          {bets.map((bet, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <BetCard
                {...bet}
                userBalance={balance}
                onPlaceBet={handlePlaceBet}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default AllBets;
