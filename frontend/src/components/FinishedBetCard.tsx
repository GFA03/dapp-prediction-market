import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { StatusLabels } from "../models/types";
import { useSelector } from "react-redux";
import { selectBetByAddress } from "../utils/betSlice";
import { RootState } from "../store";

type FinishedBetCardProps = {
  betAddress: string;
  chosenOption: number;
  amount: number;
};

const FinishedBetCard: React.FC<FinishedBetCardProps> = ({
  betAddress,
  chosenOption,
  amount,
}) => {
  const betDetails = useSelector((state: RootState) => selectBetByAddress(state, betAddress));
  if (!betDetails) return null;
  const { name, options, status, winningOption } = betDetails;
  const won = winningOption === chosenOption;
  return (
    <Card
      className={`shadow-lg rounded-lg transition-transform hover:scale-105 ${
        won ? "border-2 border-green-500" : "border-2 border-red-500"
      }`}
    >
      <CardContent>
        <Typography
          variant="h5"
          className="font-bold text-gray-800 mb-2 text-center"
        >
          {name}
        </Typography>
        <Typography
          variant="body2"
          className={`text-center ${
            StatusLabels[status as keyof typeof StatusLabels] === "Finished" ? "text-blue-500" : "text-gray-500"
          }`}
        >
          Status: {StatusLabels[status as keyof typeof StatusLabels]}
        </Typography>
        <Typography variant="body1" className="text-center text-gray-700 mt-4">
          Your Option: <span className="font-medium">{options[chosenOption]}</span>
        </Typography>
        <Typography
          variant="body1"
          className={`text-center font-semibold mt-2 ${
            won ? "text-green-500" : "text-red-500"
          }`}
        >
          {won ? "You Won!" : "You Lost"}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default FinishedBetCard;
