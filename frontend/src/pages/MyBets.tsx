import React, { useState } from "react";
import {
  cashbackBet,
  withdrawBet,
} from "../utils/contractServices";
import MyBetCard from "../components/MyBetCard";
import { Grid, Tab, Tabs, Typography } from "@mui/material";
import FinishedBetCard from "../components/FinishedBetCard";
import { useSelector } from "react-redux";
import { RootState } from "../utils/store";
import { selectUserActiveBets, selectUserHistoryBets } from "../utils/betSlice";

const MyBets = ({ account, updateBalance }: { account: string; updateBalance: () => void }) => {
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const myBets = useSelector((state: RootState) =>
    selectUserActiveBets(state, account)
  );

  const myHistoryBets = useSelector((state: RootState) =>
    selectUserHistoryBets(state, account)
  );

  const handleCashback = async (betAddress: string) => {
    console.log(`Cashback triggered for bet contract: ${betAddress}`);
    try {
      const success = await cashbackBet(account, betAddress);
      if (success) {
        updateBalance();
        alert("Cashback successful!");
      }
    } catch (error) {
      console.error("Error cashing back bet:", error);
    }
  };

  const handleWithdraw = async (betAddress: string) => {
    console.log(`Withdraw triggered for bet contract: ${betAddress}`);
    try {
      const success = await withdrawBet(account, betAddress);
      if (success) {
        updateBalance();
        alert("Withdraw successful!");
      }
    } catch (error) {
      console.error("Error withdrawing bet ⭕", error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const renderUserBets = (betsToRender: {
    betAddress: string;
    option: number;
    amount: number;
    toWithdraw: number;
}[]) => {
    if (betsToRender.length === 0) {
      return (
        <Typography variant="h6" className="text-center text-gray-500">
          No bets available at the moment.
        </Typography>
      );
    }

    return (
      <Grid container spacing={4}>
        {betsToRender.map((bet, idx) => (
          <Grid item xs key={idx}>
            <MyBetCard
              key={idx}
              betAddress={bet.betAddress}
              chosenOption={Number(bet.option)}
              amount={bet.amount}
              balanceToWithdraw={bet.toWithdraw}
              onCashback={() => handleCashback(bet.betAddress)}
              onWithdraw={() => handleWithdraw(bet.betAddress)}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderUserHistoryBets = (betsToRender: {
    betAddress: string;
    option: number;
    amount: number;
}[]) => {
    if (betsToRender.length === 0) {
      return (
        <Typography variant="h6" className="text-center text-gray-500">
          No bets available at the moment.
        </Typography>
      );
    }

    return (
      <Grid container spacing={4}>
        {betsToRender.map((bet, idx) => {
          return (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <FinishedBetCard
                betAddress={bet.betAddress}
                chosenOption={Number(bet.option)}
                amount={bet.amount}
              />
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">My Bets</h1>
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        aria-label="My Bets Tabs"
        centered
      >
        <Tab label="Active Bets" />
        <Tab label="History" />
      </Tabs>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedTab === 0
          ? renderUserBets(myBets)
          : renderUserHistoryBets(myHistoryBets)}
      </div>
    </div>
  );
};

export default MyBets;
