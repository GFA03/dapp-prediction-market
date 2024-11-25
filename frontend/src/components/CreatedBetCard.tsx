import React, { useState } from "react";
import {
  closeBet,
  cancelBet,
  setWinner,
} from "../utils/contractServices";
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
} from "@mui/material";

const CreatedBetCard = ({
  address,
  name,
  options,
}: {
  address: string;
  name: string;
  options: string[];
}) => {
  const [winnerOption, setWinnerOption] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
    if (winnerOption === null || winnerOption < 0 || winnerOption >= options.length) {
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
        <Typography variant="body2" color="text.secondary">
          Options: {options.join(", ")}
        </Typography>
        <div style={{ marginTop: "1rem" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleClose}
            disabled={loading}
          >
            Close Bet
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleCancel}
            disabled={loading}
            style={{ marginLeft: "1rem" }}
          >
            Cancel Bet
          </Button>
          <div style={{ marginTop: "1rem" }}>
            <TextField
              type="number"
              label="Winning Option"
              value={winnerOption ?? ""}
              onChange={(e) => setWinnerOption(Number(e.target.value))}
              disabled={loading}
            />
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
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatedBetCard;
