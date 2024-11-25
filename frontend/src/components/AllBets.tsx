import React, { useEffect, useState } from "react";
import {
  getBetsAddresses,
  getBetDetails,
  fetchCreatedBets,
  placeBet,
} from "../utils/contractServices";
import BetCard from "./BetCard";
import { Bet } from "../models/Bet";
import {
  Container,
  Typography,
  Grid,
  CircularProgress,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import CreatedBetCard from "./CreatedBetCard";

const AllBets = ({
  account,
  balance,
  updateBalance,
}: {
  account: string;
  balance: string;
  updateBalance: () => void;
}) => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [createdBets, setCreatedBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<number>(0);

  useEffect(() => {
    const fetchBets = async () => {
      setLoading(true);
      try {
        if (selectedTab === 0) {
          const addresses = await getBetsAddresses(10, 0);
          const details = await Promise.all(
            addresses.map(async (addr: string) => await getBetDetails(addr))
          );
          setBets(details);
        } else if (selectedTab === 1) {
          const details = await fetchCreatedBets(account);
          setCreatedBets(details);
        }
      } catch (error) {
        console.error("Failed to fetch bets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBets();
  }, [selectedTab, account]);

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

  const renderBets = (betsToRender: Bet[]) => {
    if (loading) {
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
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <BetCard
              {...bet}
              userBalance={balance}
              onPlaceBet={handlePlaceBet}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderCreatedBets = (betsToRender: Bet[]) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <CircularProgress />
        </div>
      );
    }
  
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
            <CreatedBetCard {...bet} />
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
          <Tab label="My Bets" />
        </Tabs>
      </Box>
      {selectedTab === 0 ? renderBets(bets) : renderCreatedBets(createdBets)}
    </Container>
  );
};

export default AllBets;
