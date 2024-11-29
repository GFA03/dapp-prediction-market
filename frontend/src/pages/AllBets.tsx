import React, { useState } from "react";
import { placeBet } from "../utils/contractServices";
import BetCard from "../components/BetCard";
import { Container, Typography, Grid, Tabs, Tab, Box } from "@mui/material";
import CreatedBetCard from "../components/CreatedBetCard";
import { useSelector } from "react-redux";
import { RootState } from "../utils/store";
import { selectBetsAfterOwner, selectOpenBets } from "../utils/betSlice";
import { Bettor } from "../models/types";

const AllBets = ({
  account,
  balance,
  updateBalance,
}: {
  account: string;
  balance: string;
  updateBalance: () => void;
}) => {
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const bets = useSelector((state: RootState) => selectOpenBets(state));
  const createdBets = useSelector((state: RootState) =>
    selectBetsAfterOwner(state, account)
  );

  const handlePlaceBet = async (
    address: string,
    option: number,
    amount: string
  ) => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid bet amount.");
      return;
    }

    const success = await placeBet(address, option, amount);
    if (success) {
      alert(`Bet placed successfully on option ${option}!`);
      updateBalance(); // Refresh user's balance
    } else {
      alert("Failed to place bet. Please try again.");
    }
  };

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };

  const renderBets = (
    betsToRender: {
      ownerAddress: string;
      name: string;
      options: string[];
      status: number;
      bettors: Record<string, Bettor>;
      betAddress: string;
    }[]
  ) => {
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
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <BetCard
              bet={bet}
              userBalance={balance}
              onPlaceBet={handlePlaceBet}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderCreatedBets = (
    betsToRender: {
      address: string;
      name: string;
      options: string[];
      status: number;
    }[]
  ) => {
    if (betsToRender.length === 0) {
      return (
        <Typography variant="h6" className="text-center text-gray-500">
          No created bets available at the moment.
        </Typography>
      );
    }

    return (
      <Grid container spacing={4}>
        {betsToRender.map((bet, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <CreatedBetCard bet={bet} />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg" className="py-8">
      <Typography
        variant="h4"
        className="text-center font-bold text-blue-600 mb-4"
      >
        Bets
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          aria-label="Bets Tabs"
          centered
        >
          <Tab label="All Bets" />
          <Tab label="Created Bets" />
        </Tabs>
      </Box>
      {selectedTab === 0 ? renderBets(bets) : renderCreatedBets(createdBets)}
    </Container>
  );
};

export default AllBets;
