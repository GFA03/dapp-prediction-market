import { Box } from "@mui/material";
import BetFactoryInfo from "./BetFactoryInfo";
import BetActions from "./BetActions";

const Dashboard = ({ account, balance, updateBalance }: { account: string; balance: string; updateBalance: () => void }) => {
  return (
    <Box p={3}>
      <BetFactoryInfo account={account} balance={balance} />
      <BetActions updateBalance={updateBalance} />
    </Box>
  );
};

export default Dashboard;
