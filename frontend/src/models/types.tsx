export type Bet = {
  name: string;
  options: string[];
  status: number;
  address: string;
};

export type UserBet = {
  address: string;
  name: string;
  options: string[];
  status: number;
  balanceToWithdraw: number;
  betData: number[]; // [chosenOption, amount]
};

export const StatusColors = {
  0: "text-green-500", // Open
  1: "text-gray-500", // Closed
  2: "text-red-500", // Canceled
  3: "text-blue-500", // Finished
};

export const StatusLabels = {
  0: "Open",
  1: "Closed",
  2: "Canceled",
  3: "Finished",
};

export interface Bettor {
  option: number;
  amount: number;
}

export interface Bettt {
  ownerAddress: string;
  name: string;
  options: string[];
  status: number; 
  bettors: Record<string, Bettor>; // Bettor address as key
}

export interface BetState {
  bets: Record<string, Bettt>; // Bet address as key
}