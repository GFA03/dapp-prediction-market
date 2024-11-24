import React, { useState, useEffect } from "react";
import { createBet, getBetDetails, getBetsAddresses, getBetsCount, placeBet } from "../utils/contractServices";
import { Box, Button, TextField, Typography } from "@mui/material";
import BetCard from "./BetCard";
import Bet from "../models/Bet";



const BetActions = ({ account, balance, updateBalance }: { account: string; balance: string; updateBalance: () => void }) => {
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [optionInput, setOptionInput] = useState("");
  const [bets, setBets] = useState<Bet[]>([]);
  const [betCount, setBetCount] = useState<number>(0);

  useEffect(() => {
    fetchBetsCount();
    fetchBets();
  }, []);

  const fetchBetsCount = async () => {
    const count = await getBetsCount();
    setBetCount(count);
  };

  const fetchBets = async () => {
    const fetchedBets = await getBetsAddresses(10, 0); // Fetch first 10 bets
    if (!fetchedBets) {
      return;
    }

    try {
      // Wait for all bet details to resolve
      const betsDetails = await Promise.all(
        fetchedBets.map(async (bet: string) => {
          const betDetails = await getBetDetails(bet);
          return betDetails;
        })
      );

      setBets(betsDetails);
    } catch (error: any) {
      console.error("Error fetching bet details:", error.message);
    }
  };

  const handleCreateBet = async () => {
    if (!title || options.length < 2 || options.length > 8) {
      alert("Please enter a title and at least two options or maximum 8 options.");
      return;
    }

    await createBet(title, options);
    setTitle("");
    setOptions([]);
    setOptionInput("");
    fetchBetsCount();  // Refresh bet count
    fetchBets();       // Refresh bets list
    updateBalance();
  };

  const handleAddOption = () => {
    if (optionInput.trim()) {
      setOptions([...options, optionInput.trim()]);
      setOptionInput("");
    }
  };

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
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Create a Bet
      </Typography>
      <Box sx={{ marginBottom: 3 }}>
        <TextField
          label="Bet Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Bet Option"
          value={optionInput}
          onChange={(e) => setOptionInput(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={handleAddOption}>
          Add Option
        </Button>
        <Typography variant="h6" sx={{ marginTop: 2 }}>
          Options:
        </Typography>
        <Box>
          {options.map((option, index) => (
            <Typography key={index} variant="body1">
              - {option}
            </Typography>
          ))}
        </Box>
      </Box>
      <Button variant="contained" color="success" onClick={handleCreateBet}>
        Create Bet
      </Button>

      <Typography variant="h5" sx={{ marginTop: 4 }}>
        Total Bets: {betCount}
      </Typography>
      <Box>
        <Typography variant="h5" gutterBottom>
          Existing Bets:
        </Typography>
        {bets.map((bet, index) => (
          <BetCard key={index} name={bet.name} options={bet.options} address={bet.address} userBalance={balance} onPlaceBet={handlePlaceBet} />
        ))}
      </Box>
    </Box>
  );
};

export default BetActions;
