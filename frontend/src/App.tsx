import React, { useEffect, useState } from "react";
import { getBalance, requestAccount } from "./utils/contractServices";
import { ToastContainer } from "react-toastify";
import ConnectWalletPage from "./components/ConnectWalletPage";
import Dashboard from "./components/Dashboard";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import AllBets from "./components/AllBets";
import MyBets from "./components/MyBets";
import "./index.css";

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
        return
      }
      const balance = await getBalance(account);
      setBalance(balance || "0");
    };
    fetchBalance();
  }, [account]);

  const updateBalance = async () => {
    if (!account) {
      return
    }
    const balance = await getBalance(account);
    setBalance(balance || "0");
  };

  return (
    <BrowserRouter>
      <div className="app">
        <ToastContainer />
        {!account ? (
          <ConnectWalletPage setAccount={setAccount} />
        ) : (
          <>
            <nav style={{ display: "flex", justifyContent: "space-around", padding: "10px", background: "#f4f4f4" }}>
              <Link to="/">Dashboard</Link>
              <Link to="/all-bets">All Bets</Link>
              <Link to="/my-bets">My Bets</Link>
              <Link to="/created-bets">Created Bets</Link>
            </nav>
            <Routes>
              <Route path="/" element={<Dashboard account={account} balance={balance} updateBalance={updateBalance} />} />
              <Route path="/all-bets" element={<AllBets account={account} balance={balance} updateBalance={updateBalance} />} />
              <Route path="/my-bets" element={<MyBets account={account} />} />
              {/* <Route path="/created-bets" element={<CreatedBets account={account} />} /> */}
            </Routes>
          </>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
