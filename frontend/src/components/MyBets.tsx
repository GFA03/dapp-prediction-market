import React, { useEffect, useState } from "react";
import { cashbackBet, fetchUserBets, fetchUserHistoryBets, withdrawBet } from "../utils/contractServices";
import MyBetCard from "./MyBetCard";
import { CircularProgress, Grid, Tab, Tabs, Typography } from "@mui/material";
import { UserBet } from "../models/types";
import FinishedBetCard from "./FinishedBetCard";

const MyBets = ({ account }: { account: string }) => {
  const [myBets, setMyBets] = useState<UserBet[]>([]);
  const [myHistoryBets, setMyHistoryBets] = useState<UserBet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<number>(0);

  useEffect(() => {
    const loadUserBets = async () => {
      try {
        if (selectedTab === 0) {
          const bets = await fetchUserBets(account);
          setMyBets(bets);
        } else if (selectedTab === 1) {
          const history = await fetchUserHistoryBets(account);
          setMyHistoryBets(history);
        }
      } catch (error) {
        console.error("Error fetching user bets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (account) {
      loadUserBets();
    }
  }, [account, selectedTab]);

  const handleCashback = async (betAddress: string) => {
    console.log(`Cashback triggered for bet contract: ${betAddress}`);
    try {
      const success = await cashbackBet(account, betAddress);
      if (success) {
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
        alert("Withdraw successful!");
      }
    } catch (error) {
      console.error("Error withdrawing bet ⭕", error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const renderUserBets = (betsToRender: UserBet[]) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <CircularProgress />
        </div>
      );
    }

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
              name={bet.name}
              options={bet.options}
              status={bet.status}
              balanceToWithdraw={bet.balanceToWithdraw}
              chosenOption={bet.options[Number(bet.betData[0])]}
              amount={Number(bet.betData[1])}
              onCashback={() => handleCashback(bet.address)}
              onWithdraw={() => handleWithdraw(bet.address)}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderUserHistoryBets = (betsToRender: UserBet[]) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <CircularProgress />
        </div>
      );
    }

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
          const chosenOption = bet.options[Number(bet.betData[0])];
          const amount = Number(bet.betData[1]);
          //todo: Implement logic to determine if the user won the bet
          const won = amount > 0;
  
          return (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <FinishedBetCard
                name={bet.name}
                status={bet.status} // Mapping numeric status to a readable label
                chosenOption={chosenOption}
                won={won}
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
