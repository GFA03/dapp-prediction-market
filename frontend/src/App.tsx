import React, { useEffect, useState } from "react";
import { getBalance, requestAccount } from "./utils/contractServices";
import { ToastContainer } from "react-toastify";
import ConnectWalletPage from "./pages/ConnectWalletPage";
import Dashboard from "./pages/Dashboard";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import AllBets from "./pages/AllBets";
import MyBets from "./pages/MyBets";
import "./index.css";
import { AppBar, Tab, Tabs, Toolbar, Typography } from "@mui/material";
import EventListener from "./EventListener";

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");


  useEffect(() => {
    const fetchCurAccount = async () => {
      const account = await requestAccount();
      setAccount(account);
    };
    fetchCurAccount();
  }, []);

  useEffect(() => {
    const handleAccountChanged = (newAccounts: any) =>
      setAccount(newAccounts.length > 0 ? newAccounts[0] : null);

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountChanged);
    }
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountChanged);
    };
  });

  useEffect(() => {
    const fetchBalance = async () => {
      if (!account) {
        return;
      }
      const balance = await getBalance(account);
      setBalance(balance || "0");
    };
    fetchBalance();
  }, [account]);

  const updateBalance = async () => {
    if (!account) {
      return;
    }
    const balance = await getBalance(account);
    setBalance(balance || "0");
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <ToastContainer />

        <EventListener />
        {!account ? (
          <ConnectWalletPage setAccount={setAccount} />
        ) : (
          <>
            <AppBar position="static" className="bg-blue-600">
              <Toolbar>
                <Typography variant="h6" className="flex-grow">
                  Betting DApp
                </Typography>
                <Tabs
                  value={false}
                  textColor="inherit"
                  indicatorColor="secondary"
                >
                  <Tab label="Dashboard" to="/" component={Link} />
                  <Tab label="All Bets" to="/all-bets" component={Link} />
                  <Tab label="My Bets" to="/my-bets" component={Link} />
                </Tabs>
              </Toolbar>
            </AppBar>
            <Routes>
              <Route
                path="/"
                element={
                  <Dashboard
                    account={account}
                    balance={balance}
                    updateBalance={updateBalance}
                  />
                }
              />
              <Route
                path="/all-bets"
                element={
                  <AllBets
                    account={account}
                    balance={balance}
                    updateBalance={updateBalance}
                  />
                }
              />
              <Route path="/my-bets" element={<MyBets account={account} updateBalance={updateBalance} />} />
            </Routes>
          </>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
