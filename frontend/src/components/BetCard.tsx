import React from "react";
import { Card, CardContent, Typography, List, ListItem } from "@mui/material";

type BetCardProps = {
  name: string;
  options: string[];
};

const BetCard: React.FC<BetCardProps> = ({ name, options }) => {
  return (
    <Card
      sx={{
        margin: 2,
        padding: 2,
        boxShadow: 3,
        maxWidth: 400,
      }}
    >
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Options:
        </Typography>
        <List>
          {options.map((option, index) => (
            <ListItem key={index} sx={{ paddingLeft: 0 }}>
              - {option}
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default BetCard;
