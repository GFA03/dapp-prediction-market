import React, { useEffect, useState } from "react";
import { getBetsCount } from "../utils/contractServices";

function ContractInfo({ account }: { account: string }) {
  const [betsCount, setBetsCount] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      const betsCount = await getBetsCount();
      setBetsCount(betsCount);
    };
    fetchBalance();
  }, []);

  return (
    <div>
      <h2>Contract Bets: {betsCount == null ? 0 : betsCount} bets created</h2>
      <p>Connected Account: {account}</p>
    </div>
  );
}

export default ContractInfo;