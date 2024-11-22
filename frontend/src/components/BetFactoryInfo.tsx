function BetFactoryInfo({ account, balance }: { account: string; balance: string }) {
  return (
    <div>
      <h2>Contract Info</h2>
      <p>Connected Account: {account}</p>
      <p>Balance: {balance} ETH</p>
    </div>
  );
}

export default BetFactoryInfo;