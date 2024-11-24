import BetFactoryInfo from "./BetFactoryInfo";
import BetActions from "./BetActions";

const Dashboard = ({ account, balance, updateBalance }: { account: string; balance: string; updateBalance: () => void }) => {

  return (
    <div>
      <BetFactoryInfo account={account} balance={balance} />
      <BetActions account={account} balance={balance} updateBalance={updateBalance} />
    </div>
  );
};

export default Dashboard;
