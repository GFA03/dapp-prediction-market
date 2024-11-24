import React, { useState, useEffect } from "react";
import { createBet, getBetsCount } from "../utils/contractServices";
import { Box, Button, TextField, Typography } from "@mui/material";



const BetActions = ({ account, balance, updateBalance }: { account: string; balance: string; updateBalance: () => void }) => {
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [optionInput, setOptionInput] = useState("");
  const [betCount, setBetCount] = useState<number>(0);

  useEffect(() => {
    fetchBetsCount();
  }, []);

  const fetchBetsCount = async () => {
    const count = await getBetsCount();
    setBetCount(count);
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
    updateBalance();
  };

  const handleAddOption = () => {
    if (optionInput.trim()) {
      setOptions([...options, optionInput.trim()]);
      setOptionInput("");
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
    </Box>
  );
};

export default BetActions;
