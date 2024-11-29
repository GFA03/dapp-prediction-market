import React, { useState, useEffect } from "react";
import { createBet, getBetsCount } from "../utils/contractServices";
import { Box, Button, TextField, Typography } from "@mui/material";

const BetActions = ({
  account,
  balance,
  updateBalance,
}: {
  account: string;
  balance: string;
  updateBalance: () => void;
}) => {
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
      alert(
        "Please enter a title and at least two options or maximum 8 options."
      );
      return;
    }

    await createBet(title, options);
    setTitle("");
    setOptions([]);
    setOptionInput("");
    fetchBetsCount(); // Refresh bet count
    updateBalance();
  };

  const handleAddOption = () => {
    if (optionInput.trim()) {
      setOptions([...options, optionInput.trim()]);
      setOptionInput("");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      handleAddOption();
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Create a Bet
      </Typography>
      <TextField
        label="Bet Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Option"
        value={optionInput}
        onChange={(e) => setOptionInput(e.target.value)}
        onKeyDown={handleKeyDown}
        fullWidth
        margin="normal"
      />
      <Button
        variant="outlined"
        color="primary"
        onClick={handleAddOption}
        className="mt-2"
      >
        Add Option
      </Button>
      <Box mt={2}>
        {options.map((option, idx) => (
          <Typography key={idx} variant="body1">
            - {option}
          </Typography>
        ))}
      </Box>
      <Button
        variant="contained"
        color="success"
        onClick={handleCreateBet}
        sx={{ marginTop: 2 }}
      >
        Create Bet
      </Button>
      <Typography variant="h6" mt={3}>
        Total Bets: {betCount}
      </Typography>
    </Box>
  );
};

export default BetActions;
