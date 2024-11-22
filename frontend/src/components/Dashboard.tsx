import { useState, useEffect } from "react";
import BetFactoryInfo from "./BetFactoryInfo";
import BetActions from "./BetActions";
import { getBalance } from "../utils/contractServices";

const Dashboard = ({ account }: { account: string }) => {
  const [balance, setBalance] = useState<string>("0");

  // Fetch balance when account changes
  useEffect(() => {
    const fetchBalance = async () => {
      const balance = await getBalance(account);
      setBalance(balance || "0");
    };
    fetchBalance();
  }, [account]);

  // Callback to update balance
  const updateBalance = async () => {
    const balance = await getBalance(account);
    setBalance(balance || "0");
  };

  return (
    <div>
      <BetFactoryInfo account={account} balance={balance} />
      <BetActions account={account} balance={balance} updateBalance={updateBalance} />
    </div>
  );
};

export default Dashboard;
