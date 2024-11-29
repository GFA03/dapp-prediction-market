import React, { useState } from "react";
import { createBet} from "../utils/contractServices";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { RootState } from "../store";
import { useSelector } from "react-redux";

const BetActions = ({
  updateBalance,
}: {
  updateBalance: () => void;
}) => {
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [optionInput, setOptionInput] = useState("");

  const betCount = useSelector((state: RootState) => 
    Object.keys(state.bets.bets).length
  );

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

  const handleDeleteOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Card
      sx={{
        maxWidth: 600,
        margin: "auto",
        marginTop: 4,
        padding: 3,
        boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      <CardContent>
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
          helperText="Press Enter to add an option."
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
          <List>
            {options.map((option, idx) => (
              <ListItem
                key={idx}
                divider
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <ListItemText primary={option} />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => handleDeleteOption(idx)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
        <Button
          variant="contained"
          color="success"
          onClick={handleCreateBet}
          sx={{ marginTop: 2 }}
          fullWidth
        >
          Create Bet
        </Button>
        <Typography variant="h6" mt={3}>
          Total Bets: {betCount}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default BetActions;
