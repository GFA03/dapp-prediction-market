import React, { useEffect, useState } from "react";
import { getBalance, getBetsCount } from "../utils/contractServices";

function ContractInfo({ account }: { account: string }) {
  const [betsCount, setBetsCount] = useState(null);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    const fetchBets = async () => {
      const betsCount = await getBetsCount();
      console.log(`There are currently: ${betsCount} bets`);
      setBetsCount(betsCount);
    };
    fetchBets();
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      const balance = await getBalance(account);
      console.log(`Balance for account ${account}: ${balance}`);
      setBalance(balance);
    };
    fetchBalance();
  }, [account]);

  return (
    <div>
      <h2>Contract Bets: {betsCount === null ? 0 : betsCount} bets created</h2>
      <p>Connected Account: {account}</p>
      <p>Balance: {balance ?? 0} ETH</p>
    </div>
  );
}

export default ContractInfo;