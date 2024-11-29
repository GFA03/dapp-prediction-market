import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BetState, BetStatus } from "../models/types";
import { RootState } from "../store";
import { createSelector } from "reselect";

const initialState: BetState = {
  bets: {},
  userBets: {},
};

const betSlice = createSlice({
  name: "bets",
  initialState,
  reducers: {
    addBet: (
      state,
      action: PayloadAction<{
        betAddress: string;
        ownerAddress: string;
        name: string;
        options: string[];
        status: number;
      }>
    ) => {
      const { betAddress, ownerAddress, name, options, status } =
        action.payload;
      state.bets[betAddress.toLowerCase()] = {
        ownerAddress: ownerAddress.toLowerCase(),
        name,
        options,
        winningOption: -1,
        status,
        bettors: {},
      };
    },
    addBettor: (
      state,
      action: PayloadAction<{
        betAddress: string;
        bettorAddress: string;
        option: number;
        amount: number;
      }>
    ) => {
      const { betAddress, bettorAddress, option, amount } = action.payload;
      const normalizedBetAddress = betAddress.toLowerCase();
      if (state.bets[normalizedBetAddress]) {
        state.bets[normalizedBetAddress].bettors[bettorAddress.toLowerCase()] = {
          option,
          amount,
        };
      }
    },
    addUserBet: (
      state,
      action: PayloadAction<{
        userAddress: string;
        betAddress: string;
        option: number;
        amount: number;
      }>
    ) => {
      const { userAddress, betAddress, option, amount } = action.payload;

      const normalizedUserAddress = userAddress.toLowerCase();
    
      if (!state.userBets[normalizedUserAddress]) {
        state.userBets[normalizedUserAddress] = [];
      }
    
      state.userBets[normalizedUserAddress].push({ betAddress: betAddress.toLowerCase(), option, amount });
    },
    closeBet: (state, action: PayloadAction<string>) => {
      const betAddress = action.payload;
      const bet = state.bets[betAddress.toLowerCase()];
      if (bet) {
        bet.status = BetStatus.Closed;
      }
    },
    cancelBet: (state, action: PayloadAction<string>) => {
      const betAddress = action.payload;
      const bet = state.bets[betAddress.toLowerCase()];
      if (bet) {
        bet.status = BetStatus.Canceled;
      }
    },
    setWinner: (state, action: PayloadAction<{ betAddress: string; winningOption: number }>) => {
      const { betAddress, winningOption } = action.payload;
      const normalizedBetAddress = betAddress.toLowerCase();
      const bet = state.bets[normalizedBetAddress];
      if (bet) {
        bet.winningOption = winningOption;
      }
    }
  },
});

const selectBets = (state: RootState) => state.bets.bets;

export const selectBetByAddress = createSelector(
  [selectBets, (_: RootState, betAddress: string) => betAddress.toLowerCase()],
  (bets, normalizedBetAddress) => {
    const bet = bets[normalizedBetAddress];
    if (!bet) return null;
    return bet;
  }
);

export const selectBetsAfterOwner = createSelector(
  [selectBets, (_: RootState, ownerAddress: string) => ownerAddress],
  (bets, ownerAddress) => {
    return Object.entries(bets)
      .filter(
        ([, bet]) =>
          bet.ownerAddress.toLowerCase() === ownerAddress.toLowerCase()
      )
      .map(([address, bet]) => ({ address, ...bet }));
  }
);

export const selectOpenBets = createSelector(
  [selectBets, (_: RootState) => _],
  (bets) => {
    return Object.entries(bets)
      .filter(([, bet]) => bet.status === BetStatus.Open)
      .map(([address, bet]) => ({ betAddress: address, ...bet }));
  }
)

export const selectUserActiveBets = createSelector(
  [
    (state: RootState) => state.bets,
    (_: RootState, userAddress: string) => userAddress,
  ],
  (state, userAddress) => {
    const userBets = state.userBets;
    const bets = state.bets;
    if (!userBets[userAddress.toLowerCase()]) return [];
    return userBets[userAddress.toLowerCase()].filter(
      (bet) => 
        bets[bet.betAddress.toLowerCase()].status === BetStatus.Open || bets[bet.betAddress.toLowerCase()].status === BetStatus.Closed
    ) || [];
  }
);

export const selectUserHistoryBets = createSelector(
  [
    (state: RootState) => state.bets,
    (_: RootState, userAddress: string) => userAddress,
  ],
  (state, userAddress) => {
    const userBets = state.userBets;
    const bets = state.bets;
    if (!userBets[userAddress.toLowerCase()]) return [];
    return userBets[userAddress.toLowerCase()].filter(
      (bet) => 
        bets[bet.betAddress.toLowerCase()].status === BetStatus.Canceled || bets[bet.betAddress.toLowerCase()].status === BetStatus.Finished
    ) || [];
  }
);

export const { addBet, addBettor, addUserBet, closeBet, cancelBet, setWinner } = betSlice.actions;
export default betSlice.reducer;
