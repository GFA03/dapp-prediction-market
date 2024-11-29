import React from "react";
import { Button, Card, CardContent, Typography } from "@mui/material";
import { StatusColors, StatusLabels } from "../models/types";
import { useSelector } from "react-redux";
import { RootState } from "../utils/store";
import { selectBetByAddress } from "../utils/betSlice";

type MyBetCardProps = {
  betAddress: string;
  chosenOption: number;
  amount: number;
  balanceToWithdraw: number;
  onCashback: () => void;
  onWithdraw: () => void;
};

const MyBetCard: React.FC<MyBetCardProps> = ({
  betAddress,
  chosenOption,
  amount,
  balanceToWithdraw,
  onCashback,
  onWithdraw,
}) => {
  const betDetails = useSelector((state: RootState) => selectBetByAddress(state, betAddress));
  if (!betDetails) return null;
  const { name, options, status } = betDetails;
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg p-4">
      <CardContent>
        <Typography variant="h6" className="font-bold text-gray-800 mb-2">
          {name}
        </Typography>
        <Typography
          variant="body2"
          className={`font-bold ${
            StatusColors[status as keyof typeof StatusColors]
          }`}
        >
          Status: {StatusLabels[status as keyof typeof StatusLabels]}
        </Typography>
        <Typography className="text-sm text-gray-600 mb-4">
          <span className="font-medium">Options:</span> {options.join(", ")}
        </Typography>
        <Typography className="text-sm text-gray-600 mb-4">
          <span className="font-medium">Your Choice:</span> {options[chosenOption]}
        </Typography>
        <Typography className="text-sm text-gray-600 mb-4">
          <span className="font-medium">Bet Amount:</span> {amount} wei
        </Typography>
        {balanceToWithdraw === 0 ? (
          <Button
            variant="contained"
            color="primary"
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white"
            onClick={onCashback}
          >
            Cashback
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white"
            onClick={onWithdraw}
          >
            Withdraw: {balanceToWithdraw} wei
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MyBetCard;
