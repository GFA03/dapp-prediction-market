import { Box } from "@mui/material";
import BetFactoryInfo from "../components/BetFactoryInfo";
import CreateBet from "../components/CreateBet";

const Dashboard = ({ account, balance, updateBalance }: { account: string; balance: string; updateBalance: () => void }) => {
  return (
    <Box p={3}>
      <BetFactoryInfo account={account} balance={balance} />
      <CreateBet updateBalance={updateBalance} />
    </Box>
  );
};

export default Dashboard;
