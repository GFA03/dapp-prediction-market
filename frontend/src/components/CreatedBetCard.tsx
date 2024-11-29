import React, { useState } from "react";
import { closeBet, cancelBet, setWinner } from "../utils/contractServices";
import { Card, CardContent, Typography, Button, Grid } from "@mui/material";
import { StatusColors, StatusLabels } from "../models/types";

const CreatedBetCard = ({
  bet: { address, name, options, status },
}: {
  bet: {
    address: string;
    name: string;
    options: string[];
    status: number;
  };
}) => {
  const [winnerOption, setWinnerOption] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleToggleWinner = (index: number) => {
    // If the same option is clicked again, reset the winnerOption to null
    setWinnerOption((prev) => (prev === index ? null : index));
  };

  const handleClose = async () => {
    setLoading(true);
    const success = await closeBet(address);
    alert(success ? "Bet closed successfully!" : "Failed to close bet.");
    setLoading(false);
  };

  const handleCancel = async () => {
    setLoading(true);
    const success = await cancelBet(address);
    alert(success ? "Bet canceled successfully!" : "Failed to cancel bet.");
    setLoading(false);
  };

  const handleSetWinner = async () => {
    if (
      winnerOption === null ||
      winnerOption < 0 ||
      winnerOption >= options.length
    ) {
      alert("Please select a valid winning option.");
      return;
    }
    setLoading(true);
    const success = await setWinner(address, winnerOption);
    alert(success ? "Winner set successfully!" : "Failed to set winner.");
    setLoading(false);
  };

  return (
    <Card sx={{ margin: "1rem" }}>
      <CardContent>
        <Typography variant="h5">{name}</Typography>
        <Typography
          variant="body2"
          className={`font-bold ${
            StatusColors[status as keyof typeof StatusColors]
          }`}
        >
          Status: {StatusLabels[status as keyof typeof StatusLabels]}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Options: {options.join(", ")}
        </Typography>
        <div style={{ marginTop: "1rem" }}>
          {StatusLabels[status as keyof typeof StatusLabels] === "Open" ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleClose}
              disabled={loading}
            >
              Close Bet
            </Button>
          ) : null}
          {StatusLabels[status as keyof typeof StatusLabels] === "Open" ? (
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancel}
              disabled={loading}
              style={{ marginLeft: "1rem" }}
            >
              Cancel Bet
            </Button>
          ) : null}
          {StatusLabels[status as keyof typeof StatusLabels] === "Closed" ? (
            <div style={{ marginTop: "1rem" }}>
              <Typography variant="body1" color="text.secondary">Choose Winner:</Typography>
              <Grid
                container
                spacing={2}
                style={{ paddingBottom: "1rem" }}
              >
                {options.map((option, index) => (
                  <Grid item xs={6} key={index}>
                    <Button
                      variant={
                        winnerOption === index ? "contained" : "outlined"
                      }
                      color={winnerOption === index ? "success" : "primary"}
                      fullWidth
                      onClick={() => handleToggleWinner(index)}
                      disabled={loading}
                      className={winnerOption === index ? "bg-blue-500" : ""}
                    >
                      {option}
                    </Button>
                  </Grid>
                ))}
              </Grid>
              <Button
                variant="contained"
                color="success"
                onClick={handleSetWinner}
                disabled={loading}
                style={{ marginLeft: "1rem" }}
              >
                Set Winner
              </Button>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatedBetCard;
