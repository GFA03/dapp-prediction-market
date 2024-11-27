import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BetState } from "../models/types";
import { RootState } from "../store";
import { createSelector } from "reselect";

const initialState: BetState = {
  bets: {},
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
      state.bets[betAddress] = {
        ownerAddress,
        name,
        options,
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
      if (state.bets[betAddress]) {
        state.bets[betAddress].bettors[bettorAddress] = {
          option,
          amount,
        };
      }
    },
  },
});

const selectBets = (state: RootState) => state.bets.bets;

export const selectBetsAfterOwner = createSelector(
  [selectBets, (_: RootState, ownerAddress: string) => ownerAddress],
  (bets, ownerAddress) =>
    Object.entries(bets)
      .filter(
        ([, bet]) =>
          bet.ownerAddress.toLowerCase() === ownerAddress.toLowerCase()
      )
      .map(([address, bet]) => ({ address, ...bet }))
);

export const { addBet, addBettor } = betSlice.actions;
export default betSlice.reducer;
