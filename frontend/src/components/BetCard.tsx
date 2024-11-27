import React, { useState } from "react";
import { Card, CardContent, Typography, Button, Grid, TextField, Box } from "@mui/material";
import { StatusColors, StatusLabels } from "../models/types";

type BetCardProps = {
  name: string;
  options: string[];
  status: number;
  address: string;
  userBalance: string;
  onPlaceBet: (address: string, option: number, amount: string) => void;
};

const BetCard: React.FC<BetCardProps> = ({
  name,
  options,
  status,
  address,
  userBalance,
  onPlaceBet,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState<string>("");

  const handleOptionClick = (option: number) => {
    setSelectedOption(option);
    setBetAmount(""); // Reset the amount field when switching options
  };

  const handlePlaceBet = () => {
    if (!betAmount || parseFloat(betAmount) <= 0) {
      alert("Please enter a valid amount to bet.");
      return;
    }
    onPlaceBet(address, selectedOption!, betAmount);
    setSelectedOption(null); // Hide the input after placing a bet
  };

  return (
    <Card
      sx={{
        margin: 2,
        padding: 2,
        boxShadow: 3,
        maxWidth: 400,
        textAlign: "center",
      }}
    >
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {name}
        </Typography>

        <Typography
          variant="body2"
          className={`font-bold ${StatusColors[status as keyof typeof StatusColors]}`}
        >
          Status: {StatusLabels[status as keyof typeof StatusLabels]}
        </Typography>

        <Grid container spacing={2} style={{ marginTop: "1rem" }}>
          {options.map((option, index) => (
            <Grid item xs={6} key={index}>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={() => handleOptionClick(index)}
              >
                {option}
              </Button>
            </Grid>
          ))}
        </Grid>

        {selectedOption != null && (
          <Box mt={2}>
            <Typography variant="subtitle1" color="text.secondary">
              Your balance: {userBalance} ETH
            </Typography>
            <TextField
              label="Bet Amount (ETH)"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={handlePlaceBet}
            >
              Place Bet on "{options[selectedOption]}"
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default BetCard;
