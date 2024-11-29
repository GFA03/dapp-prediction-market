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

export enum BetStatus {
  Open = 0,
  Closed = 1,
  Canceled = 2,
  Finished = 3,
}

export interface Bettor {
  option: number;
  amount: number;
}

export interface Bet {
  ownerAddress: string;
  name: string;
  options: string[];
  winningOption: number;
  status: number; 
  bettors: Record<string, Bettor>; // Bettor address as key
}

export interface BetState {
  bets: Record<string, Bet>; // Bet address as key
  userBets: {
    [userAddress: string]: Array<{
      betAddress: string;
      option: number;
      amount: number;
    }>;
  }; // Bet address as key
}