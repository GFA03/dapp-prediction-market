import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

function BetFactoryInfo({ account, balance }: { account: string; balance: string }) {
  return (
    <Card sx={{ marginBottom: 3 }}>
      <CardContent>
        <Typography variant="h6">Contract Info</Typography>
        <Typography>Connected Account: {account}</Typography>
        <Typography>Balance: {balance} ETH</Typography>
      </CardContent>
    </Card>
  );
}

export default BetFactoryInfo;
